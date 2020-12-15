import { TimelineObjectCoreExt, TSR, VTContent } from 'tv-automation-sofie-blueprints-integration'
import {
	AddParentClass,
	literal,
	PartDefinition,
	ServerParentClass,
	TransitionFromString,
	TransitionSettings
} from 'tv2-common'
import { ControlClasses } from 'tv2-constants'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { AdlibServerOfftubeOptions } from '../pieces'
import { TV2BlueprintConfig } from '../blueprintConfig'

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
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TSR.TimelineObjCCGMedia & TimelineBlueprintExt>({
				id: '',
				enable: {
					while: `.${ControlClasses.ServerOnAir}`
				},
				priority: 1,
				layer: sourceLayers.Caspar.ClipPending,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file,
					loop: offtubeOptions?.isOfftube ? false : adLib,
					seek: 0,
					length: duration
				},
				metaData: {
					mediaPlayerSession: mediaPlayerSessionId
				},
				classes: [...(AddParentClass(partDefinition) && !adLib ? [ServerParentClass('studio0', file)] : [])]
			}),

			literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
				id: '',
				enable: {
					while: `.${ControlClasses.ServerOnAir}`
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
								while: `.${ControlClasses.ServerOnAir}`
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
				: []),

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
	_duration: number,
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
