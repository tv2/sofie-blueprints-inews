import {
	DeviceType,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjCCGMedia,
	TimelineObjSisyfosMessage
} from 'timeline-state-resolver-types'
import {
	BaseContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { CueDefinitionLYD } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'
import { CalculateTime, CreateTimingEnable } from './evaluateCues'

export function EvaluateLYD(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	parsedCue: CueDefinitionLYD,
	part: PartDefinition,
	adlib?: boolean,
	rank?: number
) {
	const conf = config.showStyle.LYDConfig.find(
		lyd => lyd.iNewsName.toString().toUpperCase() === parsedCue.variant.toUpperCase()
	)
	const stop = !!parsedCue.variant.match(/STOP/) // TODO: STOP 1 / STOP 2 etc.

	if (!conf && !stop) {
		context.warning(`LYD ${parsedCue.variant} not configured, using iNews name as file name`)
	}

	const file = conf ? conf.FileName.toString() : parsedCue.variant

	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: part.externalId,
				name: parsedCue.variant,
				outputLayerId: 'musik',
				sourceLayerId: SourceLayer.PgmAudioBed,
				infiniteMode: PieceLifespan.Infinite,
				content: literal<BaseContent>({
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TimelineObjCCGMedia>({
							id: '',
							enable: {
								start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
								...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
							},
							priority: 1,
							layer: CasparLLayer.CasparCGLYD,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.MEDIA,
								file,
								channelLayout: 'bed'
							}
						}),
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
								...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceAudiobed,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							}
						})
					])
				})
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: part.externalId,
				name: parsedCue.variant,
				...CreateTimingEnable(parsedCue),
				outputLayerId: 'musik',
				sourceLayerId: SourceLayer.PgmAudioBed,
				infiniteMode: PieceLifespan.Infinite,
				virtual: stop,
				...(stop
					? {
							content: literal<BaseContent>({
								timelineObjects: literal<TimelineObjectCoreExt[]>([
									literal<TimelineObjCCGMedia>({
										id: '',
										enable: {
											start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
											...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
										},
										priority: 1,
										layer: CasparLLayer.CasparCGLYD,
										content: {
											deviceType: DeviceType.CASPARCG,
											type: TimelineContentTypeCasparCg.MEDIA,
											file,
											channelLayout: 'bed'
										}
									}),
									literal<TimelineObjSisyfosMessage>({
										id: '',
										enable: {
											start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
											...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
										},
										priority: 1,
										layer: SisyfosLLAyer.SisyfosSourceAudiobed,
										content: {
											deviceType: DeviceType.SISYFOS,
											type: TimelineContentTypeSisyfos.SISYFOS,
											isPgm: 1
										}
									})
								])
							})
					  }
					: {})
			})
		)
	}
}
