import { TimelineObjectCoreExt, TSR, VTContent, WithTimeline } from 'blueprints-integration'
import { GetSisyfosTimelineObjForServer, literal, PartDefinition, ShowStyleContext, TransitionStyle } from 'tv2-common'
import { AbstractLLayer, GetEnableClassForServer } from 'tv2-constants'
import { TV2ShowStyleConfig } from '../blueprintConfig'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { ServerContentProps, ServerPartProps } from '../parts'
import { joinAssetToNetworkPath } from '../util'

// TODO: These are TSR layers, not sourcelayers
export interface MakeContentServerSourceLayers {
	Caspar: {
		ClipPending: string
	}
	Sisyfos: {
		ClipPending: string
	}
}

type VTProps = Pick<
	VTContent,
	'fileName' | 'path' | 'mediaFlowIds' | 'ignoreMediaObjectStatus' | 'sourceDuration' | 'postrollDuration' | 'seek'
>

export function GetVTContentProperties(
	config: TV2ShowStyleConfig,
	contentProps: Omit<ServerContentProps, 'mediaPlayerSession'>
): VTProps {
	return literal<VTProps>({
		fileName: contentProps.file,
		path: joinAssetToNetworkPath(
			config.studio.ClipNetworkBasePath,
			config.studio.ClipFolder,
			contentProps.file,
			config.studio.ClipFileExtension
		), // full path on the source network storage
		mediaFlowIds: [config.studio.ClipMediaFlowId],
		sourceDuration: contentProps.sourceDuration,
		postrollDuration: config.studio.ServerPostrollDuration,
		ignoreMediaObjectStatus: config.studio.ClipIgnoreStatus,
		seek: contentProps.seek
	})
}

export function MakeContentServer(
	context: ShowStyleContext,
	sourceLayers: MakeContentServerSourceLayers,
	partProps: ServerPartProps,
	contentProps: ServerContentProps
): WithTimeline<VTContent> {
	return literal<WithTimeline<VTContent>>({
		...GetVTContentProperties(context.config, contentProps),
		ignoreMediaObjectStatus: true,
		timelineObjects: GetServerTimeline(context, sourceLayers, partProps, contentProps)
	})
}

function GetServerTimeline(
	context: ShowStyleContext,
	sourceLayers: MakeContentServerSourceLayers,
	partProps: ServerPartProps,
	contentProps: ServerContentProps
): TimelineObjectCoreExt[] {
	const serverEnableClass = `.${GetEnableClassForServer(contentProps.mediaPlayerSession)}`

	const mediaObj: TSR.TimelineObjCCGMedia & TimelineBlueprintExt = {
		id: '',
		enable: {
			while: serverEnableClass
		},
		priority: 1,
		layer: sourceLayers.Caspar.ClipPending,
		content: {
			deviceType: TSR.DeviceType.CASPARCG,
			type: TSR.TimelineContentTypeCasparCg.MEDIA,
			file: contentProps.file,
			loop: partProps.adLibPix,
			seek: contentProps.seek,
			length: contentProps.seek ? contentProps.clipDuration : undefined,
			inPoint: contentProps.seek ? 0 : undefined,
			playing: true
		},
		metaData: {
			mediaPlayerSession: contentProps.mediaPlayerSession
		}
	}

	const mediaOffObj = JSON.parse(JSON.stringify(mediaObj)) as TSR.TimelineObjCCGMedia & TimelineBlueprintExt
	mediaOffObj.enable = { while: `!${serverEnableClass}` }
	mediaOffObj.content.playing = false
	mediaOffObj.content.noStarttime = true

	const audioEnable = {
		while: serverEnableClass
	}
	return [
		mediaObj,
		mediaOffObj,
		...GetSisyfosTimelineObjForServer(
			context.config,
			partProps.voLevels,
			sourceLayers.Sisyfos.ClipPending,
			contentProps.mediaPlayerSession,
			audioEnable
		),
		...(context.uniformConfig.switcherLLayers.nextServerAux
			? [
					context.videoSwitcher.getAuxTimelineObject({
						layer: context.uniformConfig.switcherLLayers.nextServerAux,
						content: {
							input: -1
						},
						metaData: {
							mediaPlayerSession: contentProps.mediaPlayerSession
						}
					})
			  ]
			: [])
	]
}

export function CutToServer(
	context: ShowStyleContext,
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition
): TimelineBlueprintExt[] {
	return [
		EnableServer(mediaPlayerSessionId),
		...context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
			enable: {
				start: context.config.studio.CasparPrerollDuration
			},
			priority: 1,
			content: {
				input: -1,
				transition: partDefinition.transition?.style ?? TransitionStyle.CUT,
				transitionDuration: partDefinition.transition?.duration
			},
			metaData: {
				mediaPlayerSession: mediaPlayerSessionId
			}
		})
	]
}

export function EnableServer(mediaPlayerSessionId: string) {
	return literal<TSR.TimelineObjAbstractAny & TimelineBlueprintExt>({
		id: '',
		enable: {
			start: 0
		},
		layer: AbstractLLayer.SERVER_ENABLE_PENDING,
		content: {
			deviceType: TSR.DeviceType.ABSTRACT
		},
		metaData: {
			mediaPlayerSession: mediaPlayerSessionId
		},
		classes: [GetEnableClassForServer(mediaPlayerSessionId)]
	})
}

export function getSourceDuration(
	mediaObjectDuration: number | undefined,
	serverPostrollDuration: number
): number | undefined {
	return mediaObjectDuration !== undefined ? Math.max(mediaObjectDuration - serverPostrollDuration, 0) : undefined
}
