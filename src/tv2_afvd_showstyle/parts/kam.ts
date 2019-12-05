import {
	AtemTransitionStyle,
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
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	SourceLayerType,
	TimelineObjectCoreExt,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { FindSourceInfoStrict } from '../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { TimelineBlueprintExt } from '../../tv2_afvd_studio/onTimelineGenerate'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { GetSisyfosTimelineObjForCamera } from '../helpers/sisyfos/sisyfos'
import { TransitionFromString } from '../helpers/transitionFromString'
import { TransitionSettings } from '../helpers/transitionSettings'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'
import { CueType } from '../inewsConversion/converters/ParseCue'
import { SourceLayer } from '../layers'
import { CreatePartInvalid } from './invalid'
import { TimeFromFrames } from './time/frameTime'
import { PartTime } from './time/partTime'

export function CreatePartKam(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(partDefinition, totalWords)

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		typeVariant: ''
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	if (partDefinition.rawType.match(/kam cs 3/i)) {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partDefinition.externalId,
				name: 'CS 3 (JINGLE)',
				enable: { start: 0 },
				outputLayerId: 'pgm',
				sourceLayerId: SourceLayer.PgmJingle,
				infiniteMode: PieceLifespan.OutOnNextPart,
				content: {
					studioLabel: '',
					switcherInput: config.studio.AtemSource.JingleFill,
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TimelineObjAtemME>({
							id: ``,
							enable: {
								start: 0
							},
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									input: config.studio.AtemSource.JingleFill,
									transition: partDefinition.transition
										? TransitionFromString(partDefinition.transition.style)
										: AtemTransitionStyle.CUT,
									transitionSettings: TransitionSettings(partDefinition)
								}
							}
						})
					])
				}
			})
		)
	} else {
		const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, partDefinition.rawType)
		if (sourceInfoCam === undefined) {
			return CreatePartInvalid(partDefinition)
		}
		const atemInput = sourceInfoCam.port

		const effekt = partDefinition.effekt

		if (effekt) {
			const effektConfig = config.showStyle.BreakerConfig.find(
				conf =>
					conf.BreakerName.toString()
						.trim()
						.toUpperCase() === effekt.toString().toUpperCase()
			)
			if (!effektConfig) {
				context.warning(`Could not find effekt ${effekt}`)
			} else {
				const file = effektConfig.ClipName.toString()

				if (!file) {
					context.warning(`Could not find file for ${effekt}`)
				} else {
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

					part = {
						...part,
						...{
							transitionDuration: TimeFromFrames(Number(effektConfig.Duration)) + config.studio.CasparPrerollDuration,
							transitionKeepaliveDuration:
								TimeFromFrames(Number(effektConfig.StartAlpha)) + config.studio.CasparPrerollDuration,
							transitionPrerollDuration:
								TimeFromFrames(Number(effektConfig.Duration)) -
								TimeFromFrames(Number(effektConfig.EndAlpha)) +
								config.studio.CasparPrerollDuration
						}
					}
				}
			}
		}

		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partDefinition.externalId,
				name: part.title,
				enable: { start: 0 },
				outputLayerId: 'pgm',
				sourceLayerId: SourceLayer.PgmCam,
				infiniteMode: PieceLifespan.OutOnNextPart,
				content: {
					studioLabel: '',
					switcherInput: atemInput,
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TimelineObjAtemME>({
							id: ``,
							enable: {
								start: 0
							},
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									input: Number(atemInput),
									transition: partDefinition.transition
										? TransitionFromString(partDefinition.transition.style)
										: AtemTransitionStyle.CUT,
									transitionSettings: TransitionSettings(partDefinition)
								}
							}
						}),

						...GetSisyfosTimelineObjForCamera(partDefinition.rawType)
					])
				}
			})
		)
	}

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)
	AddScript(partDefinition, pieces, partTime)

	if (partDefinition.cues.filter(cue => cue.type === CueType.DVE).length) {
		part.prerollDuration = config.studio.DVEPrerollDuration
	}

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
