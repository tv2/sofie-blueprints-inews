import {
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjAtemDSK,
	TimelineObjAtemME,
	TimelineObjCCGMedia,
	TimelineObjSisyfosAny
} from 'timeline-state-resolver-types'
import { TimelineObjectCoreExt, VTContent } from 'tv-automation-sofie-blueprints-integration'
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

export interface JingleUSK {
	useUSK: boolean
	sourceUSK: number
}

export function CreateJingleContentBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(config: ShowStyleConfig, file: string, layers: JingleLayers, preMultiplied: boolean, usk?: JingleUSK) {
	return literal<VTContent>({
		studioLabel: '',
		fileName: file,
		path: file,
		firstWords: '',
		lastWords: '',
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TimelineObjCCGMedia & TimelineBlueprintExt>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: layers.Caspar.PlayerJingle,
				content: {
					deviceType: DeviceType.CASPARCG,
					type: TimelineContentTypeCasparCg.MEDIA,
					file
				}
			}),

			...(usk?.useUSK
				? [
						literal<TimelineObjAtemME>({
							id: '',
							enable: {
								start: Number(config.studio.CasparPrerollDuration)
							},
							priority: 1,
							layer: layers.ATEM.DSKJingle,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									upstreamKeyers: [
										{
											upstreamKeyerId: usk.sourceUSK,
											onAir: true,
											mixEffectKeyType: 0,
											flyEnabled: false,
											fillSource: config.studio.AtemSource.JingleFill,
											cutSource: config.studio.AtemSource.JingleKey,
											maskEnabled: false,
											lumaSettings: {
												preMultiplied,
												clip: config.studio.AtemSettings.CCGClip,
												gain: config.studio.AtemSettings.CCGGain
											}
										}
									]
								}
							},
							classes: ['MIX_MINUS_OVERRIDE_DSK']
						})
				  ]
				: [
						literal<TimelineObjAtemDSK>({
							id: '',
							enable: {
								start: Number(config.studio.CasparPrerollDuration)
							},
							priority: 1,
							layer: layers.ATEM.DSKJingle,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.DSK,
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
						})
				  ]),

			...(layers.ATEM.USKCleanEffekt
				? [
						literal<TimelineObjAtemME>({
							id: '',
							enable: {
								start: Number(config.studio.CasparPrerollDuration)
							},
							priority: 1,
							layer: layers.ATEM.USKCleanEffekt,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
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
												preMultiplied: false,
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

			literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: layers.Sisyfos.PlayerJingle,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: 1
				}
			})
		])
	})
}
