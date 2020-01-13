import {
	CueDefinition,
	CueDefinitionMOS,
	CueDefinitionTargetEngine,
	CueDefinitionTelefon,
	CueType,
	ParseCue,
	UnparsedCue
} from './ParseCue'

export enum PartType {
	Unknown,
	Kam,
	Server,
	VO,
	Teknik,
	Grafik,
	INTRO,
	Slutord,
	EVS,
	DVE,
	Ekstern,
	Telefon
}

export interface INewsStory {
	fields: { [key: string]: string }
	meta: { [key: string]: string }
	cues: Array<UnparsedCue | null>
	id: string
	body: string
}

export interface PartTransition {
	style: string
	duration?: number
}

export interface PartDefinitionBase {
	externalId: string
	type: PartType
	rawType: string
	variant: {}
	effekt?: number
	cues: CueDefinition[]
	script: string
	fields: { [key: string]: string }
	modified: number
	transition?: PartTransition
	storyName: string
}

export interface PartDefinitionUnknown extends PartDefinitionBase {
	type: PartType.Unknown
	variant: {}
}

export interface PartDefinitionKam extends PartDefinitionBase {
	type: PartType.Kam
	variant: {
		name: string
	}
}

export interface PartDefinitionServer extends PartDefinitionBase {
	type: PartType.Server
	variant: {}
}

export interface PartDefinitionTeknik extends PartDefinitionBase {
	type: PartType.Teknik
	variant: {}
}

export interface PartDefinitionGrafik extends PartDefinitionBase {
	type: PartType.Grafik
	variant: {}
}

export interface PartDefinitionVO extends PartDefinitionBase {
	type: PartType.VO
	variant: {}
}

export interface PartDefinitionIntro extends PartDefinitionBase {
	type: PartType.INTRO
	variant: {}
}

export interface PartDefinitionSlutord extends PartDefinitionBase {
	type: PartType.Slutord
	variant: {
		endWords: string
	}
}

export interface PartDefinitionEVS extends PartDefinitionBase {
	type: PartType.EVS
	variant: {
		evs: string
		isVO: boolean
	}
}

export interface PartDefinitionDVE extends PartDefinitionBase {
	type: PartType.DVE
}

export interface PartDefinitionEkstern extends PartDefinitionBase {
	type: PartType.Ekstern
}

export interface PartDefinitionTelefon extends PartDefinitionBase {
	type: PartType.Telefon
}

export type PartDefinition =
	| PartDefinitionUnknown
	| PartDefinitionKam
	| PartDefinitionServer
	| PartDefinitionTeknik
	| PartDefinitionGrafik
	| PartDefinitionVO
	| PartDefinitionIntro
	| PartDefinitionSlutord
	| PartDefinitionEVS
	| PartDefinitionDVE
	| PartDefinitionEkstern
	| PartDefinitionTelefon
export type PartdefinitionTypes =
	| Pick<PartDefinitionUnknown, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionKam, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionServer, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionTeknik, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionGrafik, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionVO, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionIntro, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionSlutord, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionEVS, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionDVE, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionEkstern, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionTelefon, 'type' | 'variant' | 'effekt' | 'transition'>

export function ParseBody(
	segmentId: string,
	segmentName: string,
	body: string,
	cues: UnparsedCue[],
	fields: any,
	modified: number
): PartDefinition[] {
	const definitions: PartDefinition[] = []
	let definition: PartDefinition = {
		externalId: '',
		type: PartType.Unknown,
		rawType: '',
		variant: {},
		cues: [],
		script: '',
		fields,
		modified,
		storyName: segmentName
	}

	if (segmentName === 'INTRO') {
		;((definition as unknown) as PartDefinitionIntro).type = PartType.INTRO
		cues.forEach(cue => {
			if (cue !== null) {
				definition.cues.push(ParseCue(cue))
			}
		})
		definition.rawType = 'INTRO'
		definition.externalId = `${segmentId}-${definitions.length}`
		definitions.push(definition)
		return definitions
	}

	let lines = body.split('\r\n')

	for (let i = 0; i < lines.length; i++) {
		lines[i] = lines[i].replace(/<cc>(.*?)<\/cc>/gi, '')
	}
	lines = lines.filter(line => line !== '<p></p>' && line !== '<p><pi></pi></p>')

	const ACCEPTED_RED_TEXT = /\b(KAM(?:\d+)?|CAM(?:\d+)?|KAMERA(?:\d+)?|CAMERA(?:\d+)?|SERVER|ATTACK|TEKNIK|GRAFIK|EVS\d+(?:VO)?|VO|VOSB|SLUTORD)+\b/gi

	lines.forEach(line => {
		const type = line.match(/<pi>(.*?)<\/pi>/i)

		if (type) {
			const typeStr = type[1]
				.replace(/<[a-z]+>/gi, '')
				.replace(/<\/[a-z]+>/gi, '')
				.replace(/[^\w\s]*\B[^\w\s]/gi, '')
				.replace(/[\s]+/i, ' ')
				.replace(/<tab>/i, '')
				.replace(/<\/tab>/i, '')
				.trim()

			if (typeStr && !!typeStr.match(ACCEPTED_RED_TEXT)) {
				const inlineCues = line
					.replace(/<\/?p>/g, '')
					.split(/<pi>(.*?)<\/pi>/i)
					.filter(cue => cue !== '' && !cue.match(/<\/a>/))

				let pos = 0
				let redTextFound = false
				while (pos < inlineCues.length && !redTextFound) {
					if (inlineCues[pos].match(ACCEPTED_RED_TEXT)) {
						redTextFound = true
					} else {
						const parsedCues = getCuesInLine(inlineCues[pos], cues)
						parsedCues.forEach(cue => {
							if (isPrimaryCue(cue)) {
								if (shouldPushDefinition(definition)) {
									definitions.push(definition)
								}
								definition = makeDefinitionPrimaryCue(
									segmentId,
									definitions.length,
									'',
									fields,
									modified,
									segmentName,
									cue
								)
							}
							definition.cues.push(cue)
							line = line.replace(inlineCues[pos], '')
						})
					}
					pos++
				}

				line = line.replace(/<\/a>/g, '').replace(/<pi>(.*?)<\/pi>/i, '')

				if (shouldPushDefinition(definition)) {
					definitions.push(definition)
				}

				definition = makeDefinition(segmentId, definitions.length, typeStr, fields, modified, segmentName)
			}
		}

		addScript(line, definition)

		if (cueInLine(line)) {
			const parsedCues = getCuesInLine(line, cues)

			parsedCues.forEach(cue => {
				if (isPrimaryCue(cue)) {
					if (shouldPushDefinition(definition)) {
						definitions.push(definition)
					}
					definition = makeDefinitionPrimaryCue(segmentId, definitions.length, '', fields, modified, segmentName, cue)
				}
				definition.cues.push(cue)
			})
		}

		/*if (type) {
			const typeStr = type[1]
				.replace(/<[a-z]+>/gi, '')
				.replace(/<\/[a-z]+>/gi, '')
				.replace(/[^\w\w\s]/gi, '')
				.r[\s]+/i, ' ')
				.replace(/<tab>/i, '')
				.replace(/<\/tab>/i, '')
				.trim()

			if (typeStr) {
				if (
					!typeStr.match(
						/\b(KAM(?:\d+)?|CAM(?:\d+)?|KAMERA(?:\d+)?|CAMERA(?:\d+)?|SERVER|ATTACK|TEKNIK|GRAFIK|EVS\d+(?:VO)?|VO|VOSB|SLUTORD)+\b/gi
					)
				) {
					if (!!line.match(/<p><pi>(.*)?<\/pi><\/p>/i)) {
						// Red text notes
					} else {
						if (
							definition.externalId !== '' ||
							definition.rawType !== '' ||
							JSON.stringify(definition.variant) !== JSON.stringify({}) ||
							definition.cues.toString() !== [].toString() ||
							definition.script !== ''
						) {
							definition.externalId = `${segmentId}-${definitions.length}`
							definitions.push(definition)
						}

						definition = makeDefinition(segmentId, definitions.length, typeStr, fields, modified, segmentName)
						// check for cues inline with the type definition
						addCue(definition, line, cues)
					}
					return
				}
				if (definition.rawType || definition.cues.length || definition.script) {
					if (!definition.externalId) {
						definition.externalId = `${segmentId}-${definitions.length}`
					}
					definitions.push(definition)
				}

				definition = makeDefinition(segmentId, definitions.length, typeStr, fields, modified, segmentName)

				// check for cues inline with the type definition
				addCue(definition, line, cues)

				return
			}
		}

		addCue(definition, line, cues)

		const script = line.match(/<p>(.*)?<\/p>/i)
		if (script && script[1]) {
			const trimscript = script[1]
				.replace(/<.*?>/gi, '')
				.replace('\n\r', '')
				.trim()
			if (trimscript) {
				definition.script += `${trimscript}\n`
			}
		}*/
	})
	/*if (!definition.externalId) {
		definition.externalId = `${segmentId}-${definitions.length}`
	}
	definitions.push(definition)

	definitions.forEach(partDefinition => {
		if (partDefinition.cues.length) {
			while (FindTargetPair(partDefinition)) {
				// NO-OP
			}
		}
	})

	return ParseCueOrder(definitions, segmentId)*/

	if (shouldPushDefinition(definition)) {
		definitions.push(definition)
	}

	return definitions
}

export function FindTargetPair(partDefinition: PartDefinition): boolean {
	const index = partDefinition.cues.findIndex(
		cue => (cue.type === CueType.TargetEngine && !cue.grafik) || (cue.type === CueType.Telefon && !cue.vizObj)
	)

	if (index === -1) {
		// No more targets
		return false
	}

	if (index + 1 < partDefinition.cues.length) {
		if (partDefinition.cues[index + 1].type === CueType.MOS) {
			const mosCue = partDefinition.cues[index + 1] as CueDefinitionMOS
			if (partDefinition.cues[index].type === CueType.TargetEngine) {
				const targetCue = partDefinition.cues[index] as CueDefinitionTargetEngine
				targetCue.grafik = mosCue
				partDefinition.cues[index] = targetCue
			} else {
				const targetCue = partDefinition.cues[index] as CueDefinitionTelefon
				targetCue.vizObj = mosCue
				partDefinition.cues[index] = targetCue
			}
			partDefinition.cues.splice(index + 1, 1)
			return true
		} else {
			// Target with no grafik
			return false
		}
	} else {
		return false
	}
}

function cueInLine(line: string) {
	return !!line.match(/<a idref=["|'](\d+)["|']>/gi)
}

function getCuesInLine(line: string, cues: UnparsedCue[]): CueDefinition[] {
	if (!cueInLine(line)) {
		return []
	}

	const definitions: CueDefinition[] = []

	const cue = line.match(/<a idref=["|'](\d+)["|']>/gi)
	cue?.forEach(c => {
		const value = c.match(/<a idref=["|'](\d+)["|']>/i)
		if (value) {
			const realCue = cues[Number(value[1])]
			if (realCue) {
				definitions.push(ParseCue(realCue))
			}
		}
	})

	return definitions
}

function addScript(line: string, definition: PartDefinition) {
	const script = line.match(/<p>(.*)?<\/p>/i)
	if (script && script[1]) {
		const trimscript = script[1]
			.replace(/<.*?>/gi, '')
			.replace('\n\r', '')
			.trim()
		if (trimscript) {
			definition.script += `${trimscript}\n`
		}
	}
}

function isPrimaryCue(cue: CueDefinition) {
	return cue.type === CueType.Telefon || cue.type === CueType.Ekstern || cue.type === CueType.DVE
}

function shouldPushDefinition(definition: PartDefinition) {
	return definition.cues.length || definition.script || definition.type !== PartType.Unknown
}

function makeDefinitionPrimaryCue(
	segmentId: string,
	i: number,
	typeStr: string,
	fields: any,
	modified: number,
	storyName: string,
	cue: CueDefinition
): PartDefinition {
	const definition = makeDefinition(segmentId, i, typeStr, fields, modified, storyName)

	switch (cue.type) {
		case CueType.Ekstern:
			definition.type = PartType.Ekstern
			break
		case CueType.DVE:
			definition.type = PartType.DVE
			break
		case CueType.Telefon:
			definition.type = PartType.Telefon
			break
		default:
			// For log purposes + to catch future issues.
			console.log(
				`Blueprint recieved non-primary cue when creating primary cue part. Likely a new primary cue type has been added recently.`
			)
			break
	}

	return definition
}

function makeDefinition(
	segmentId: string,
	i: number,
	typeStr: string,
	fields: any,
	modified: number,
	storyName: string
): PartDefinition {
	const part: PartDefinition = {
		externalId: `${segmentId}-${i}`, // TODO - this should be something that sticks when inserting a part before the current part
		...extractTypeProperties(typeStr),
		rawType: typeStr
			.replace(/effekt \d+/gi, '')
			.replace(/(MIX|DIP|WIPE|STING)( \d+)?(?:$| |\n)/gi, '')
			.replace(/\s+/gi, ' ')
			.trim(),
		cues: [],
		script: '',
		fields,
		modified,
		storyName
	}

	return part
}

function extractTypeProperties(typeStr: string): PartdefinitionTypes {
	const effektMatch = typeStr.match(/effekt (\d+)/i)
	const transitionMatch = typeStr.match(/(MIX|DIP|WIPE|STING)( \d+)?(?:$| |\n)/i)
	const definition: Pick<PartdefinitionTypes, 'effekt' | 'transition'> = {}
	if (effektMatch) {
		definition.effekt = Number(effektMatch[1])
	}
	if (transitionMatch) {
		definition.transition = {
			style: transitionMatch[1].toUpperCase(),
			duration: transitionMatch[2] ? Number(transitionMatch[2]) : undefined
		}
	}
	const tokens = typeStr
		.replace(/effekt (\d+)/gi, '')
		.replace(/(MIX|DIP|WIPE|STING)( \d+)?(?:$| |\n)/gi, '')
		.replace(/100%/g, '')
		.replace(/\s+/gi, ' ')
		.trim()
		.split(' ')
	const firstToken = tokens[0]

	if (firstToken.match(/KAM|CAM/i)) {
		const adjacentKamNumber = tokens[0].match(/KAM(\d+)/i)
		return {
			type: PartType.Kam,
			variant: {
				name: adjacentKamNumber ? adjacentKamNumber[1] : tokens[1]
			},
			...definition
		}
	} else if (firstToken.match(/SERVER/i) || firstToken.match(/ATTACK/i)) {
		return {
			type: PartType.Server,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/TEKNIK/i)) {
		return {
			type: PartType.Teknik,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/GRAFIK/i)) {
		return {
			type: PartType.Grafik,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/EVS\d+(?:VO)?/i)) {
		const strippedToken = firstToken.match(/EVS(\d+)(VO)?/i)
		return {
			type: PartType.EVS,
			variant: {
				evs: strippedToken && strippedToken[1] ? strippedToken[1] : '1',
				isVO: !!strippedToken && !!strippedToken[2]
			}
		}
	} else if (firstToken.match(/VO/i)) {
		return {
			type: PartType.VO,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/VOSB/i)) {
		return {
			type: PartType.VO,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/SLUTORD/i)) {
		return {
			type: PartType.Slutord,
			variant: {
				endWords: tokens.slice(1, tokens.length).join(' ')
			},
			...definition
		}
	} else {
		return {
			type: PartType.Unknown,
			variant: {},
			...definition
		}
	}
}
