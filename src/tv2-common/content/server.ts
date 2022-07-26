import { TimelineObjectCoreExt, TSR, VTContent, WithTimeline } from '@tv2media/blueprints-integration'
import {
	AddParentClass,
	GetSisyfosTimelineObjForServer,
	literal,
	PartDefinition,
	ServerParentClass,
	TransitionFromString,
	TransitionSettings
} from 'tv2-common'
import { AbstractLLayer, ControlClasses, GetEnableClassForServer } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
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
	file: string,
	seek?: number,
	sourceDuration?: number
): VTProps {
	return literal<VTProps>({
		fileName: file,
		path: JoinAssetToNetworkPath(
			config.studio.ClipNetworkBasePath,
			config.studio.ClipFolder,
			file,
			config.studio.ClipFileExtension
		), // full path on the source network storage
		mediaFlowIds: [config.studio.ClipMediaFlowId],
		sourceDuration: sourceDuration && sourceDuration > 0 ? sourceDuration : undefined,
		postrollDuration: config.studio.ServerPostrollDuration,
		ignoreMediaObjectStatus: config.studio.ClipIgnoreStatus,
		seek
	})
}

export function MakeContentServer(
	file: string,
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition,
	config: TV2BlueprintConfig,
	sourceLayers: MakeContentServerSourceLayers,
	adLibPix: boolean,
	voLevels: boolean,
	seek?: number,
	sourceDuration?: number
): WithTimeline<VTContent> {
	return literal<WithTimeline<VTContent>>({
		...GetVTContentProperties(config, file, seek, sourceDuration),
		ignoreMediaObjectStatus: true,
		timelineObjects: GetServerTimeline(
			file,
			mediaPlayerSessionId,
			partDefinition,
			config,
			sourceLayers,
			adLibPix,
			voLevels,
			seek
		)
	})
}

function GetServerTimeline(
	file: string,
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition,
	config: TV2BlueprintConfig,
	sourceLayers: MakeContentServerSourceLayers,
	adLibPix?: boolean,
	voLevels?: boolean,
	seek?: number
) {
	const serverEnableClass = `.${GetEnableClassForServer(mediaPlayerSessionId)}`

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
			file,
			loop: adLibPix,
			seek,
			// length: duration,
			playing: true
		},
		metaData: {
			mediaPlayerSession: mediaPlayerSessionId
		},
		classes: [...(AddParentClass(config, partDefinition) && !adLibPix ? [ServerParentClass('studio0', file)] : [])]
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
			!!voLevels,
			sourceLayers.Sisyfos.ClipPending,
			mediaPlayerSessionId,
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
							mediaPlayerSession: mediaPlayerSessionId
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
