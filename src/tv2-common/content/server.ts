import { IShowStyleUserContext, TimelineObjectCoreExt, TSR, VTContent, WithTimeline } from 'blueprints-integration'
import { GetSisyfosTimelineObjForServer, literal, PartDefinition, TransitionSettings } from 'tv2-common'
import { AbstractLLayer, ControlClasses, GetEnableClassForServer } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { ServerContentProps, ServerPartProps } from '../parts'
import { AdlibServerOfftubeOptions } from '../pieces'
import { joinAssetToNetworkPath } from '../util'

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
	_context: IShowStyleUserContext,
	config: TV2BlueprintConfig,
	sourceLayers: MakeContentServerSourceLayers,
	partProps: ServerPartProps,
	contentProps: ServerContentProps
): WithTimeline<VTContent> {
	return literal<WithTimeline<VTContent>>({
		...GetVTContentProperties(config, contentProps),
		ignoreMediaObjectStatus: true,
		timelineObjects: GetServerTimeline(config, sourceLayers, partProps, contentProps)
	})
}

function GetServerTimeline(
	config: TV2BlueprintConfig,
	sourceLayers: MakeContentServerSourceLayers,
	partProps: ServerPartProps,
	contentProps: ServerContentProps
): Array<TimelineObjectCoreExt<TSR.TSRTimelineContent>> {
	const serverEnableClass = `.${GetEnableClassForServer(contentProps.mediaPlayerSession)}`

	const mediaObj: TSR.TSRTimelineObj<TSR.TimelineContentCCGMedia> & TimelineBlueprintExt = {
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

	const mediaOffObj = JSON.parse(JSON.stringify(mediaObj)) as TSR.TSRTimelineObj<TSR.TimelineContentCCGMedia> &
		TimelineBlueprintExt
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
			config,
			partProps.voLevels,
			sourceLayers.Sisyfos.ClipPending,
			contentProps.mediaPlayerSession,
			audioEnable
		),
		...(sourceLayers.ATEM.ServerLookaheadAux
			? [
					literal<TSR.TSRTimelineObj<TSR.TimelineContentAtemAUX> & TimelineBlueprintExt>({
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
	]
}

export function CutToServer(
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition,
	config: TV2BlueprintConfig,
	atemLLayerMEPGM: string,
	offtubeOptions?: AdlibServerOfftubeOptions
) {
	return [
		EnableServer(mediaPlayerSessionId),
		literal<TSR.TSRTimelineObj<TSR.TimelineContentAtemME> & TimelineBlueprintExt>({
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
			classes: [...(offtubeOptions?.isOfftube ? [ControlClasses.AbstractLookahead] : [])]
		})
	]
}

export function EnableServer(mediaPlayerSessionId: string) {
	return literal<TSR.TSRTimelineObj<TSR.TimelineContentAbstractAny> & TimelineBlueprintExt>({
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
