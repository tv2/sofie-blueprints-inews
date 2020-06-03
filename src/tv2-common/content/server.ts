import { OfftubeAtemLLayer } from 'src/tv2_offtube_studio/layers'
import { TimelineObjectCoreExt, TSR, VTContent } from 'tv-automation-sofie-blueprints-integration'
import {
	AddParentClass,
	literal,
	PartDefinition,
	ServerParentClass,
	TransitionFromString,
	TransitionSettings,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { ControlClasses, Enablers } from 'tv2-constants'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { AdlibServerOfftubeOptions } from '../pieces'

export interface MakeContentServerSourceLayers {
	Caspar: {
		ClipPending: string
	}
	ATEM: {
		MEPGM: string
	}
	Sisyfos: {
		ClipPending: string
	}
	STICKY_LAYERS?: string[]
}

export function MakeContentServer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	file: string,
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition,
	config: ShowStyleConfig,
	sourceLayers: MakeContentServerSourceLayers,
	adLib?: boolean,
	offtubeOptions?: AdlibServerOfftubeOptions
): VTContent {
	const timelineStartObjId = `clip_${partDefinition?.externalId ?? ''}_${file}`.replace(/\W/g, '')
	return literal<VTContent>({
		studioLabel: '',
		fileName: file, // playing casparcg
		path: `${config.studio.ClipSourcePath}\\${file}${config.studio.ClipFileExtension}`, // full path on the source network storage
		mediaFlowIds: [config.studio.MediaFlowId],
		firstWords: '',
		lastWords: '',
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TSR.TimelineObjCCGMedia & TimelineBlueprintExt>({
				id: '',
				enable: {
					while: offtubeOptions?.isOfftube
						? `.${offtubeOptions?.enabler} | .${Enablers.OFFTUBE_ENABLE_SERVER_LOOKAHEAD}`
						: '1'
				},
				priority: 1,
				layer: sourceLayers.Caspar.ClipPending,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file,
					loop: offtubeOptions?.isOfftube ? false : adLib,
					noStarttime: true,
					...(offtubeOptions?.isOfftube ? { playing: false } : {}),
					...(offtubeOptions?.isOfftube ? { seek: 0 } : {})
				},
				...(offtubeOptions?.isOfftube
					? {
							keyframes: [
								{
									id: '',
									enable: {
										while: `.${offtubeOptions.enabler}`
									},
									content: {
										playing: true,
										seek: 0
									}
								}
							]
					  }
					: {}),
				metaData: {
					mediaPlayerSession: mediaPlayerSessionId
				},
				classes: [...(AddParentClass(partDefinition) && !adLib ? [ServerParentClass('studio0', file)] : [])]
			}),

			...(offtubeOptions && offtubeOptions.isOfftube
				? [
						literal<TSR.TSRTimelineObjAbstract & TimelineBlueprintExt>({
							id: timelineStartObjId,
							enable: {
								while: `.${Enablers.OFFTUBE_ENABLE_SERVER}`
							},
							priority: 1,
							layer: offtubeOptions.serverEnable,
							content: {
								deviceType: TSR.DeviceType.ABSTRACT
							}
						}),
						literal<TSR.TimelineObjAtemAUX & TimelineBlueprintExt>({
							id: '',
							enable: {
								while: '1'
							},
							priority: 0,
							layer: OfftubeAtemLLayer.AtemAuxServerLookahead,
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
				: []),
			literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
				id: '',
				enable:
					offtubeOptions && offtubeOptions.isOfftube
						? {
								start: `#${timelineStartObjId}.start + ${config.studio.CasparPrerollDuration}`
						  }
						: getServerAdlibEnable(!!adLib, config.studio.CasparPrerollDuration, offtubeOptions),
				priority: 1,
				layer: sourceLayers.ATEM.MEPGM,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						input: undefined,
						transition: partDefinition.transition
							? TransitionFromString(partDefinition.transition.style)
							: TSR.AtemTransitionStyle.CUT,
						transitionSettings: TransitionSettings(partDefinition)
					}
				},
				metaData:
					offtubeOptions?.isOfftube && adLib
						? {
								mediaPlayerSessionToAssign: mediaPlayerSessionId
						  }
						: {
								mediaPlayerSession: mediaPlayerSessionId
						  },
				classes: [
					...(adLib ? ['adlib_deparent'] : []),
					...(offtubeOptions?.isOfftube ? [ControlClasses.AbstractLookahead] : [])
				]
			}),

			literal<TSR.TimelineObjSisyfosAny & TimelineBlueprintExt>({
				id: '',
				enable: getServerAdlibEnable(!!adLib, 0, offtubeOptions),
				priority: 1,
				layer: sourceLayers.Sisyfos.ClipPending,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.SISYFOS,
					// isPgm: voiceOver ? 2 : 1
					isPgm: 1
				},
				metaData: {
					mediaPlayerSession: mediaPlayerSessionId
				},
				classes: []
			}),

			...(sourceLayers.STICKY_LAYERS
				? sourceLayers.STICKY_LAYERS.map<TSR.TimelineObjSisyfosAny & TimelineBlueprintExt>(layer => {
						return literal<TSR.TimelineObjSisyfosAny & TimelineBlueprintExt>({
							id: '',
							enable: getServerAdlibEnable(!!adLib, 0, offtubeOptions),
							priority: 1,
							layer,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 0
							},
							metaData: {
								sisyfosPersistLevel: true
							}
						})
				  })
				: [])
		])
	})
}

function getServerAdlibEnable(
	adlib: boolean,
	startTime: number,
	offtubeOptions?: AdlibServerOfftubeOptions
): TSR.TSRTimelineObjBase['enable'] {
	if (adlib && offtubeOptions?.isOfftube) {
		return {
			while: `.${offtubeOptions.enabler}`
		}
	}

	return {
		start: startTime
	}
}
