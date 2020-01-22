import {
	DeviceType,
	TimelineContentTypeAtem,
	TimelineObjAtemAUX,
	TimelineObjAtemDSK,
	TimelineObjAtemME
} from 'timeline-state-resolver-types'
import {
	BlueprintResultPart,
	IBlueprintPieceGeneric,
	NotesContext,
	OnGenerateTimelineObj,
	SegmentContext,
	SourceLayerType,
	SplitsContent,
	TimelineObjectCoreExt,
	TimelineObjHoldMode
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../common/util'
import { BlueprintConfig } from '../tv2_afvd_studio/helpers/config'
import { AtemLLayer } from '../tv2_afvd_studio/layers'
import { TimelineBlueprintExt } from '../tv2_afvd_studio/onTimelineGenerate'
import { PartContext2 } from './getSegment'
import { SourceLayer } from './layers'

export function postProcessPartTimelineObjects(
	context: SegmentContext,
	config: BlueprintConfig,
	parts: BlueprintResultPart[]
) {
	_.each(parts, part => {
		const ctx = new PartContext2(context, part.part.externalId)
		_.each(part.pieces, p => postProcessPieceTimelineObjects(ctx, config, p, false))
		_.each(part.adLibPieces, p => postProcessPieceTimelineObjects(ctx, config, p, true))
	})
}

// Do any post-process of timeline objects
export function postProcessPieceTimelineObjects(
	context: NotesContext,
	config: BlueprintConfig,
	piece: IBlueprintPieceGeneric,
	isAdlib: boolean
) {
	if (piece.content?.timelineObjects) {
		const extraObjs: TimelineObjectCoreExt[] = []

		const atemMeObjs = (piece.content.timelineObjects as Array<
			TimelineObjAtemME & TimelineBlueprintExt & OnGenerateTimelineObj
		>).filter(
			obj =>
				obj.content && obj.content.deviceType === DeviceType.ATEM && obj.content.type === TimelineContentTypeAtem.ME
		)
		_.each(atemMeObjs, tlObj => {
			if (tlObj.layer === AtemLLayer.AtemMEProgram) {
				if (!tlObj.id) {
					tlObj.id = context.getHashId(AtemLLayer.AtemMEProgram, true)
				}
				if (!tlObj.metaData) {
					tlObj.metaData = {}
				}

				// Basic clone of every object to AtemMEClean
				const cleanObj = _.clone(tlObj) // Note: shallow clone
				cleanObj.layer = AtemLLayer.AtemMEClean
				cleanObj.id = '' // Force new id
				cleanObj.metaData = _.clone(tlObj.metaData)
				cleanObj.metaData.context = `Clean for ${tlObj.id}`
				cleanObj.classes = cleanObj.classes?.filter(c => !c.match(`studio0_parent_`))
				extraObjs.push(cleanObj)

				if (
					(!isAdlib || piece.toBeQueued) &&
					(tlObj.content.me.input !== undefined || tlObj.metaData?.mediaPlayerSession !== undefined)
				) {
					// Create a lookahead-lookahead object for this me-program
					const lookaheadObj = literal<TimelineObjAtemAUX & TimelineBlueprintExt>({
						id: '',
						enable: { start: 0 },
						priority: tlObj.holdMode === TimelineObjHoldMode.ONLY ? 5 : 0, // Must be below lookahead, except when forced by hold
						layer: AtemLLayer.AtemAuxLookahead,
						holdMode: tlObj.holdMode,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.AUX,
							aux: {
								input: tlObj.content.me.input !== undefined ? tlObj.content.me.input : config.studio.AtemSource.Default
							}
						},
						metaData: {
							context: `Lookahead-lookahead for ${tlObj.id}`,
							mediaPlayerSession: tlObj.metaData?.mediaPlayerSession // TODO - does this work the same?
						}
					})
					extraObjs.push(lookaheadObj)
				}

				// mix minus
				let mixMinusSource: number | undefined | null = tlObj.content.me.input // TODO - what about clips?
				if (piece.sourceLayerId === SourceLayer.PgmLive && !piece.name.match(/EVS ?\d+/i)) {
					// Never show live sources
					mixMinusSource = null
				}
				if (piece.sourceLayerId === SourceLayer.PgmDVE) {
					// If the dve has a single kam, show that. Otherwise fallback to default
					const pieceContent = piece.content as SplitsContent
					const kamSources = _.filter(
						pieceContent.boxSourceConfiguration || [],
						box => box.type === SourceLayerType.CAMERA
					)

					mixMinusSource = kamSources.length === 1 ? Number(kamSources[0].switcherInput) : null
				}
				if (mixMinusSource !== null) {
					const mixMinusObj = literal<TimelineObjAtemAUX & TimelineBlueprintExt>({
						..._.omit(tlObj, 'content'),
						...literal<Partial<TimelineObjAtemAUX & TimelineBlueprintExt>>({
							id: '',
							layer: AtemLLayer.AtemAuxVideoMixMinus,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.AUX,
								aux: {
									input: mixMinusSource !== undefined ? mixMinusSource : config.studio.AtemSource.MixMinusDefault
								}
							},
							metaData: {
								...tlObj.metaData,
								context: `Mix-minus for ${tlObj.id}`
							}
						})
					})
					mixMinusObj.classes = mixMinusObj.classes?.filter(c => !c.match(`studio0_parent_`))
					extraObjs.push(mixMinusObj)
				}
			}
		})

		const atemDskObjs = (piece.content.timelineObjects as TimelineObjAtemDSK[]).filter(
			obj =>
				obj.content && obj.content.deviceType === DeviceType.ATEM && obj.content.type === TimelineContentTypeAtem.DSK
		)
		_.each(atemDskObjs, tlObj => {
			if (tlObj.layer === AtemLLayer.AtemDSKEffect) {
				const newProps = _.pick(tlObj.content.dsk, 'onAir')
				if (_.isEqual(newProps, tlObj.content.dsk)) {
					context.warning(`Unhandled Keyer properties for Clean keyer, it may look wrong`)
				}

				const cleanObj = literal<TimelineObjAtemME & TimelineBlueprintExt>({
					..._.omit(tlObj, 'content'),
					...literal<Partial<TimelineObjAtemME & TimelineBlueprintExt>>({
						id: '',
						layer: AtemLLayer.AtemCleanUSKEffect,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								upstreamKeyers: [
									{
										upstreamKeyerId: 0
									},
									{
										upstreamKeyerId: 1,
										...newProps
									}
								]
							}
						}
					})
				})
				extraObjs.push(cleanObj)
			}
		})

		piece.content.timelineObjects = piece.content.timelineObjects.concat(extraObjs)
	}
}
