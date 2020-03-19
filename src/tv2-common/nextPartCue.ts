import { PartDefinition } from 'tv2-common'
import { CueType, PartType } from 'tv2-constants'

/**
 * Finds the index of the next primary cue.
 * @param partdefinition Part.
 * @param currentCue Index of current cue.
 */
export function GetNextPartCue(partdefinition: PartDefinition, currentCue: number): number {
	const index = partdefinition.cues
		.slice(currentCue + 1)
		.findIndex(
			cue =>
				cue.type === CueType.DVE ||
				cue.type === CueType.Ekstern ||
				(cue.type === CueType.TargetEngine &&
					cue.data.engine.match(/full/i) &&
					partdefinition.type !== PartType.Grafik) ||
				cue.type === CueType.Telefon
		)
	if (index === -1) {
		return -1
	}

	return index + currentCue + 1
}
