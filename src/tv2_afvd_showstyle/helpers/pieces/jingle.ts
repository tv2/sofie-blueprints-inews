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
import {
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionJingle, literal, PartDefinition } from 'tv2-common'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { GetJinglePartProperties } from '../../../tv2_afvd_showstyle/parts/effekt'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { TimelineBlueprintExt } from '../../../tv2_afvd_studio/onTimelineGenerate'
import { BlueprintConfig } from '../config'

export function EvaluateJingle(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	parsedCue: CueDefinitionJingle,
	part: PartDefinition,
	adlib?: boolean,
	rank?: number,
	effekt?: boolean
) {
	if (!config.showStyle.BreakerConfig) {
		context.warning(`Jingles have not been configured`)
		return
	}

	let file = ''

	const jingle = config.showStyle.BreakerConfig.find(brkr =>
		brkr.BreakerName ? brkr.BreakerName.toString().toUpperCase() === parsedCue.clip.toUpperCase() : false
	)
	if (!jingle) {
		context.warning(`Jingle ${parsedCue.clip} is not configured`)
		return
	} else {
		file = jingle.ClipName.toString()
	}

	if (adlib) {
		const p = GetJinglePartProperties(context, config, part)

		if (JSON.stringify(p) === JSON.stringify({})) {
			context.warning(`Could not create adlib for ${parsedCue.clip}`)
			return
		}

		const props = p as Pick<
			IBlueprintPart,
			'autoNext' | 'expectedDuration' | 'prerollDuration' | 'autoNextOverlap' | 'disableOutTransition'
		>

		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank ?? 0,
				externalId: `${part.externalId}-JINGLE-adlib`,
				name: effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip,
				sourceLayerId: SourceLayer.PgmJingle,
				outputLayerId: 'jingle',
				content: createJingleContent(config, file),
				toBeQueued: true,
				adlibAutoNext: props.autoNext,
				adlibAutoNextOverlap: props.autoNextOverlap,
				adlibPreroll: props.prerollDuration,
				expectedDuration: props.expectedDuration,
				adlibDisableOutTransition: props.disableOutTransition
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: `${part.externalId}-JINGLE`,
				name: effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip,
				enable: {
					start: 0
				},
				infiniteMode: PieceLifespan.OutOnNextPart,
				outputLayerId: 'jingle',
				sourceLayerId: SourceLayer.PgmJingle,
				content: createJingleContent(config, file)
			})
		)
	}
}

function createJingleContent(config: BlueprintConfig, file: string) {
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
				},
				classes: ['MIX_MINUS_OVERRIDE_DSK']
			}),
			literal<TimelineObjAtemME>({
				id: '',
				enable: {
					start: Number(config.studio.CasparPrerollDuration)
				},
				priority: 1,
				layer: AtemLLayer.AtemCleanUSKEffect,
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
}
