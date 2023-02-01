import { TimelineObjectCoreExt, TSR, VTContent, WithTimeline } from 'blueprints-integration'
import { EnableDSK, ExtendedShowStyleContext, FindDSKJingle, TimeFromFrames } from 'tv2-common'
import { TV2BlueprintConfigBase, TV2ShowStyleConfig, TV2StudioConfigBase } from '../blueprintConfig'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { joinAssetToFolder, joinAssetToNetworkPath, literal } from '../util'

export interface JingleLayers {
	Caspar: {
		PlayerJingle: string
		PlayerJinglePreload?: string
	}
	ATEM: {
		USKCleanEffekt?: string
		USKJinglePreview?: string
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
		sourceDuration: TimeFromFrames(Number(duration) - Number(alphaAtEnd)),
		postrollDuration: TimeFromFrames(Number(alphaAtEnd)),
		timelineObjects: []
	})
}

export function CreateJingleContentBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ExtendedShowStyleContext<ShowStyleConfig>,
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

			...EnableDSK(context, 'JINGLE', { start: Number(config.studio.CasparPrerollDuration) }),

			// @todo: this is a Qbox-only feature, should be refactored at some point not to use ATEM object directly
			...(layers.ATEM.USKJinglePreview
				? [
						literal<TSR.TimelineObjAtemME>({
							id: '',
							enable: {
								start: 0,
								duration: 1
							},
							priority: 1,
							layer: layers.ATEM.USKJinglePreview,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									transitionProperties: {
										selection: 0b11 // PGM + Key1
									},
									upstreamKeyers: [
										{
											upstreamKeyerId: 0,
											onAir: false,
											mixEffectKeyType: 0,
											flyEnabled: false,
											fillSource: jingleDSK.Fill,
											cutSource: jingleDSK.Clip,
											maskEnabled: false,
											lumaSettings: {
												preMultiplied: false,
												clip: Number(jingleDSK.Clip) * 10, // input is percents (0-100), atem uses 1-000
												gain: Number(jingleDSK.Gain) * 10 // input is percents (0-100), atem uses 1-000
											}
										}
									]
								} as any
							}
						}),
						literal<TSR.TimelineObjAtemME>({
							id: '',
							enable: {
								// Deactive while on air
								start: 1
							},
							priority: 1,
							layer: layers.ATEM.USKJinglePreview,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {}
							}
						})
				  ]
				: []),

			...(layers.ATEM.USKCleanEffekt
				? [
						context.videoSwitcher.getMixEffectTimelineObject({
							enable: {
								start: Number(config.studio.CasparPrerollDuration)
							},
							priority: 1,
							layer: layers.ATEM.USKCleanEffekt,
							content: {
								keyers: [
									{
										id: 0,
										onAir: true,
										config: jingleDSK
									}
								]
							}
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
