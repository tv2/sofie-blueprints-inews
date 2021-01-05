import {
	IBlueprintActionManifest,
	TimelineObjectCoreExt,
	TSR,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionSelectServerClip,
	AddParentClass,
	literal,
	PartDefinition,
	SanitizeString,
	ServerParentClass,
	TransitionFromString,
	TransitionSettings
} from 'tv2-common'
import { AdlibActionType, AdlibTags, ControlClasses, GetEnableClassForServer } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { AdlibServerOfftubeOptions, GetTagForServer, GetTagForServerNext } from '../pieces'

// TODO: These are TSR layers, not sourcelayers
export interface MakeContentServerSourceLayers {
	Caspar: {
		ClipPending: string
	}
	ATEM: {
		MEPGM: string
		ServerLookaheadAUX?: string
	}
	Sisyfos: {
		ClipPending: string
	}
	STICKY_LAYERS?: string[]
	OutputLayerId: string
	SourceLayerId: string
}

export function MakeActionServer(
	rank: number,
	file: string,
	mediaPlayerSession: string,
	partDefinition: PartDefinition,
	config: TV2BlueprintConfig,
	sourceLayers: MakeContentServerSourceLayers,
	vo: boolean,
	duration: number,
	adLib?: boolean,
	offtubeOptions?: AdlibServerOfftubeOptions
) {
	// TODO: Reduce to bare minimum for action
	const actionContent = MakeContentServer(
		file,
		SanitizeString(`segment_${mediaPlayerSession}_${file}`),
		partDefinition,
		config,
		sourceLayers,
		duration,
		adLib,
		offtubeOptions
	)

	return literal<IBlueprintActionManifest>({
		actionId: AdlibActionType.SELECT_SERVER_CLIP,
		userData: literal<ActionSelectServerClip>({
			type: AdlibActionType.SELECT_SERVER_CLIP,
			file,
			partDefinition,
			duration,
			vo,
			segmentExternalId: partDefinition.segmentExternalId
		}),
		userDataManifest: {},
		display: {
			_rank: rank,
			label: `${partDefinition.storyName}`,
			sourceLayerId: sourceLayers.SourceLayerId,
			outputLayerId: sourceLayers.OutputLayerId,
			content: { ...actionContent, timelineObjects: [] }, // TODO: No timeline
			tags: [adLib ? AdlibTags.OFFTUBE_ADLIB_SERVER : AdlibTags.OFFTUBE_100pc_SERVER, AdlibTags.ADLIB_KOMMENTATOR],
			currentPieceTags: [GetTagForServer(partDefinition.segmentExternalId, file, !!vo)],
			nextPieceTags: [GetTagForServerNext(partDefinition.segmentExternalId, file, !!vo)]
		}
	})
}

export function MakeContentServer(
	file: string,
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition,
	config: TV2BlueprintConfig,
	sourceLayers: MakeContentServerSourceLayers,
	duration: number,
	adLib?: boolean,
	offtubeOptions?: AdlibServerOfftubeOptions
): VTContent {
	return literal<VTContent>({
		studioLabel: '',
		fileName: file, // playing casparcg
		path: `${config.studio.NetworkBasePath}\\${file}${config.studio.ClipFileExtension}`, // full path on the source network storage
		mediaFlowIds: [config.studio.MediaFlowId],
		firstWords: '',
		lastWords: '',
		postrollDuration: config.studio.ServerPostrollDuration,
		timelineObjects: GetServerTimeline(
			file,
			mediaPlayerSessionId,
			partDefinition,
			config,
			sourceLayers,
			duration,
			adLib,
			offtubeOptions
		)
	})
}

export function GetServerTimeline(
	file: string,
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition,
	_config: TV2BlueprintConfig,
	sourceLayers: MakeContentServerSourceLayers,
	duration: number,
	adLib?: boolean,
	offtubeOptions?: AdlibServerOfftubeOptions
) {
	const serverEnableClass = `.${GetEnableClassForServer(mediaPlayerSessionId)}`
	return literal<TimelineObjectCoreExt[]>([
		literal<TSR.TimelineObjCCGMedia & TimelineBlueprintExt>({
			id: '',
			enable: {
				while: 1
			},
			priority: 1,
			layer: sourceLayers.Caspar.ClipPending,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.MEDIA,
				file,
				loop: offtubeOptions?.isOfftube ? false : adLib,
				seek: 0,
				length: duration,
				playing: false
			},
			keyframes: [
				{
					id: '',
					enable: {
						while: serverEnableClass
					},
					content: {
						seek: 0,
						playing: true
					}
				}
			],
			metaData: {
				mediaPlayerSession: mediaPlayerSessionId
			},
			classes: [...(AddParentClass(partDefinition) && !adLib ? [ServerParentClass('studio0', file)] : [])]
		}),

		literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
			id: '',
			enable: {
				while: serverEnableClass
			},
			priority: 1,
			layer: sourceLayers.Sisyfos.ClipPending,
			content: {
				deviceType: TSR.DeviceType.SISYFOS,
				type: TSR.TimelineContentTypeSisyfos.CHANNEL,
				// isPgm: voiceOver ? 2 : 1
				isPgm: 1
			},
			metaData: {
				mediaPlayerSession: mediaPlayerSessionId
			},
			classes: []
		}),

		...(sourceLayers.STICKY_LAYERS
			? sourceLayers.STICKY_LAYERS.map<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>(layer => {
					return literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
						id: '',
						enable: {
							while: serverEnableClass
						},
						priority: 1,
						layer,
						content: {
							deviceType: TSR.DeviceType.SISYFOS,
							type: TSR.TimelineContentTypeSisyfos.CHANNEL,
							isPgm: 0
						},
						metaData: {
							sisyfosPersistLevel: true
						}
					})
			  })
			: [])
	])
			...(sourceLayers.ATEM.ServerLookaheadAUX
				? [
						literal<TSR.TimelineObjAtemAUX & TimelineBlueprintExt>({
							id: '',
							enable: {
								while: '1'
							},
							priority: 0,
							layer: sourceLayers.ATEM.ServerLookaheadAUX,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.AUX,
								aux: {
									input: -1
								}
							},
							metaData: {
								mediaPlayerSession: mediaPlayerSessionId
							}
						})
				  ]
				: [])
		])
	})
}

export function CutToServer(
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition,
	config: TV2BlueprintConfig,
	sourceLayers: MakeContentServerSourceLayers,
	adLib?: boolean,
	offtubeOptions?: AdlibServerOfftubeOptions
) {
	return literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
		id: '',
		enable: {
			start: config.studio.CasparPrerollDuration
		},
		priority: 1,
		layer: sourceLayers.ATEM.MEPGM,
		content: {
			deviceType: TSR.DeviceType.ATEM,
			type: TSR.TimelineContentTypeAtem.ME,
			me: {
				input: -1,
				transition: partDefinition.transition
					? TransitionFromString(partDefinition.transition.style)
					: TSR.AtemTransitionStyle.CUT,
				transitionSettings: TransitionSettings(partDefinition)
			}
		},
		metaData: {
			mediaPlayerSession: mediaPlayerSessionId
		},
		classes: [
			...(adLib && !offtubeOptions?.isOfftube ? ['adlib_deparent'] : []),
			...(offtubeOptions?.isOfftube ? [ControlClasses.AbstractLookahead] : [])
		]
	})
}

export function EnableServer(layer: string, mediaPlayerSessionId: string) {
	return literal<TSR.TimelineObjAbstractAny>({
		id: '',
		enable: {
			start: 0
		},
		layer,
		content: {
			deviceType: TSR.DeviceType.ABSTRACT
		},
		classes: [GetEnableClassForServer(mediaPlayerSessionId)]
	})
}
