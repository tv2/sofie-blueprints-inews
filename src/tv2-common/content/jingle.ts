import { TimelineObjectCoreExt, TSR, VTContent } from 'tv-automation-sofie-blueprints-integration'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import { literal } from '../util'

export interface JingleLayers {
	Caspar: {
		PlayerJingle: string
	}
	ATEM: {
		DSKJingle: string
		USKCleanEffekt?: string
	}
	Sisyfos: {
		PlayerJingle: string
	}
}

export function CreateJingleContentBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(config: ShowStyleConfig, file: string, layers: JingleLayers, preMultiplied: boolean) {
	return literal<VTContent>({
		studioLabel: '',
		fileName: file,
		path: file,
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
					file
				}
			}),

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
