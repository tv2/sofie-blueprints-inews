import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjAtemME,
	TimelineObjCCGMedia,
	TimelineObjSisyfosAny,
	TSRTimelineObjBase
} from 'timeline-state-resolver-types'
import { TimelineObjectCoreExt, VTContent } from 'tv-automation-sofie-blueprints-integration'
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
	return literal<VTContent>({
		studioLabel: '',
		fileName: file, // playing casparcg
		path: `${config.studio.ClipSourcePath}\\${file}${config.studio.ClipFileExtension}`, // full path on the source network storage
		mediaFlowIds: [config.studio.MediaFlowId],
		firstWords: '',
		lastWords: '',
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TimelineObjCCGMedia & TimelineBlueprintExt>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 1,
				layer: sourceLayers.Caspar.ClipPending,
				content: {
					deviceType: DeviceType.CASPARCG,
					type: TimelineContentTypeCasparCg.MEDIA,
					file,
					loop: adLib,
					noStarttime: true,
					...(offtubeOptions?.isOfftube ? { playing: false } : {})
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
										inPoint: 0,
										playing: true
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

			literal<TimelineObjAtemME & TimelineBlueprintExt>({
				id: '',
				enable: getServerAdlibEnable(!!adLib, config.studio.CasparPrerollDuration, offtubeOptions),
				priority: 1,
				layer: sourceLayers.ATEM.MEPGM,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.ME,
					me: {
						input: undefined,
						transition: partDefinition.transition
							? TransitionFromString(partDefinition.transition.style)
							: AtemTransitionStyle.CUT,
						transitionSettings: TransitionSettings(partDefinition)
					}
				},
				metaData: {
					mediaPlayerSession: mediaPlayerSessionId
				},
				classes: [...(adLib ? ['adlib_deparent'] : [])]
			}),

			literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
				id: '',
				enable: getServerAdlibEnable(!!adLib, 0, offtubeOptions),
				priority: 1,
				layer: sourceLayers.Sisyfos.ClipPending,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					// isPgm: voiceOver ? 2 : 1
					isPgm: 1
				},
				metaData: {
					mediaPlayerSession: mediaPlayerSessionId
				},
				classes: []
			}),

			...(sourceLayers.STICKY_LAYERS
				? sourceLayers.STICKY_LAYERS.map<TimelineObjSisyfosAny & TimelineBlueprintExt>(layer => {
						return literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
							id: '',
							enable: getServerAdlibEnable(!!adLib, 0, offtubeOptions),
							priority: 1,
							layer,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
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
): TSRTimelineObjBase['enable'] {
	if (adlib && offtubeOptions?.isOfftube) {
		return {
			while: `.${offtubeOptions.enabler}`
		}
	}

	return {
		start: startTime
	}
}
