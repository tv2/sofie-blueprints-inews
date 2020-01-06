import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { GetNextPartCue } from './nextPartCue'

import * as md5 from 'md5'
import { assertUnreachable } from '../../common/util'
import { CueType, DVESources } from '../inewsConversion/converters/ParseCue'

export function ParseCueOrder(partDefinitions: PartDefinition[], segmentId: string): PartDefinition[] {
	const retDefintions: PartDefinition[] = []
	let partIdCounter = 0
	partDefinitions.forEach(partDefinition => {
		const first = GetNextPartCue(partDefinition, -1)

		// Unknown part type => It's not creating pieces of its own
		if (partDefinition.type !== PartType.Unknown) {
			// No extra parts
			if (first === -1) {
				retDefintions.push({ ...partDefinition, externalId: getExternalId(segmentId, partDefinition, partIdCounter) })
				partIdCounter++
				return
			} else {
				retDefintions.push({
					...partDefinition,
					...(partDefinition.type === PartType.Slutord ? { script: '' } : {}),
					cues: first > 0 ? partDefinition.cues.splice(0, first) : [],
					externalId: `${segmentId}-${partIdCounter}`
				})
				const part = {
					...partDefinition,
					...(partDefinition.type === PartType.Slutord ? { script: '' } : {}),
					cues: first > 0 ? partDefinition.cues.splice(0, first) : []
				}
				part.externalId = getExternalId(segmentId, part, partIdCounter)
				retDefintions.push(part)
				partIdCounter++
			}
		} else if (GetNextPartCue(partDefinition, -1) === -1) {
			retDefintions.push({ ...partDefinition, externalId: getExternalId(segmentId, partDefinition, partIdCounter) })
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
				const part: PartDefinition = {
					type: PartType.Unknown,
					variant: {},
					externalId: '',
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
				}
				part.externalId = getExternalId(segmentId, part, partIdCounter)
				retDefintions.push(part)
			} else {
				const part: PartDefinition = {
					type: PartType.Unknown,
					variant: {},
					externalId: ``,
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
				}
				part.externalId = getExternalId(segmentId, part, partIdCounter)
				retDefintions.push(part)
				partDefinition.cues = []
			}
			isFirstNewPrimary = false
			partIdCounter++
		}
	})

	return retDefintions
}

function getExternalId(segmentId: string, partDefinition: PartDefinition, partNum: number): string {
	let tail = `${partDefinition.type.toString()}-${partDefinition.rawType}`

	switch (partDefinition.type) {
		case PartType.EVS:
			// Common pattern to see EV1 and EVS1VO in the same story
			tail += `${partDefinition.variant.evs}-${partDefinition.variant.isVO}-${partNum}`
			break
		case PartType.Grafik:
			// Grafik parts can reasonably be identified by their cues
			tail += `${JSON.stringify(partDefinition.cues)}`
			break
		case PartType.INTRO:
			// Intro must have a jingle cue
			tail += `${JSON.stringify(partDefinition.cues.filter(cue => cue.type === CueType.Jingle))}`
			break
		case PartType.Kam:
			// Reasonable that there will be more than one camera of the same variant
			tail += `${JSON.stringify(partDefinition.variant.name)}-${partNum}`
			break
		case PartType.Server:
			// Only one video Id per story
			tail += `${partDefinition.fields.videoId}`
			break
		case PartType.Slutord:
			// Slutord parts are filtered out before reaching core, so don't matter as much
			tail += `${partDefinition.script}`
			break
		case PartType.Teknik:
			// Possibly an unused part type, not seen in production - only one example found in original test data
			tail += `TEKNIK`
			break
		case PartType.VO:
			// Only one video Id per story.
			tail += `${partDefinition.fields.videoId}`
			break
		case PartType.Unknown:
			// Special cases based on cues (primary cues)
			const firstCue = partDefinition.cues[0]

			if (firstCue) {
				switch (firstCue.type) {
					case CueType.AdLib:
						tail += `${firstCue.variant}`
						break
					case CueType.DVE:
						function countSources(sources: DVESources) {
							let count = 0
							for (const [key, value] of Object.entries(sources)) {
								if (key !== undefined && value !== undefined) {
									count += 1
								}
							}

							return count
						}
						tail += `${firstCue.template}-${countSources(firstCue.sources)}`
						break
					case CueType.Ekstern:
						// Reasonable that the same live source wil appear more than once in a story
						tail += `${firstCue.source}-${partNum}`
						break
					case CueType.Jingle:
						tail += `${firstCue.clip}`
						break
					case CueType.TargetEngine:
						// Pair the engine will the graphic, common to see 'FULL' targeted multiple times in one story
						tail += `${firstCue.engine}-${JSON.stringify(firstCue.grafik)}`
						break
					case CueType.Telefon:
						tail += `${firstCue.source}-${partNum}`
						break
				}
			} else {
				// This should never happen. Log it in case it ever occurs.
				console.log(`Adding part with potentially bad Id: ${JSON.stringify(partDefinition)}`)
				tail += `UNKNOWN`
			}
			break
		default:
			assertUnreachable(partDefinition)
	}

	return md5(`${segmentId}-${tail}`)
}
