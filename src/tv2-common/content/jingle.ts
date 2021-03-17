import { TimelineObjectCoreExt, TSR, VTContent } from '@sofie-automation/blueprints-integration'
import { TimeFromFrames } from 'tv2-common'
import { TV2BlueprintConfig, TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { literal } from '../util'

export interface JingleLayers {
	Caspar: {
		PlayerJingle: string
		PlayerJingleLookahead?: string
	}
	ATEM: {
		DSKJingle: string
		USKCleanEffekt?: string
		USKJinglePreview?: string
	}
	Sisyfos: {
		PlayerJingle: string
	}
}

function GetJingleFileName(config: TV2BlueprintConfig, jingle: string): string {
	return config.studio.JingleFolder ? `${config.studio.JingleFolder}/${jingle}` : ''
}

export function CreateJingleExpectedMedia(
	config: TV2BlueprintConfig,
	jingle: string,
	alphaAtStart: number,
	duration: number,
	alphaAtEnd: number
) {
	const fileName = GetJingleFileName(config, jingle)

	return literal<VTContent>({
		studioLabel: '',
		fileName,
		path: `${config.studio.JingleNetworkBasePath}\\${
			config.studio.JingleFolder ? `${config.studio.JingleFolder}\\` : ''
		}${jingle}${config.studio.JingleFileExtension}`, // full path on the source network storage
		mediaFlowIds: [config.studio.JingleMediaFlowId],
		firstWords: '',
		lastWords: '',
		previewFrame: alphaAtStart,
		ignoreMediaObjectStatus: config.studio.JingleIgnoreStatus,
		ignoreBlackFrames: true,
		ignoreFreezeFrame: true,
		sourceDuration: TimeFromFrames(Number(duration) - Number(alphaAtEnd)),
		timelineObjects: []
	})
}

export function CreateJingleContentBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	config: ShowStyleConfig,
	file: string,
	alphaAtStart: number,
	loadFirstFrame: boolean,
	duration: number,
	alphaAtEnd: number,
	layers: JingleLayers,
	preMultiplied: boolean
) {
	const fileName = GetJingleFileName(config, file)
	return literal<VTContent>({
		...CreateJingleExpectedMedia(config, file, alphaAtStart, duration, alphaAtEnd),
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TSR.TimelineObjCCGMedia & TimelineBlueprintExt>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: layers.Caspar.PlayerJingle,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file: fileName
				}
			}),

			...(loadFirstFrame && layers.Caspar.PlayerJingleLookahead
				? [
						literal<TSR.TimelineObjCCGMedia & TimelineBlueprintExt>({
							id: '',
							enable: { start: 0 },
							priority: 1,
							layer: layers.Caspar.PlayerJingleLookahead,
							content: {
								deviceType: TSR.DeviceType.CASPARCG,
								type: TSR.TimelineContentTypeCasparCg.MEDIA,
								file: fileName
							}
						})
				  ]
				: []),

			literal<TSR.TimelineObjAtemDSK>({
				id: '',
				enable: {
					start: Number(config.studio.CasparPrerollDuration)
				},
				priority: 1,
				layer: layers.ATEM.DSKJingle,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.DSK,
					dsk: {
						onAir: true,
						sources: {
							fillSource: config.studio.AtemSource.JingleFill,
							cutSource: config.studio.AtemSource.JingleKey
						},
						properties: {
							tie: false,
							preMultiply: preMultiplied,
							clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000,
							gain: config.studio.AtemSettings.CCGGain * 10, // input is percents (0-100), atem uses 1-000,
							mask: {
								enabled: false
							}
						}
					}
				},
				classes: ['MIX_MINUS_OVERRIDE_DSK']
			}),

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
											fillSource: config.studio.AtemSource.JingleFill,
											cutSource: config.studio.AtemSource.JingleKey,
											maskEnabled: false,
											lumaSettings: {
												preMultiplied,
												clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000
												gain: config.studio.AtemSettings.CCGGain * 10 // input is percents (0-100), atem uses 1-000
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
						literal<TSR.TimelineObjAtemME>({
							id: '',
							enable: {
								start: Number(config.studio.CasparPrerollDuration)
							},
							priority: 1,
							layer: layers.ATEM.USKCleanEffekt,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									upstreamKeyers: [
										{
											upstreamKeyerId: 0,
											onAir: true,
											mixEffectKeyType: 0,
											flyEnabled: false,
											fillSource: config.studio.AtemSource.JingleFill,
											cutSource: config.studio.AtemSource.JingleKey,
											maskEnabled: false,
											lumaSettings: {
												preMultiplied,
												clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000
												gain: config.studio.AtemSettings.CCGGain * 10 // input is percents (0-100), atem uses 1-000
											}
										}
									]
								}
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
