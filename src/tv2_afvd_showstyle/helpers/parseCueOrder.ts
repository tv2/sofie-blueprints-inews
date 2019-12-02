import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { GetNextPartCue } from './nextPartCue'

export function ParseCueOrder(partDefinitions: PartDefinition[], segmentId: string): PartDefinition[] {
	const retDefintions: PartDefinition[] = []
	let partIdCounter = 0
	partDefinitions.forEach(partDefinition => {
		const first = GetNextPartCue(partDefinition, -1)

		// Unknown part type => It's not creating pieces of its own
		if (partDefinition.type !== PartType.Unknown) {
			if (first === -1) {
				retDefintions.push({ ...partDefinition, externalId: `${segmentId}-${partIdCounter}` })
				partIdCounter++
				return
			} else {
				retDefintions.push({
					...partDefinition,
					cues: first > 0 ? partDefinition.cues.splice(0, first) : [],
					externalId: `${segmentId}-${partIdCounter}`
				})
				partIdCounter++
			}
		} else if (GetNextPartCue(partDefinition, -1) === -1) {
			retDefintions.push({ ...partDefinition, externalId: `${segmentId}-${partIdCounter}` })
			partIdCounter++
			return
		}

		while (partDefinition.cues.length) {
			if (GetNextPartCue(partDefinition, 0) !== -1) {
				retDefintions.push({
					type: PartType.Unknown,
					variant: {},
					externalId: `${segmentId}-${partIdCounter}`,
					rawType: '',
					cues: partDefinition.cues.splice(0, GetNextPartCue(partDefinition, 0)),
					script: retDefintions.length === 0 ? partDefinition.script : '',
					fields: partDefinition.fields,
					modified: partDefinition.modified
				})
			} else {
				retDefintions.push({
					type: PartType.Unknown,
					variant: {},
					externalId: `${segmentId}-${partIdCounter}`,
					rawType: '',
					cues: partDefinition.cues,
					script: retDefintions.length === 0 ? partDefinition.script : '',
					fields: partDefinition.fields,
					modified: partDefinition.modified
				})
				partDefinition.cues = []
			}
			partIdCounter++
		}
	})

	return retDefintions
}
