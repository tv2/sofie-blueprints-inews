import {
	BaseContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { CalculateTime, CreateTimingEnable, CueDefinitionLYD, literal, PartDefinition } from 'tv2-common'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'

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
	_fadeOut?: number
): BaseContent {
	if (stop) {
		return literal<BaseContent>({
			timelineObjects: [
				literal<TSR.TimelineObjEmpty>({
					id: '',
					enable: {
						start: 0
					},
					priority: 50,
					layer: SisyfosLLAyer.SisyfosSourceAudiobed,
					content: {
						deviceType: TSR.DeviceType.ABSTRACT,
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
			literal<TSR.TimelineObjCCGMedia>({
				id,
				enable: {
					start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
					...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
				},
				priority: 1,
				layer: CasparLLayer.CasparCGLYD,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file,
					channelLayout: 'bed',
					loop: true,
					mixer: {
						volume: Number(config.studio.AudioBedSettings.volume) / 100
					}
				}
			}),
			literal<TSR.TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
					...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceAudiobed,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.SISYFOS,
					isPgm: 1
				}
			})
		])
	})
}
