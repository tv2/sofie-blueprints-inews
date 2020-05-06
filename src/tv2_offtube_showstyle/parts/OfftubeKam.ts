import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineObjAtemME
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
import { literal, PartDefinitionKam, PartTime, TransitionFromString, TransitionSettings } from 'tv2-common'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeCreatePartKam(
	context: PartContext,
	config: OffTubeShowstyleBlueprintConfig,
	partDefinition: PartDefinitionKam,
	totalWords: number,
	reservedTime: number
): BlueprintResultPart {
	const partTime = PartTime(config, partDefinition, totalWords, reservedTime, false)

	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: partTime > 0 ? partTime : undefined
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
				sourceLayerId: OffTubeSourceLayer.PgmJingle,
				infiniteMode: PieceLifespan.OutOnNextPart,
				content: {
					studioLabel: '',
					switcherInput: config.studio.AtemSource.DSK1F,
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TimelineObjAtemME>({
							id: ``,
							enable: {
								start: 0
							},
							priority: 1,
							layer: OfftubeAtemLLayer.AtemMEProgram,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									input: config.studio.AtemSource.DSK1F,
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
	}

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, {})

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}

/*export function GetKeepStudioMicsMetaData(): PieceMetaData | undefined {
	return GetStickyForPiece([
		...STUDIO_MICS.map<{ layer: SisyfosLLAyer; isPgm: 0 | 1 | 2 }>(l => {
			return { layer: l, isPgm: 1 }
		})
	])
}*/
