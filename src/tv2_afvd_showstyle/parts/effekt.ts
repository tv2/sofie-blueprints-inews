import {
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal, PartContext2, PartDefinition, TimeFromFrames, TimelineBlueprintExt } from 'tv2-common'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { SourceLayer } from '../layers'

export function CreateEffektForpart(
	context: PartContext2,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[]
):
	| {
			tranisitionDuration: number
			transitionKeepaliveDuration: number
			transitionPrerollDuration: number
			autoNext: false
	  }
	| {} {
	const effekt = partDefinition.effekt
	if (effekt === undefined) {
		return {}
	}

	if (!config.showStyle.BreakerConfig) {
		context.warning(`Jingles have not been configured`)
		return {}
	}

	const effektConfig = config.showStyle.BreakerConfig.find(
		conf =>
			conf.BreakerName.toString()
				.trim()
				.toUpperCase() === effekt.toString().toUpperCase()
	)
	if (!effektConfig) {
		context.warning(`Could not find effekt ${effekt}`)
		return {}
	}

	const file = effektConfig.ClipName.toString()

	if (!file) {
		context.warning(`Could not find file for ${effekt}`)
		return {}
	}

	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: `${partDefinition.externalId}-EFFEKT-${effekt}`,
			name: `EFFEKT-${effekt}`,
			enable: { start: 0, duration: TimeFromFrames(Number(effektConfig.Duration)) },
			outputLayerId: 'jingle',
			sourceLayerId: SourceLayer.PgmJingle,
			infiniteMode: PieceLifespan.Normal,
			isTransition: true,
			content: literal<VTContent>({
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
						layer: CasparLLayer.CasparPlayerJingle,
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
						layer: AtemLLayer.AtemDSKEffect,
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
									preMultiply: false,
									clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000,
									gain: config.studio.AtemSettings.CCGGain * 10, // input is percents (0-100), atem uses 1-000,
									mask: {
										enabled: false
									}
								}
							}
						}
					}),
					literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: SisyfosLLAyer.SisyfosSourceJingle,
						content: {
							deviceType: TSR.DeviceType.SISYFOS,
							type: TSR.TimelineContentTypeSisyfos.CHANNEL,
							isPgm: 1
						}
					})
				])
			})
		})
	)

	return {
		transitionDuration: TimeFromFrames(Number(effektConfig.Duration)) + config.studio.CasparPrerollDuration,
		transitionKeepaliveDuration: TimeFromFrames(Number(effektConfig.StartAlpha)) + config.studio.CasparPrerollDuration,
		transitionPrerollDuration:
			TimeFromFrames(Number(effektConfig.Duration)) -
			TimeFromFrames(Number(effektConfig.EndAlpha)) +
			config.studio.CasparPrerollDuration,
		autoNext: false
	}
}
