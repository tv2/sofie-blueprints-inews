import { BlueprintResultPart, IBlueprintPart, NotesContext } from 'tv-automation-sofie-blueprints-integration'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { PartDefinition } from '../inewsConversion'
import { literal } from '../util'
import { CreatePartInvalid } from './invalid'

export function CreatePartServerBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: NotesContext,
	config: ShowStyleConfig,
	partDefinition: PartDefinition
): { part: BlueprintResultPart; file: string; duration: number; invalid?: true } {
	if (partDefinition.fields === undefined) {
		context.warning('Video ID not set!')
		return { part: CreatePartInvalid(partDefinition), file: '', duration: 0, invalid: true }
	}

	if (!partDefinition.fields.videoId) {
		context.warning('Video ID not set!')
		return { part: CreatePartInvalid(partDefinition), file: '', duration: 0, invalid: true }
	}

	const file = partDefinition.fields.videoId
	const duration = Number(partDefinition.fields.tapeTime) * 1000 || 0

	const basePart = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		expectedDuration: duration || 1000,
		prerollDuration: config.studio.CasparPrerollDuration
	})

	return {
		part: {
			part: basePart,
			adLibPieces: [],
			pieces: []
		},
		file,
		duration
	}
}
