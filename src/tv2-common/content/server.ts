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
import { ControlClasses } from 'tv2-constants'
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
	_duration: number,
	adLib?: boolean,
	offtubeOptions?: AdlibServerOfftubeOptions
): VTContent {
	// const filePath = `${SanitizePath(config.studio.ClipBasePath)}/${file}`
	return literal<VTContent>({
		studioLabel: '',
		fileName: file, // playing casparcg
		path: `${config.studio.NetworkBasePath}\\${file}${config.studio.ClipFileExtension}`, // full path on the source network storage
		mediaFlowIds: [config.studio.MediaFlowId],
		firstWords: '',
		lastWords: '',
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TSR.TimelineObjCCGMedia & TimelineBlueprintExt>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 1,
				layer: sourceLayers.Caspar.ClipPending,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file,
					loop: offtubeOptions?.isOfftube ? false : adLib
					// ...(offtubeOptions?.isOfftube ? { seek: 0 } : {})
				},
				metaData: {
					mediaPlayerSession: mediaPlayerSessionId
				},
				classes: [...(AddParentClass(partDefinition) && !adLib ? [ServerParentClass('studio0', file)] : [])]
			}),
			literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
				id: '',
				enable: getServerAdlibEnable(config.studio.CasparPrerollDuration),
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
					...(adLib && !offtubeOptions?.isOfftube ? ['adlib_deparent'] : []),
					...(offtubeOptions?.isOfftube ? [ControlClasses.AbstractLookahead] : []),
					ControlClasses.ServerOnAir
				]
			}),

			literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
				id: '',
				enable: getServerAdlibEnable(0),
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
							enable: getServerAdlibEnable(0),
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
	})
}

function getServerAdlibEnable(startTime: number): TSR.TSRTimelineObjBase['enable'] {
	return {
		start: startTime
	}
}
