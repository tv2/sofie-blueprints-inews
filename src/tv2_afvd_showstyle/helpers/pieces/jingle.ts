import {
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import {
	CreateJingleContentBase,
	CueDefinitionJingle,
	GetJinglePartProperties,
	literal,
	PartDefinition
} from 'tv2-common'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
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
				content: createJingleContent(config, file, jingle.LoadFirstFrame),
				toBeQueued: true,
				adlibAutoNext: props.autoNext,
				adlibAutoNextOverlap: props.autoNextOverlap,
				adlibPreroll: props.prerollDuration,
				expectedDuration: props.expectedDuration,
				adlibDisableOutTransition: false
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
				content: createJingleContent(config, file, jingle.LoadFirstFrame)
			})
		)
	}
}

function createJingleContent(config: BlueprintConfig, file: string, loadFirstFrame: boolean) {
	const content = CreateJingleContentBase(
		config,
		file,
		loadFirstFrame,
		{
			Caspar: {
				PlayerJingle: CasparLLayer.CasparPlayerJingle,
				PlayerJingleLookahead: CasparLLayer.CasparPlayerJingle
			},
			ATEM: {
				DSKJingle: AtemLLayer.AtemDSKEffect,
				USKCleanEffekt: AtemLLayer.AtemCleanUSKEffect
			},
			Sisyfos: {
				PlayerJingle: SisyfosLLAyer.SisyfosSourceJingle
			},
			basePath: config.studio.JingleSourcePath
		},
		false
	)

	return content
}
