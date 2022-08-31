import {
	IShowStyleUserContext,
	TimelineObjectCoreExt,
	TSR,
	VTContent,
	WithTimeline
} from '@tv2media/blueprints-integration'
import {
	AddParentClass,
	GetSisyfosTimelineObjForServer,
	literal,
	PartDefinition,
	ServerParentClass,
	TransitionSettings
} from 'tv2-common'
import { AbstractLLayer, ControlClasses, GetEnableClassForServer } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { ServerContentProps, ServerPartProps } from '../parts'
import { AdlibServerOfftubeOptions } from '../pieces'
import { JoinAssetToNetworkPath } from '../util'

// TODO: These are TSR layers, not sourcelayers
export interface MakeContentServerSourceLayers {
	Caspar: {
		ClipPending: string
	}
	Sisyfos: {
		ClipPending: string
	}
	ATEM: {
		ServerLookaheadAux?: string
	}
}

type VTProps = Pick<
	VTContent,
	'fileName' | 'path' | 'mediaFlowIds' | 'ignoreMediaObjectStatus' | 'sourceDuration' | 'postrollDuration' | 'seek'
>

export function GetVTContentProperties(
	config: TV2BlueprintConfig,
	contentProps: Omit<ServerContentProps, 'mediaPlayerSession'>
): VTProps {
	return literal<VTProps>({
		fileName: contentProps.file,
		path: JoinAssetToNetworkPath(
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
	_context: IShowStyleUserContext,
	partDefinition: PartDefinition,
	config: TV2BlueprintConfig,
	sourceLayers: MakeContentServerSourceLayers,
	partProps: ServerPartProps,
	contentProps: ServerContentProps
): WithTimeline<VTContent> {
	return literal<WithTimeline<VTContent>>({
		...GetVTContentProperties(config, contentProps),
		ignoreMediaObjectStatus: true,
		timelineObjects: GetServerTimeline(partDefinition, config, sourceLayers, partProps, contentProps)
	})
}

function GetServerTimeline(
	partDefinition: PartDefinition,
	config: TV2BlueprintConfig,
	sourceLayers: MakeContentServerSourceLayers,
	partProps: ServerPartProps,
	contentProps: ServerContentProps
) {
	const serverEnableClass = `.${GetEnableClassForServer(contentProps.mediaPlayerSession)}`

	const mediaObj = literal<TSR.TimelineObjCCGMedia & TimelineBlueprintExt>({
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
			playing: true
		},
		metaData: {
			mediaPlayerSession: contentProps.mediaPlayerSession
		},
		classes: [
			...(AddParentClass(config, partDefinition) && !partProps.adLibPix
				? [ServerParentClass('studio0', contentProps.file)]
				: [])
		]
	})

	const mediaOffObj = JSON.parse(JSON.stringify(mediaObj)) as TSR.TimelineObjCCGMedia & TimelineBlueprintExt
	mediaOffObj.enable = { while: `!${serverEnableClass}` }
	mediaOffObj.content.playing = false

	const audioEnable = {
		while: serverEnableClass
	}
	return literal<TimelineObjectCoreExt[]>([
		mediaObj,
		mediaOffObj,
		...GetSisyfosTimelineObjForServer(
			config,
			partProps.voLevels,
			sourceLayers.Sisyfos.ClipPending,
			contentProps.mediaPlayerSession,
			audioEnable
		),
		...(sourceLayers.ATEM.ServerLookaheadAux
			? [
					literal<TSR.TimelineObjAtemAUX & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 0,
						layer: sourceLayers.ATEM.ServerLookaheadAux,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.AUX,
							aux: {
								input: -1
							}
						},
						metaData: {
							mediaPlayerSession: contentProps.mediaPlayerSession
						}
					})
			  ]
			: [])
	])
}

export function CutToServer(
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition,
	config: TV2BlueprintConfig,
	atemLLayerMEPGM: string,
	adLib?: boolean,
	offtubeOptions?: AdlibServerOfftubeOptions
) {
	return [
		EnableServer(mediaPlayerSessionId),
		literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
			id: '',
			enable: {
				start: config.studio.CasparPrerollDuration
			},
			priority: 1,
			layer: atemLLayerMEPGM,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,
				me: {
					input: -1,
					transition: partDefinition.transition ? partDefinition.transition.style : TSR.AtemTransitionStyle.CUT,
					transitionSettings: TransitionSettings(config, partDefinition)
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
	]
}

export function EnableServer(mediaPlayerSessionId: string) {
	return literal<TSR.TimelineObjAbstractAny & TimelineBlueprintExt>({
		id: '',
		enable: {
			start: 0
		},
		layer: AbstractLLayer.ServerEnablePending,
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
