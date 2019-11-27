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
	TransitionContent,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'
import { CueDefinitionJingle, CueType } from '../inewsConversion/converters/ParseCue'
import { SourceLayer } from '../layers'
import { TimeFromFrames } from './time/frameTime'

export function GetBreakerEffekt(
	_context: PartContext,
	config: BlueprintConfig,
	part: PartDefinition
): Pick<IBlueprintPart, 'expectedDuration'> | {} {
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
					expectedDuration: TimeFromFrames(Number(realBreaker.Duration))
				}
			}
		}
	}
	return {}
}

export function EffektTransitionPiece(
	context: PartContext,
	config: BlueprintConfig,
	part: PartDefinition
): IBlueprintPiece[] {
	const pieces: IBlueprintPiece[] = []

	if (!part.effekt) {
		return pieces
	}

	const effektConfig = config.showStyle.WipesConfig.find(conf => Number(conf.EffektNumber) === part.effekt)

	if (effektConfig) {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: part.externalId,
				name: `EFFEKT ${part.effekt}`,
				enable: {
					start: 0
				},
				outputLayerId: 'jingle',
				sourceLayerId: SourceLayer.PgmJingle,
				infiniteMode: PieceLifespan.Normal,
				isTransition: true,
				content: literal<TransitionContent & VTContent>({
					fileName: effektConfig.ClipName.toString(),
					path: effektConfig.ClipName.toString(),
					firstWords: '',
					lastWords: '',
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TimelineObjCCGMedia>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: CasparLLayer.CasparPlayerJingle,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.MEDIA,
								file: effektConfig.ClipName.toString()
							}
						}),

						literal<TimelineObjAtemDSK>({
							id: '',
							enable: {
								start: 0
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
										clip: 393,
										gain: 209,
										mask: {
											enabled: false
										}
									}
								}
							}
						}),

						literal<TimelineObjSisyfosAny>({
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
	} else {
		context.warning(`Could not find EFFEKT ${part.effekt}`)
	}

	return pieces
}
