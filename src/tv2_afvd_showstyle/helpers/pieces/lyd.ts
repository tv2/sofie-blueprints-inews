import {
	DeviceType,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjCCGMedia,
	TimelineObjEmpty,
	TimelineObjSisyfosMessage,
	Transition
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
import { TimeFromFrames } from '../../../tv2_afvd_showstyle/parts/time/frameTime'
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
	const conf = config.showStyle.LYDConfig.find(lyd =>
		lyd.INewsName ? lyd.INewsName.toString().toUpperCase() === parsedCue.variant.toUpperCase() : false
	)
	const stop = !!parsedCue.variant.match(/^[^_]*STOP[^_]*$/i) // TODO: STOP 1 / STOP 2 etc.

	if (!conf && !stop) {
		context.warning(`LYD ${parsedCue.variant} not configured, using iNews name as file name`)
	}

	const file = conf ? conf.FileName.toString() : parsedCue.variant
	const fadeIn = conf ? Number(conf.FadeIn) : undefined
	const fadeOut = conf ? Number(conf.FadeOut) : undefined

	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: part.externalId,
				name: parsedCue.variant,
				outputLayerId: 'musik',
				sourceLayerId: SourceLayer.PgmAudioBed,
				infiniteMode: stop ? PieceLifespan.Normal : PieceLifespan.Infinite,
				content: LydContent(config, file, parsedCue, stop, fadeIn, fadeOut)
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: part.externalId,
				name: parsedCue.variant,
				...(stop ? { enable: { start: CreateTimingEnable(parsedCue).enable.start } } : CreateTimingEnable(parsedCue)),
				outputLayerId: 'musik',
				sourceLayerId: GetLYDSourceLayer(file),
				infiniteMode: stop ? PieceLifespan.Normal : PieceLifespan.Infinite,
				content: LydContent(config, file, parsedCue, stop, fadeIn, fadeOut)
			})
		)
	}
}

export function GetLYDSourceLayer(_name: string): SourceLayer {
	return SourceLayer.PgmAudioBed
}

export function LydContent(
	config: BlueprintConfig,
	file: string,
	parsedCue: CueDefinitionLYD,
	stop?: boolean,
	_fadeIn?: number,
	fadeOut?: number
): BaseContent {
	if (stop) {
		return literal<BaseContent>({
			timelineObjects: [
				literal<TimelineObjEmpty>({
					id: '',
					enable: {
						start: 0
					},
					priority: 50,
					layer: SisyfosLLAyer.SisyfosSourceAudiobed,
					content: {
						deviceType: DeviceType.ABSTRACT,
						type: 'empty'
					},
					classes: []
				})
			]
		})
	}

	const id = `${file.trim().replace(/ /gi, '_')}`
	return literal<BaseContent>({
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TimelineObjCCGMedia>({
				id,
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
					channelLayout: 'bed',
					loop: true,
					mixer: {
						volume: Number(config.studio.AudioBedSettings.volume) / 100
					},
					transitions: {
						inTransition: {
							type: Transition.MIX,
							duration: 1 // fadeIn !== undefined ? TimeFromFrames(fadeIn) : TimeFromFrames(config.studio.AudioBedSettings.fadeIn)
						}
					}
				},
				keyframes: [
					{
						id: 'kf0',
						enable: {
							start: `#${id}.end - ${
								fadeOut !== undefined ? TimeFromFrames(fadeOut) : TimeFromFrames(config.studio.AudioBedSettings.fadeOut)
							}`
						},
						content: {
							mixer: {
								inTransition: {
									type: Transition.MIX,
									duration: 1 // fadeOut !== undefined ? TimeFromFrames(fadeOut) : TimeFromFrames(config.studio.AudioBedSettings.fadeOut)
								},
								volume: 0
							}
						}
					}
				]
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
