import {
	BaseContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { CreateTimingEnable, CueDefinitionLYD, literal, PartContext2, PartDefinition } from 'tv2-common'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'

export function EvaluateLYD(
	context: PartContext2,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
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
				lifespan: stop ? PieceLifespan.WithinPart : PieceLifespan.OutOnRundownEnd,
				expectedDuration: CreateTimingEnable(parsedCue).enable.duration ?? undefined,
				content: LydContent(config, file, stop, fadeIn, fadeOut)
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				externalId: part.externalId,
				name: parsedCue.variant,
				...(stop ? { enable: { start: CreateTimingEnable(parsedCue).enable.start } } : CreateTimingEnable(parsedCue)),
				outputLayerId: 'musik',
				sourceLayerId: GetLYDSourceLayer(file),
				lifespan: stop || parsedCue.end ? PieceLifespan.WithinPart : PieceLifespan.OutOnRundownEnd,
				content: LydContent(config, file, stop, fadeIn, fadeOut)
			})
		)
	}
}

export function GetLYDSourceLayer(_name: string): SourceLayer {
	return SourceLayer.PgmAudioBed
}

function LydContent(
	config: BlueprintConfig,
	file: string,
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

	return literal<BaseContent>({
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TSR.TimelineObjCCGMedia>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: CasparLLayer.CasparCGLYD,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file,
					channelLayout: 'bed',
					loop: true,
					noStarttime: true,
					mixer: {
						volume: Number(config.studio.AudioBedSettings.volume) / 100
					}
				}
			}),
			literal<TSR.TimelineObjSisyfosChannel>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceAudiobed,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNEL,
					isPgm: 1
				}
			})
		])
	})
}
