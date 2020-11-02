import {
	BlueprintResultPart,
	IBlueprintPieceGeneric,
	NotesContext,
	OnGenerateTimelineObj,
	SegmentContext,
	TimelineObjectCoreExt,
	TimelineObjHoldMode,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { literal, PartContext2, TimelineBlueprintExt } from 'tv2-common'
import { ControlClasses } from 'tv2-constants'
import _ = require('underscore')
import { OfftubeAbstractLLayer, OfftubeAtemLLayer } from '../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from './helpers/config'

export function postProcessPartTimelineObjects(
	context: SegmentContext,
	config: OfftubeShowstyleBlueprintConfig,
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
	config: OfftubeShowstyleBlueprintConfig,
	piece: IBlueprintPieceGeneric,
	isAdlib: boolean
) {
	if (piece.content?.timelineObjects) {
		const extraObjs: TimelineObjectCoreExt[] = []

		const atemMeObjs = (piece.content.timelineObjects as Array<
			| (TSR.TimelineObjAtemME & TimelineBlueprintExt & OnGenerateTimelineObj)
			| (TSR.TimelineObjAtemDSK & TimelineBlueprintExt & OnGenerateTimelineObj)
		>).filter(
			obj =>
				obj.content &&
				obj.content.deviceType === TSR.DeviceType.ATEM &&
				(obj.content.type === TSR.TimelineContentTypeAtem.ME || obj.content.type === TSR.TimelineContentTypeAtem.DSK)
		)
		_.each(atemMeObjs, tlObj => {
			if (tlObj.layer === OfftubeAtemLLayer.AtemMEClean || tlObj.classes?.includes('MIX_MINUS_OVERRIDE_DSK')) {
				if (!tlObj.id) {
					tlObj.id = context.getHashId(OfftubeAtemLLayer.AtemMEClean, true)
				}
				if (!tlObj.metaData) {
					tlObj.metaData = {}
				}

				if (
					(!isAdlib || piece.toBeQueued) &&
					'me' in tlObj.content &&
					(tlObj.content.me.input !== -1 ||
						tlObj.metaData?.mediaPlayerSession !== undefined ||
						tlObj.metaData.mediaPlayerSessionToAssign !== undefined) &&
					!tlObj.classes?.includes(ControlClasses.NOLookahead)
				) {
					if (tlObj.classes?.includes(ControlClasses.AbstractLookahead)) {
						// Create a lookahead-lookahead object for this me-program
						const lookaheadObj = literal<TSR.TimelineObjAbstractAny & TimelineBlueprintExt>({
							id: '',
							enable: { start: 0 },
							priority: tlObj.holdMode === TimelineObjHoldMode.ONLY ? 5 : 0, // Must be below lookahead, except when forced by hold
							layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerAbstractLookahead,
							holdMode: tlObj.holdMode,
							content: {
								deviceType: TSR.DeviceType.ABSTRACT
							},
							metaData: {
								context: `Lookahead-lookahead for ${tlObj.id}`,
								mediaPlayerSession: tlObj.metaData?.mediaPlayerSession,
								mediaPlayerSessionToAssign: tlObj.metaData.mediaPlayerSessionToAssign
							},
							classes: ['ab_on_preview']
						})
						extraObjs.push(lookaheadObj)
					} else {
						// Create a lookahead-lookahead object for this me-program
						const lookaheadObj = literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
							id: '',
							enable: { start: 0 },
							priority: tlObj.holdMode === TimelineObjHoldMode.ONLY ? 5 : 0, // Must be below lookahead, except when forced by hold
							layer: OfftubeAtemLLayer.AtemMENext,
							holdMode: tlObj.holdMode,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									previewInput:
										tlObj.content.me.input !== -1 ? tlObj.content.me.input : config.studio.AtemSource.Default
								}
							},
							metaData: {
								context: `Lookahead-lookahead for ${tlObj.id}`,
								mediaPlayerSession: tlObj.metaData?.mediaPlayerSession,
								mediaPlayerSessionToAssign: tlObj.metaData.mediaPlayerSessionToAssign
							},
							classes: ['ab_on_preview']
						})
						extraObjs.push(lookaheadObj)
					}
				}
			}
		})

		piece.content.timelineObjects = piece.content.timelineObjects.concat(extraObjs)
		piece.content.timelineObjects = piece.content.timelineObjects.filter(
			(obj: TSR.TSRTimelineObjBase) => !obj.classes?.includes('PLACEHOLDER_OBJECT_REMOVEME')
		)
	}
}
