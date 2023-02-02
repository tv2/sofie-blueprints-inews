import {
	BlueprintResultPart,
	IBlueprintPieceGeneric,
	OnGenerateTimelineObj,
	TimelineObjectCoreExt,
	TSR
} from 'blueprints-integration'
import { ExtendedShowStyleContext, TimelineBlueprintExt } from 'tv2-common'
import { ControlClasses } from 'tv2-constants'
import _ = require('underscore')
import { OfftubeAbstractLLayer, OfftubeAtemLLayer } from '../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from './helpers/config'

export function postProcessPartTimelineObjects(
	context: ExtendedShowStyleContext<OfftubeBlueprintConfig>,
	parts: BlueprintResultPart[]
) {
	_.each(parts, part => {
		_.each(part.pieces, p => postProcessPieceTimelineObjects(context, p, false))
		_.each(part.adLibPieces, p => postProcessPieceTimelineObjects(context, p, true))
	})
}

// Do any post-process of timeline objects
export function postProcessPieceTimelineObjects(
	context: ExtendedShowStyleContext<OfftubeBlueprintConfig>,
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
			if (tlObj.layer === OfftubeAtemLLayer.AtemMEClean || tlObj.classes?.includes(ControlClasses.MixMinusOverrideDsk)) {
				if (!tlObj.id) {
					tlObj.id = context.core.getHashId(OfftubeAtemLLayer.AtemMEClean, true)
				}
				if (!tlObj.metaData) {
					tlObj.metaData = {}
				}

				if (
					(!isAdlib || piece.toBeQueued) &&
					'me' in tlObj.content &&
					(tlObj.content.me.input !== -1 || tlObj.metaData?.mediaPlayerSession !== undefined)
				) {
					if (tlObj.classes?.includes(ControlClasses.AbstractLookahead)) {
						// Create a lookahead-lookahead object for this me-program
						const lookaheadObj: TSR.TimelineObjAbstractAny & TimelineBlueprintExt = {
							id: '',
							enable: { start: 0 },
							priority: 0,
							layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerAbstractLookahead,
							content: {
								deviceType: TSR.DeviceType.ABSTRACT
							},
							metaData: {
								context: `Lookahead-lookahead for ${tlObj.id}`,
								mediaPlayerSession: tlObj.metaData?.mediaPlayerSession
							},
							classes: ['ab_on_preview']
						}
						extraObjs.push(lookaheadObj)
					} else {
						// Create a lookahead-lookahead object for this me-program
						const lookaheadObj: TSR.TimelineObjAtemME & TimelineBlueprintExt = {
							id: '',
							enable: { start: 0 },
							priority: 0, // Must be below lookahead, except when forced by hold
							layer: OfftubeAtemLLayer.AtemMENext,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									previewInput:
										tlObj.content.me.input !== -1
											? tlObj.content.me.input
											: context.config.studio.SwitcherSource.Default
								}
							},
							metaData: {
								context: `Lookahead-lookahead for ${tlObj.id}`,
								mediaPlayerSession: tlObj.metaData?.mediaPlayerSession
							},
							classes: ['ab_on_preview']
						}
						extraObjs.push(lookaheadObj)
					}
				}
			}
		})

		piece.content.timelineObjects = piece.content.timelineObjects.concat(extraObjs)
		piece.content.timelineObjects = piece.content.timelineObjects.filter(
			(obj: TSR.TSRTimelineObjBase) => !obj.classes?.includes(ControlClasses.Placeholder)
		)
	}
}
