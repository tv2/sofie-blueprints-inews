import { TimelineObjectCoreExt, TSR, VTContent, WithTimeline } from 'blueprints-integration'
import { FindDSKJingle, getDskOnAirTimelineObjects, getTimeFromFrames, ShowStyleContext } from 'tv2-common'
import { DskRole } from 'tv2-constants'
import { TV2BlueprintConfigBase, TV2ShowStyleConfig, TV2StudioConfigBase } from '../blueprintConfig'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { joinAssetToFolder, joinAssetToNetworkPath, literal } from '../util'

export interface JingleLayers {
	Caspar: {
		PlayerJingle: string
		PlayerJinglePreload?: string
	}
	Sisyfos: {
		PlayerJingle: string
	}
}

export function CreateJingleExpectedMedia(
	config: TV2ShowStyleConfig,
	jingle: string,
	alphaAtStart: number,
	duration: number,
	alphaAtEnd: number
) {
	const fileName = joinAssetToFolder(config.studio.JingleFolder, jingle)

	return literal<WithTimeline<VTContent>>({
		fileName,
		path: joinAssetToNetworkPath(
			config.studio.JingleNetworkBasePath,
			config.studio.JingleFolder,
			jingle,
			config.studio.JingleFileExtension
		), // full path on the source network storage
		mediaFlowIds: [config.studio.JingleMediaFlowId],
		previewFrame: alphaAtStart,
		ignoreMediaObjectStatus: config.studio.JingleIgnoreStatus,
		ignoreBlackFrames: true,
		ignoreFreezeFrame: true,
		sourceDuration: getTimeFromFrames(Number(duration) - Number(alphaAtEnd)),
		postrollDuration: getTimeFromFrames(Number(alphaAtEnd)),
		timelineObjects: []
	})
}

export function CreateJingleContentBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ShowStyleContext<ShowStyleConfig>,
	file: string,
	alphaAtStart: number,
	loadFirstFrame: boolean,
	duration: number,
	alphaAtEnd: number,
	layers: JingleLayers
) {
	const { config } = context
	const fileName = joinAssetToFolder(config.studio.JingleFolder, file)
	const jingleDSK = FindDSKJingle(config)
	return literal<WithTimeline<VTContent>>({
		...CreateJingleExpectedMedia(config, file, alphaAtStart, duration, alphaAtEnd),
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			CreateJingleCasparTimelineObject(fileName, loadFirstFrame, layers),

			...getDskOnAirTimelineObjects(context, DskRole.JINGLE, { start: Number(config.studio.CasparPrerollDuration) }),

			...(context.uniformConfig.switcherLLayers.jingleNextMixEffect
				? [
						context.videoSwitcher.getMixEffectTimelineObject({
							enable: {
								start: 0,
								duration: 1
							},
							priority: 1,
							layer: context.uniformConfig.switcherLLayers.jingleNextMixEffect,
							content: {
								transitionKeyers: true,
								keyers: [{ onAir: false, config: { ...jingleDSK, Number: 0 } }]
							}
						}),
						context.videoSwitcher.getMixEffectTimelineObject({
							enable: {
								// Deactive while on air
								start: 1
							},
							priority: 1,
							layer: context.uniformConfig.switcherLLayers.jingleNextMixEffect,
							content: {}
						})
				  ]
				: []),

			literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: layers.Sisyfos.PlayerJingle,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNEL,
					isPgm: 1
				}
			})
		])
	})
}

function CreateJingleCasparTimelineObject(
	fileName: string,
	loadFirstFrame: boolean,
	layers: JingleLayers
): TSR.TimelineObjCCGMedia & TimelineBlueprintExt {
	return {
		id: '',
		enable: { start: 0 },
		priority: 1,
		layer:
			loadFirstFrame && layers.Caspar.PlayerJinglePreload
				? layers.Caspar.PlayerJinglePreload
				: layers.Caspar.PlayerJingle,
		content: {
			deviceType: TSR.DeviceType.CASPARCG,
			type: TSR.TimelineContentTypeCasparCg.MEDIA,
			file: fileName
		}
	}
}
