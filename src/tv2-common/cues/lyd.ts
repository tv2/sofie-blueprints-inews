import {
	BaseContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import {
	CueDefinitionLYD,
	getTimeFromFrames,
	getTimingEnable,
	joinAssetToFolder,
	literal,
	PartDefinition,
	ShowStyleContext
} from 'tv2-common'
import {
	AbstractLLayer,
	AdlibTags,
	ControlClasses,
	SharedCasparLLayer,
	SharedOutputLayer,
	SharedSisyfosLLayer,
	SharedSourceLayer
} from 'tv2-constants'
import { TV2ShowStyleConfig } from '../blueprintConfig'

export function EvaluateLYD(
	context: ShowStyleContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	parsedCue: CueDefinitionLYD,
	part: PartDefinition,
	adlib?: boolean,
	rank?: number
) {
	const conf = context.config.showStyle.LYDConfig.find((lyd) =>
		lyd.INewsName ? lyd.INewsName.toString().toUpperCase() === parsedCue.variant.toUpperCase() : false
	)
	const stop = !!parsedCue.variant.match(/^[^_]*STOP[^_]*$/i) // TODO: STOP 1 / STOP 2 etc.
	const fade = parsedCue.variant.match(/FADE ?(\d+)/i)

	if (!conf && !stop && !fade) {
		context.core.notifyUserWarning(`LYD ${parsedCue.variant} not configured`)
		return
	}

	const file = fade ? 'empty' : conf ? conf.FileName.toString() : parsedCue.variant
	const fadeTimeInFrames = fade ? Number(fade[1]) : undefined
	const fadeIn = fadeTimeInFrames ?? (conf ? Number(conf.FadeIn) : undefined)
	const fadeOut = fadeTimeInFrames ?? (conf ? Number(conf.FadeOut) : undefined)

	const lydType = stop ? 'stop' : fade ? 'fade' : 'bed'
	const lifespan = stop || fade || parsedCue.end ? PieceLifespan.WithinPart : PieceLifespan.OutOnRundownChange

	if (adlib) {
		adlibPieces.push({
			_rank: rank || 0,
			externalId: part.externalId,
			name: parsedCue.variant,
			outputLayerId: SharedOutputLayer.MUSIK,
			sourceLayerId: SharedSourceLayer.PgmAudioBed,
			lifespan,
			expectedDuration: stop
				? 2000
				: fade
				? Math.max(1000, fadeIn ? getTimeFromFrames(fadeIn) : 0)
				: getTimingEnable(parsedCue).enable.duration ?? undefined,
			content: LydContent(context.config, file, lydType, fadeIn, fadeOut),
			tags: [AdlibTags.ADLIB_FLOW_PRODUCER]
		})
	} else {
		pieces.push({
			externalId: part.externalId,
			name: parsedCue.variant,
			...(stop
				? { enable: { start: getTimingEnable(parsedCue).enable.start, duration: 2000 } }
				: fade
				? {
						enable: {
							start: getTimingEnable(parsedCue).enable.start,
							duration: Math.max(1000, fadeIn ? getTimeFromFrames(fadeIn) : 0)
						}
				  }
				: getTimingEnable(parsedCue)),
			outputLayerId: SharedOutputLayer.MUSIK,
			sourceLayerId: SharedSourceLayer.PgmAudioBed,
			lifespan,
			content: LydContent(context.config, file, lydType, fadeIn, fadeOut)
		})
	}
}

function LydContent(
	config: TV2ShowStyleConfig,
	file: string,
	lydType: 'bed' | 'stop' | 'fade',
	fadeIn?: number,
	fadeOut?: number
): WithTimeline<BaseContent> {
	if (lydType === 'stop') {
		return literal<WithTimeline<BaseContent>>({
			timelineObjects: [
				literal<TSR.TimelineObjEmpty>({
					id: '',
					enable: {
						start: 0
					},
					priority: 50,
					layer: SharedSisyfosLLayer.SisyfosSourceAudiobed,
					content: {
						deviceType: TSR.DeviceType.ABSTRACT,
						type: 'empty'
					},
					classes: []
				})
			]
		})
	}

	const filePath = lydType === 'fade' ? file : joinAssetToFolder(config.studio.AudioBedFolder, file)

	return literal<WithTimeline<BaseContent>>({
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TSR.TimelineObjCCGMedia>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SharedCasparLLayer.CasparCGLYD,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file: filePath,
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
							duration: getTimeFromFrames(fadeIn ?? config.studio.AudioBedSettings.fadeIn ?? 0)
						},
						outTransition: {
							type: TSR.Transition.MIX,
							easing: TSR.Ease.LINEAR,
							direction: TSR.Direction.LEFT,
							duration: getTimeFromFrames(fadeOut ?? config.studio.AudioBedSettings.fadeOut ?? 0)
						}
					}
				},
				classes: [ControlClasses.LYD_ON_AIR]
			}),
			literal<TSR.TimelineObjSisyfosChannel>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SharedSisyfosLLayer.SisyfosSourceAudiobed,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNEL,
					isPgm: 1
				}
			})
		])
	})
}

export function CreateLYDBaseline(studio: string): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjAbstractAny>({
			id: `${studio}_lyd_baseline`,
			enable: {
				while: `!.${ControlClasses.LYD_ON_AIR}`
			},
			priority: 0,
			layer: AbstractLLayer.AUDIO_BED_BASELINE,
			content: {
				deviceType: TSR.DeviceType.ABSTRACT
			}
		}),

		literal<TSR.TimelineObjCCGMedia>({
			id: '',
			// Q: Why start 10s? A: It needs to be longer than the longest fade out, a 10s fade out is probably more than we will ever use.
			enable: { start: `#${studio}_lyd_baseline.start + 10000`, end: `.${ControlClasses.LYD_ON_AIR}` },
			priority: 0,
			layer: SharedCasparLLayer.CasparCGLYD,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.MEDIA,
				loop: true,
				file: 'EMPTY',
				mixer: {
					volume: 0
				}
			}
		})
	]
}
