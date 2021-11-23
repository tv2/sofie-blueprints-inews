import {
	BlueprintResultPart,
	IBlueprintPieceGeneric,
	IStudioUserContext,
	OnGenerateTimelineObj,
	TimelineObjectCoreExt,
	TimelineObjHoldMode,
	TSR
} from '@tv2media/blueprints-integration'
import { literal, TimelineBlueprintExt, TV2BlueprintConfig } from 'tv2-common'
import { ControlClasses } from 'tv2-constants'
import _ = require('underscore')
import { OfftubeAbstractLLayer, OfftubeAtemLLayer } from '../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from './helpers/config'

export function postProcessPartTimelineObjects(
	context: IStudioUserContext,
	config: OfftubeShowstyleBlueprintConfig,
	parts: BlueprintResultPart[]
) {
	_.each(parts, part => {
		_.each(part.pieces, p => postProcessPieceTimelineObjects(context, config, p, false))
		_.each(part.adLibPieces, p => postProcessPieceTimelineObjects(context, config, p, true))
	})
}

// Do any post-process of timeline objects
export function postProcessPieceTimelineObjects(
	context: IStudioUserContext,
	config: TV2BlueprintConfig,
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
					(tlObj.content.me.input !== -1 || tlObj.metaData?.mediaPlayerSession !== undefined) &&
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
								mediaPlayerSession: tlObj.metaData?.mediaPlayerSession
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
								mediaPlayerSession: tlObj.metaData?.mediaPlayerSession
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
