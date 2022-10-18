import {
	BaseContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import {
	CreateTimingEnable,
	CueDefinitionLYD,
	joinAssetToFolder,
	literal,
	PartDefinition,
	TimeFromFrames
} from 'tv2-common'
import {
	AbstractLLayer,
	AdlibTags,
	ControlClasses,
	SharedCasparLLayer,
	SharedOutputLayers,
	SharedSisyfosLLayer,
	SharedSourceLayers
} from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'

export function EvaluateLYD(
	context: IShowStyleUserContext,
	config: TV2BlueprintConfig,
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
		context.notifyUserWarning(`LYD ${parsedCue.variant} not configured`)
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
			outputLayerId: SharedOutputLayers.MUSIK,
			sourceLayerId: SharedSourceLayers.PgmAudioBed,
			lifespan,
			expectedDuration: stop
				? 2000
				: fade
				? Math.max(1000, fadeIn ? TimeFromFrames(fadeIn) : 0)
				: CreateTimingEnable(parsedCue).enable.duration ?? undefined,
			content: LydContent(config, file, lydType, fadeIn, fadeOut),
			tags: [AdlibTags.ADLIB_FLOW_PRODUCER]
		})
	} else {
		pieces.push({
			externalId: part.externalId,
			name: parsedCue.variant,
			...(stop
				? { enable: { start: CreateTimingEnable(parsedCue).enable.start, duration: 2000 } }
				: fade
				? {
						enable: {
							start: CreateTimingEnable(parsedCue).enable.start,
							duration: Math.max(1000, fadeIn ? TimeFromFrames(fadeIn) : 0)
						}
				  }
				: CreateTimingEnable(parsedCue)),
			outputLayerId: SharedOutputLayers.MUSIK,
			sourceLayerId: SharedSourceLayers.PgmAudioBed,
			lifespan,
			content: LydContent(config, file, lydType, fadeIn, fadeOut)
		})
	}
}

function LydContent(
	config: TV2BlueprintConfig,
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
				while: `!.${ControlClasses.LYDOnAir}`
			},
			priority: 0,
			layer: AbstractLLayer.AudioBedBaseline,
			content: {
				deviceType: TSR.DeviceType.ABSTRACT
			}
		}),

		literal<TSR.TimelineObjCCGMedia>({
			id: '',
			// Q: Why start 10s? A: It needs to be longer than the longest fade out, a 10s fade out is probably more than we will ever use.
			enable: { start: `#${studio}_lyd_baseline.start + 10000`, end: `.${ControlClasses.LYDOnAir}` },
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
