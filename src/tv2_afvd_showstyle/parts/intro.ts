import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	CueDefinitionJingle,
	GetJinglePartProperties,
	literal,
	PartDefinition,
	PartTime
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'

export function CreatePartIntro(
	context: SegmentContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(config, partDefinition, totalWords, false)

	const jingleCue = partDefinition.cues.find(cue => {
		const parsedCue = cue
		return parsedCue.type === CueType.Jingle
	})

	if (!jingleCue) {
		context.warning(`Intro must contain a jingle`)
		return CreatePartInvalid(partDefinition)
	}

	const parsedJingle = jingleCue as CueDefinitionJingle

	if (!config.showStyle.BreakerConfig) {
		context.warning(`Jingles have not been configured`)
		return CreatePartInvalid(partDefinition)
	}

	const jingle = config.showStyle.BreakerConfig.find(jngl =>
		jngl.BreakerName ? jngl.BreakerName.toString().toUpperCase() === parsedJingle.clip.toString().toUpperCase() : false
	)
	if (!jingle) {
		context.warning(`Jingle ${parsedJingle.clip} is not configured`)
		return CreatePartInvalid(partDefinition)
	}

	const overlapFrames = jingle.EndAlpha

	if (overlapFrames === undefined) {
		context.warning(`Jingle ${parsedJingle.clip} does not have an out-duration set.`)
		return CreatePartInvalid(partDefinition)
	}

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {}
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []

	EvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {})
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)
	part = { ...part, ...GetJinglePartProperties(context, config, partDefinition) }

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}
