import { assertUnreachable, CueDefinitionJingle, DVESources, PartDefinition } from 'tv2-common'
import { CueType, PartType } from 'tv2-constants'

export function PostProcessDefinitions(partDefinitions: PartDefinition[], segmentExternalId: string): PartDefinition[] {
	const foundMap: { [key: string]: number } = {}

	partDefinitions.forEach((part, i) => {
		setPartTitle(part)
		part.cues = part.cues.map(c => {
			if (c.type === CueType.Ekstern) {
				c.transition = undefined
			}

			return c
		})
		partDefinitions[i] = { ...part, externalId: getExternalId(segmentExternalId, part, foundMap), segmentExternalId }
	})

	return partDefinitions
}

function setPartTitle(partDefinition: PartDefinition) {
	const firstCue = partDefinition.cues[0]
	if (
		firstCue &&
		[PartType.Grafik, PartType.DVE, PartType.Ekstern, PartType.Telefon, PartType.Unknown].includes(partDefinition.type)
	) {
		switch (firstCue.type) {
			case CueType.Ekstern:
				partDefinition.title = firstCue.rawSource
				break
			case CueType.DVE:
				partDefinition.title = firstCue.template
				break
			case CueType.Graphic:
				if (firstCue.target === 'FULL') {
					partDefinition.title = firstCue.graphic.type === 'pilot' ? firstCue.graphic.name : firstCue.graphic.template
				}
				break
			case CueType.Jingle:
				partDefinition.title = firstCue.clip
				break
			default:
				break
		}
	}
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
		case PartType.VO:
		case PartType.Server:
			// Changing the videoId would result in a new part if videoId is used as part of the ex ternalId
			// There _should_ only be one server per story so this is safe, however,
			// if more than one server is present then we'll fall back to the indexing method.
			break
		case PartType.Teknik:
			// Possibly an unused part type, not seen in production - only one example found in original test data
			id += `-TEKNIK`
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
					case CueType.Graphic:
						// Pair the engine will the graphic, common to see 'FULL' targeted multiple times in one story
						const end =
							firstCue.graphic.type === 'internal'
								? firstCue.graphic.template
								: firstCue.graphic.type === 'pilot'
								? firstCue.graphic.vcpid
								: ''
						id += `-${firstCue.target}-${end}`
						break
					case CueType.Telefon:
						id += `-${firstCue.source}`
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
