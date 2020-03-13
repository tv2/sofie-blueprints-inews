import {
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjAtemDSK,
	TimelineObjCCGMedia,
	TimelineObjSisyfosAny
} from 'timeline-state-resolver-types'
import {
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import { PartDefinition } from '../../common/inewsConversion/converters/ParseBody'
import { CueDefinitionJingle, CueType } from '../../common/inewsConversion/converters/ParseCue'
import { literal } from '../../common/util'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { TimelineBlueprintExt } from '../../tv2_afvd_studio/onTimelineGenerate'
import { BlueprintConfig } from '../helpers/config'
import { SourceLayer } from '../layers'
import { TimeFromFrames } from '../../common/frameTime'

export function GetJinglePartProperties(
	_context: PartContext,
	config: BlueprintConfig,
	part: PartDefinition
):
	| Pick<
			IBlueprintPart,
			'autoNext' | 'expectedDuration' | 'prerollDuration' | 'autoNextOverlap' | 'disableOutTransition'
	  >
	| {} {
	if (part.cues) {
		const cue = part.cues.find(c => c.type === CueType.Jingle) as CueDefinitionJingle
		if (cue) {
			const realBreaker = config.showStyle.BreakerConfig.find(conf => {
				return conf.BreakerName && typeof conf.BreakerName === 'string'
					? conf.BreakerName.toString()
							.trim()
							.toUpperCase() === cue.clip.toUpperCase()
					: false
			})

			if (realBreaker) {
				return {
					expectedDuration:
						TimeFromFrames(Number(realBreaker.Duration)) -
						TimeFromFrames(Number(realBreaker.EndAlpha)) -
						TimeFromFrames(Number(realBreaker.StartAlpha)),
					prerollDuration: config.studio.CasparPrerollDuration + TimeFromFrames(Number(realBreaker.StartAlpha)),
					autoNextOverlap: TimeFromFrames(Number(realBreaker.EndAlpha)),
					autoNext: realBreaker.Autonext === true,
					disableOutTransition: true
				}
			}
		}
	}
	return {}
}

export function CreateEffektForpart(
	context: PartContext,
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
					literal<TimelineObjCCGMedia & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: CasparLLayer.CasparPlayerJingle,
						content: {
							deviceType: DeviceType.CASPARCG,
							type: TimelineContentTypeCasparCg.MEDIA,
							file
						}
					}),
					literal<TimelineObjAtemDSK>({
						id: '',
						enable: {
							start: Number(config.studio.CasparPrerollDuration)
						},
						priority: 1,
						layer: AtemLLayer.AtemDSKEffect,
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
					literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: SisyfosLLAyer.SisyfosSourceJingle,
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
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
