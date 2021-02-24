import {
	BaseContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	SegmentContext,
	TimelineObjectCoreExt,
	TSR
} from '@sofie-automation/blueprints-integration'
import { CreateTimingEnable, CueDefinitionLYD, literal, PartDefinition, TimeFromFrames } from 'tv2-common'
import { ControlClasses } from 'tv2-constants'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'

export function EvaluateLYD(
	context: SegmentContext,
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
	const fade = parsedCue.variant.match(/FADE ?(\d+)/i)

	if (!conf && !stop && !fade) {
		context.warning(`LYD ${parsedCue.variant} not configured`)
		return
	}

	const file = conf ? conf.FileName.toString() : parsedCue.variant
	const fadeIn = fade ? Number(fade[1]) : conf ? Number(conf.FadeIn) : undefined
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
	fadeIn?: number,
	fadeOut?: number
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
					},
					transitions: {
						inTransition: {
							type: TSR.Transition.MIX,
							easing: TSR.Ease.LINEAR,
							direction: TSR.Direction.LEFT,
							duration: TimeFromFrames(fadeIn ?? config.studio.AudioBedSettings.fadeIn ?? 0)
						},
						outTransition: {
							type: TSR.Transition.MIX,
							easing: TSR.Ease.LINEAR,
							direction: TSR.Direction.LEFT,
							duration: TimeFromFrames(fadeOut ?? config.studio.AudioBedSettings.fadeOut ?? 0)
						}
					}
				},
				classes: [ControlClasses.LYDOnAir]
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
