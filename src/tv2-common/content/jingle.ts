import { TimelineObjectCoreExt, TSR, VTContent, WithTimeline } from 'blueprints-integration'
import {
	findDskJingle,
	getDskOnAirTimelineObjects,
	getTimeFromFrames,
	MixEffectProps,
	PartDefinition,
	ShowStyleContext,
	TransitionStyle
} from 'tv2-common'
import { DskRole } from 'tv2-constants'
import {
	TableConfigItemBreaker,
	TV2BlueprintConfigBase,
	TV2ShowStyleConfig,
	TV2StudioConfigBase
} from '../blueprintConfig'
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

export function createJingleExpectedMedia(
	config: TV2ShowStyleConfig,
	jingle: string,
	breakerConfig: TableConfigItemBreaker
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
		previewFrame: breakerConfig.StartAlpha,
		ignoreMediaObjectStatus: config.studio.JingleIgnoreStatus,
		ignoreBlackFrames: true,
		ignoreFreezeFrame: true,
		sourceDuration: getTimeFromFrames(breakerConfig.Duration - breakerConfig.EndAlpha),
		postrollDuration: getTimeFromFrames(breakerConfig.EndAlpha),
		timelineObjects: []
	})
}

export function CreateJingleContentBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ShowStyleContext<ShowStyleConfig>,
	file: string,
	breakerConfig: TableConfigItemBreaker,
	layers: JingleLayers
) {
	const { config } = context
	const fileName = joinAssetToFolder(config.studio.JingleFolder, file)
	const jingleDsk = findDskJingle(config)
	return literal<WithTimeline<VTContent>>({
		...createJingleExpectedMedia(config, file, breakerConfig),
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			CreateJingleCasparTimelineObject(fileName, breakerConfig.LoadFirstFrame, layers),
			...context.videoSwitcher.getOnAirTimelineObjects({
				enable: getBreakerMixEffectCutEnable(breakerConfig, config.studio.CasparPrerollDuration),
				priority: 1,
				content: {
					input: jingleDsk.Fill,
					transition: TransitionStyle.CUT
				}
			}),
			...getDskOnAirTimelineObjects(context, DskRole.JINGLE, { start: config.studio.CasparPrerollDuration }),

			// @todo: this is a Qbox-only feature, should be refactored at some point not to use ATEM object directly
			...(context.uniformConfig.switcherLLayers.jingleNextMixEffect
				? [
						literal<TSR.TimelineObjAtemME>({
							id: '',
							enable: {
								start: 0,
								duration: 1
							},
							priority: 1,
							layer: context.uniformConfig.switcherLLayers.jingleNextMixEffect,
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
											fillSource: jingleDsk.Fill,
											cutSource: jingleDsk.Clip,
											maskEnabled: false,
											lumaSettings: {
												clip: jingleDsk.Clip * 10, // input is percents (0-100), atem uses 1-000
												gain: jingleDsk.Gain * 10 // input is percents (0-100), atem uses 1-000
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
							layer: context.uniformConfig.switcherLLayers.jingleNextMixEffect,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {}
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

export function getBreakerMixEffectCutEnable(
	breakerConfig: TableConfigItemBreaker,
	casparPrerollDuration: number
): TSR.TSRTimelineObj['enable'] {
	return {
		start: getTimeFromFrames(breakerConfig.StartAlpha) + casparPrerollDuration,
		duration:
			getTimeFromFrames(breakerConfig.Duration - breakerConfig.StartAlpha - breakerConfig.EndAlpha) +
			casparPrerollDuration
	}
}

export function getVideoMixerMixEffectPropsContentForEffekt(
	mixerInput: number,
	partDefinition: PartDefinition,
	context: ShowStyleContext
): MixEffectProps['content'] {
	if (!partDefinition.effekt) {
		return getRegularMixEffectPropsContentForPartDefinition(mixerInput, partDefinition)
	}

	return doesBreakerHaveAlphaForItsEntireDuration(context, partDefinition.effekt + '')
		? getMixDuringBreakerMixEffectPropsContent(mixerInput)
		: getRegularMixEffectPropsContentForPartDefinition(mixerInput, partDefinition)
}

function getRegularMixEffectPropsContentForPartDefinition(
	mixerInput: number,
	partDefinition: PartDefinition
): MixEffectProps['content'] {
	return {
		input: mixerInput,
		transition: partDefinition.transition?.style ?? TransitionStyle.CUT,
		transitionDuration: partDefinition.transition?.duration
	}
}

export function doesBreakerHaveAlphaForItsEntireDuration(context: ShowStyleContext, breakerName: string): boolean {
	const breaker: TableConfigItemBreaker | undefined = context.config.showStyle.BreakerConfig.find(
		(tableConfigItemBreaker) => tableConfigItemBreaker.BreakerName === breakerName
	)
	if (!breaker) {
		return false
	}

	return breaker.StartAlpha + breaker.EndAlpha === breaker.Duration
}

function getMixDuringBreakerMixEffectPropsContent(mixerInput: number): MixEffectProps['content'] {
	return {
		input: mixerInput,
		transition: TransitionStyle.MIX,
		transitionDuration: 4
	}
}
