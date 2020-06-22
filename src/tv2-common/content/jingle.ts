import { TimelineObjectCoreExt, TSR, VTContent } from 'tv-automation-sofie-blueprints-integration'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { literal } from '../util'

export interface JingleLayers {
	Caspar: {
		PlayerJingle: string
		PlayerJingleLookahead: string
	}
	ATEM: {
		DSKJingle: string
		USKCleanEffekt?: string
		USKJinglePreview?: string
	}
	Sisyfos: {
		PlayerJingle: string
	}
	basePath: string
}

export function CreateJingleContentBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(config: ShowStyleConfig, file: string, loadFirstFrame: boolean, layers: JingleLayers, preMultiplied: boolean) {
	const jinglePath = `${layers.basePath.replace(/[\/\\]*$/, '')}/file`
	return literal<VTContent>({
		studioLabel: '',
		fileName: file,
		path: jinglePath,
		firstWords: '',
		lastWords: '',
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
					file: jinglePath
				}
			}),

			...(loadFirstFrame
				? [
						literal<TSR.TimelineObjCCGMedia & TimelineBlueprintExt>({
							id: '',
							enable: { start: 0 },
							priority: 1,
							layer: layers.Caspar.PlayerJingleLookahead,
							content: {
								deviceType: TSR.DeviceType.CASPARCG,
								type: TSR.TimelineContentTypeCasparCg.MEDIA,
								file: jinglePath
							},
							classes: ['DEBUG_CLASS']
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

			literal<TSR.TimelineObjSisyfosAny & TimelineBlueprintExt>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: layers.Sisyfos.PlayerJingle,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.SISYFOS,
					isPgm: 1
				}
			})
		])
	})
}
