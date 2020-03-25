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
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	TimelineObjectCoreExt,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionJingle, GetJinglePartProperties, literal, PartDefinition, TimelineBlueprintExt } from 'tv2-common'
import { AdlibTags } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeEvaluateJingle(
	context: PartContext,
	config: OffTubeShowstyleBlueprintConfig,
	_pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	parsedCue: CueDefinitionJingle,
	part: PartDefinition,
	_adlib?: boolean,
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
			sourceLayerId: OffTubeSourceLayer.PgmJingle,
			outputLayerId: 'jingle',
			content: createJingleContent(config, file),
			toBeQueued: true,
			adlibAutoNext: props.autoNext,
			adlibAutoNextOverlap: props.autoNextOverlap,
			adlibPreroll: props.prerollDuration,
			expectedDuration: props.expectedDuration,
			adlibDisableOutTransition: props.disableOutTransition,
			tags: [AdlibTags.OFFTUBE_100pc_SERVER] // TODO: Maybe this should be different?
		})
	)
}

function createJingleContent(config: OffTubeShowstyleBlueprintConfig, file: string) {
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
				layer: OfftubeCasparLLayer.CasparPlayerJingle,
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
				layer: OfftubeAtemLLayer.AtemDSKGraphics,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.DSK,
					dsk: {
						onAir: true,
						sources: {
							fillSource: config.studio.AtemSource.DSK1F,
							cutSource: config.studio.AtemSource.DSK1K
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

			literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: OfftubeSisyfosLLayer.SisyfosSourceJingle,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: 1
				}
			})
		])
	})
}
