import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { CueType } from '../inewsConversion/converters/ParseCue'

export function GetNextPartCue(partdefinition: PartDefinition, currentCue: number): number {
	const index = partdefinition.cues
		.slice(currentCue + 1)
		.findIndex(
			cue =>
				cue.type === CueType.DVE ||
				cue.type === CueType.Ekstern ||
				(cue.type === CueType.TargetEngine && cue.engine.match(/full/i) && partdefinition.type !== PartType.Grafik) ||
				cue.type === CueType.Telefon
		)
	if (index === -1) {
		return -1
	}

	return index + currentCue + 1
}

export function SliceOutCue() {
	// TODO: Remove cues from n to m
}
