import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeSisyfos,
	TimelineObjAtemME,
	TimelineObjSisyfosMessage
} from 'timeline-state-resolver-types'
import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { AtemLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { TransitionFromString } from '../helpers/transitionFromString'
import { TransitionSettings } from '../helpers/transitionSettings'
import { PartDefinitionEVS } from '../inewsConversion/converters/ParseBody'
import { CueType } from '../inewsConversion/converters/ParseCue'
import { SourceLayer } from '../layers'
import { PartTime } from './time/partTime'

export function CreatePartEVS(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinitionEVS,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(partDefinition, totalWords)

	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		typeVariant: ''
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const atemInput = config.studio.AtemSource.DelayedPlayback

	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: 'pgm',
			sourceLayerId: SourceLayer.PgmLive,
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
								input: atemInput,
								transition: partDefinition.transition
									? TransitionFromString(partDefinition.transition.style)
									: AtemTransitionStyle.CUT,
								transitionSettings: TransitionSettings(partDefinition)
							}
						}
					}),

					literal<TimelineObjSisyfosMessage>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: SisyfosLLAyer.SisyfosSourceEVS_1,
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
							isPgm: partDefinition.variant.isVO ? 2 : 1
						}
					})
				])
			}
		})
	)

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)
	AddScript(partDefinition, pieces, partTime)

	if (
		partDefinition.cues.filter(
			cue => cue.type === CueType.MOS || cue.type === CueType.Telefon || cue.type === CueType.TargetEngine
		).length
	) {
		part.prerollDuration = config.studio.PilotPrerollDuration
		part.transitionKeepaliveDuration = config.studio.PilotKeepaliveDuration
			? Number(config.studio.PilotKeepaliveDuration)
			: 60000
	} else if (partDefinition.cues.filter(cue => cue.type === CueType.DVE).length) {
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
