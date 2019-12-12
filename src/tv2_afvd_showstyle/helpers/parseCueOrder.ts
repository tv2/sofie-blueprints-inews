import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { GetNextPartCue } from './nextPartCue'

export function ParseCueOrder(partDefinitions: PartDefinition[], segmentId: string): PartDefinition[] {
	const retDefintions: PartDefinition[] = []
	let partIdCounter = 0
	partDefinitions.forEach(partDefinition => {
		const first = GetNextPartCue(partDefinition, -1)

		// Unknown part type => It's not creating pieces of its own
		if (partDefinition.type !== PartType.Unknown) {
			// No extra parts
			if (first === -1) {
				retDefintions.push({ ...partDefinition, externalId: `${segmentId}-${partIdCounter}` })
				partIdCounter++
				return
			} else {
				retDefintions.push({
					...partDefinition,
					...(partDefinition.type === PartType.Slutord ? { script: '' } : {}),
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

		// This catches the case where iNews has:
		// SLUTORD...
		// ***LIVE***
		// <a PRIMARY>
		// script
		let isFirstNewPrimary = true
		const slutordScript = partDefinition.type === PartType.Slutord ? partDefinition.script : undefined

		while (partDefinition.cues.length) {
			if (GetNextPartCue(partDefinition, 0) !== -1) {
				retDefintions.push({
					type: PartType.Unknown,
					variant: {},
					externalId: `${segmentId}-${partIdCounter}`,
					rawType: '',
					cues: partDefinition.cues.splice(0, GetNextPartCue(partDefinition, 0)),
					script:
						isFirstNewPrimary && slutordScript
							? slutordScript
							: retDefintions.length === 0
							? partDefinition.script
							: '',
					fields: partDefinition.fields,
					modified: partDefinition.modified,
					storyName: partDefinition.storyName
				})
			} else {
				retDefintions.push({
					type: PartType.Unknown,
					variant: {},
					externalId: `${segmentId}-${partIdCounter}`,
					rawType: '',
					cues: partDefinition.cues,
					script:
						isFirstNewPrimary && slutordScript
							? slutordScript
							: retDefintions.length === 0
							? partDefinition.script
							: '',
					fields: partDefinition.fields,
					modified: partDefinition.modified,
					storyName: partDefinition.storyName
				})
				partDefinition.cues = []
			}
			isFirstNewPrimary = false
			partIdCounter++
		}
	})

	return retDefintions
}
