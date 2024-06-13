import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece
} from 'blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	CueDefinitionJingle,
	GetJinglePartProperties,
	Part,
	PartDefinition,
	PartTime,
	ShowStyleContext
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { GalleryBlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'

export async function CreatePartIntro(
	context: ShowStyleContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinition,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partTime = PartTime(context.config, partDefinition, totalWords, false)

	const jingleCue = partDefinition.cues.find((cue) => {
		return cue.type === CueType.Jingle
	})

	if (!jingleCue) {
		context.core.notifyUserWarning(`Intro must contain a jingle`)
		return CreatePartInvalid(partDefinition, { reason: 'Intro parts must contain a jingle.' })
	}

	const parsedJingle = jingleCue as CueDefinitionJingle

	const jingle = context.config.showStyle.BreakerConfig.find((jngl) =>
		jngl.BreakerName ? jngl.BreakerName.toString().toUpperCase() === parsedJingle.clip.toString().toUpperCase() : false
	)
	if (!jingle) {
		context.core.notifyUserWarning(`Jingle ${parsedJingle.clip} is not configured.`)
		return CreatePartInvalid(partDefinition, {
			reason: `No configuration found for the jingle '${parsedJingle.clip}'.`
		})
	}

	const overlapFrames = jingle.EndAlpha

	if (overlapFrames === undefined) {
		context.core.notifyUserWarning(`Jingle ${parsedJingle.clip} does not have an out-duration set.`)
		return CreatePartInvalid(partDefinition, { reason: `No out-duration set for the jingle '${parsedJingle.clip}'.` })
	}

	let part: Part = {
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {}
	}

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	part = {
		...part,
		...GetJinglePartProperties(context, partDefinition)
	}

	await EvaluateCues(
		context,
		part,
		pieces,
		adLibPieces,
		actions,
		mediaSubscriptions,
		partDefinition.cues,
		partDefinition,
		{}
	)
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)
	part = {
		...part,
		hackListenToMediaObjectUpdates: mediaSubscriptions
	}

	if (pieces.length === 0) {
		part.invalid = true
		part.invalidity = { reason: 'The part has no pieces.' }
	}

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}
