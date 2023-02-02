import {
	BlueprintResultPart,
	IBlueprintPieceGeneric,
	SourceLayerType,
	SplitsContent,
	TimelineObjectCoreExt,
	TSR
} from 'blueprints-integration'
import { AtemLLayerDSK, ExtendedShowStyleContext, FindDSKJingle, TimelineBlueprintExt } from 'tv2-common'
import { ControlClasses } from 'tv2-constants'
import * as _ from 'underscore'
import { AtemLLayer } from '../tv2_afvd_studio/layers'
import { GalleryBlueprintConfig } from './helpers/config'
import { SourceLayer } from './layers'

export function postProcessPartTimelineObjects(
	context: ExtendedShowStyleContext<GalleryBlueprintConfig>,
	parts: BlueprintResultPart[]
) {
	_.each(parts, part => {
		_.each(part.pieces, p => postProcessPieceTimelineObjects(context, p, false))
		_.each(part.adLibPieces, p => postProcessPieceTimelineObjects(context, p, true))
	})
}

// Do any post-process of timeline objects
export function postProcessPieceTimelineObjects(
	context: ExtendedShowStyleContext<GalleryBlueprintConfig>,
	piece: IBlueprintPieceGeneric,
	isAdlib: boolean
) {
	const jingleDSK = FindDSKJingle(context.config)
	const jingleDSKLayer = AtemLLayerDSK(jingleDSK.Number)

	if (piece.content?.timelineObjects) {
		const extraObjs: TimelineObjectCoreExt[] = []

		const atemMeObjs = piece.content.timelineObjects.filter(
			obj =>
				context.videoSwitcher.isMixEffect(obj) || context.videoSwitcher.isDsk(obj))
		_.each(atemMeObjs, tlObj => {
			if (tlObj.layer === AtemLLayer.AtemMEProgram || tlObj.classes?.includes(ControlClasses.MixMinusOverrideDsk)) {
				if (!tlObj.id) {
					tlObj.id = context.core.getHashId(AtemLLayer.AtemMEProgram, true)
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
					(tlObj.content.me.input !== -1 || tlObj.metaData?.mediaPlayerSession !== undefined)
				) {
					// Create a lookahead-lookahead object for this me-program
					const lookaheadObj: TSR.TimelineObjAtemAUX & TimelineBlueprintExt = {
						id: '',
						enable: { start: 0 },
						priority: 0, // Must be below lookahead, except when forced by hold
						layer: AtemLLayer.AtemAuxLookahead,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.AUX,
							aux: {
								input:
									tlObj.content.me.input !== -1
										? tlObj.content.me.input ?? context.config.studio.SwitcherSource.Default
										: context.config.studio.SwitcherSource.Default
							}
						},
						metaData: {
							context: `Lookahead-lookahead for ${tlObj.id}`,
							mediaPlayerSession: tlObj.metaData?.mediaPlayerSession // TODO - does this work the same?
						}
					}
					extraObjs.push(lookaheadObj)
				}

				// mix minus
				let mixMinusSource: number | undefined | null // TODO - what about clips?
				// tslint:disable-next-line:prefer-conditional-expression
				if (tlObj.classes?.includes(ControlClasses.MixMinusOverrideDsk)) {
					mixMinusSource = (tlObj as TSR.TimelineObjAtemDSK).content.dsk.sources?.fillSource
				} else {
					mixMinusSource = (tlObj as TSR.TimelineObjAtemME).content.me.input
				}

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
				if (mixMinusSource !== null && mixMinusSource !== -1) {
					const mixMinusObj: TSR.TimelineObjAtemAUX & TimelineBlueprintExt = {
						..._.omit(tlObj, 'content'),
						id: '',
						layer: AtemLLayer.AtemAuxVideoMixMinus,
						priority: tlObj.classes?.includes(ControlClasses.MixMinusOverrideDsk) ? 10 : tlObj.priority,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.AUX,
							aux: {
								input:
									mixMinusSource !== undefined && mixMinusSource !== -1
										? mixMinusSource
										: context.config.studio.SwitcherSource.MixMinusDefault
							}
						},
						metaData: {
							...tlObj.metaData,
							context: `Mix-minus for ${tlObj.id}`
						}
					}
					mixMinusObj.classes = mixMinusObj.classes?.filter(
						c => !c.match(`studio0_parent_`) && !c.match(ControlClasses.Placeholder)
					)
					extraObjs.push(mixMinusObj)
				}
			}
		})

		const atemDskObjs = (piece.content.timelineObjects as TSR.TimelineObjAtemDSK[]).filter(
			obj =>
				obj.content &&
				obj.content.deviceType === TSR.DeviceType.ATEM &&
				obj.content.type === TSR.TimelineContentTypeAtem.DSK
		)
		_.each(atemDskObjs, tlObj => {
			if (tlObj.layer === jingleDSKLayer) {
				const newProps = _.pick(tlObj.content.dsk, 'onAir')
				if (_.isEqual(newProps, tlObj.content.dsk)) {
					context.core.notifyUserWarning(`Unhandled Keyer properties for Clean keyer, it may look wrong`)
				}

				const cleanObj: TSR.TimelineObjAtemME & TimelineBlueprintExt = {
					..._.omit(tlObj, 'content', 'keyframes'),
					id: '',
					layer: AtemLLayer.AtemCleanUSKEffect,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
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
				}
				extraObjs.push(cleanObj)
			}
		})

		piece.content.timelineObjects = piece.content.timelineObjects.concat(extraObjs)
		piece.content.timelineObjects = piece.content.timelineObjects.filter(
			(obj: TSR.TSRTimelineObjBase) => !obj.classes?.includes(ControlClasses.Placeholder)
		)
	}
}
