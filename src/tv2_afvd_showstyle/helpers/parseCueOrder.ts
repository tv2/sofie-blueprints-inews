import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { GetNextPartCue } from './nextPartCue'

// import * as md5 from 'md5'
import { assertUnreachable } from '../../common/util'
import { CueDefinitionJingle, CueType, DVESources } from '../inewsConversion/converters/ParseCue'

export function ParseCueOrder(partDefinitions: PartDefinition[], segmentId: string): PartDefinition[] {
	const retDefintions: PartDefinition[] = []
	const foundMap: { [key: string]: number } = {}
	partDefinitions.forEach(partDefinition => {
		const first = GetNextPartCue(partDefinition, -1)

		// Unknown part type => It's not creating pieces of its own
		if (partDefinition.type !== PartType.Unknown) {
			// No extra parts
			if (first === -1) {
				retDefintions.push({ ...partDefinition, externalId: getExternalId(segmentId, partDefinition, foundMap) })
				return
			} else {
				const part = {
					...partDefinition,
					...(partDefinition.type === PartType.Slutord ? { script: '' } : {}),
					cues: first > 0 ? partDefinition.cues.splice(0, first) : []
				}
				part.externalId = getExternalId(segmentId, part, foundMap)
				retDefintions.push(part)
			}
		} else if (GetNextPartCue(partDefinition, -1) === -1) {
			retDefintions.push({ ...partDefinition, externalId: getExternalId(segmentId, partDefinition, foundMap) })
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
				part.externalId = getExternalId(segmentId, part, foundMap)
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
				part.externalId = getExternalId(segmentId, part, foundMap)
				retDefintions.push(part)
				partDefinition.cues = []
			}
			isFirstNewPrimary = false
		}
	})

	return retDefintions
}

function getExternalId(segmentId: string, partDefinition: PartDefinition, foundMap: { [key: string]: number }): string {
	let id = `${segmentId}-${partDefinition.type.toString()}`

	switch (partDefinition.type) {
		case PartType.EVS:
			// Common pattern to see EV1 and EVS1VO in the same story. Changing from EVS1 to EVS1VO would mean a new part
			id += `-${partDefinition.variant.evs}-${partDefinition.variant.isVO}`
			break
		case PartType.INTRO:
			// Intro must have a jingle cue, if it doesn't then padId will handle
			const jingle = partDefinition.cues.find(cue => cue.type === CueType.Jingle) as CueDefinitionJingle
			if (jingle) {
				id += `-${jingle.clip}`
			}
			break
		case PartType.Kam:
			// No way of uniquely identifying, add some entropy from cues
			id += `-${partDefinition.rawType}-${partDefinition.variant.name}-${partDefinition.cues.length}`
			break
		case PartType.Server:
			// Only one video Id per story. Changing the video Id will result in a new part
			id += `-${partDefinition.fields.videoId}`
			break
		case PartType.Slutord:
			// Slutord parts are filtered out before reaching core, so don't matter as much
			id += `-${partDefinition.script}`
			break
		case PartType.Teknik:
			// Possibly an unused part type, not seen in production - only one example found in original test data
			id += `-TEKNIK`
			break
		case PartType.VO:
			// Only one video Id per story. Changing the video Id will result in a new part
			id += `-${partDefinition.fields.videoId}`
			break
		case PartType.Grafik:
		case PartType.DVE:
		case PartType.Ekstern:
		case PartType.Telefon:
		case PartType.Unknown:
			// Special cases based on cues
			const firstCue = partDefinition.cues[0]

			if (firstCue) {
				switch (firstCue.type) {
					case CueType.AdLib:
						id += `-${firstCue.variant}`
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
						id += `-${firstCue.template}-${countSources(firstCue.sources)}`
						break
					case CueType.Ekstern:
						// Identify based on live source. Changing live source will result in a new part
						id += `-${firstCue.source}`
						break
					case CueType.Jingle:
						// Changing the jingle clip will result in a new part
						id += `-${firstCue.clip}`
						break
					case CueType.TargetEngine:
						// Pair the engine will the graphic, common to see 'FULL' targeted multiple times in one story
						id += `-${firstCue.engine}-${JSON.stringify(firstCue.grafik?.vcpid)}`
						break
					case CueType.Telefon:
						id += `-${firstCue.source}`
						break
					case CueType.MOS:
						id += `-${firstCue.vcpid}`
						break
				}
			} else {
				// This should never happen. Log it in case it ever occurs.
				console.log(`Adding part with potentially bad Id: ${JSON.stringify(partDefinition)}`)
				id += `UNKNOWN`
			}
			break
		default:
			assertUnreachable(partDefinition)
	}

	id = padId(id.trim().replace(/ /g, '-'), foundMap)

	return id

	// return md5(`${id}`)
}

function padId(id: string, foundMap: { [key: string]: number }) {
	if (Object.keys(foundMap).includes(id)) {
		foundMap[id] += 1
		id = `${id}-${foundMap[id]}`
	} else {
		foundMap[id] = 1
	}
	foundMap = foundMap
	return id
}
