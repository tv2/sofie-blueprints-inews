import { TV2BlueprintConfig } from 'tv2-common'
import { CueType, PartType } from 'tv2-constants'
import { PostProcessDefinitions } from '../../../tv2_afvd_showstyle/helpers/postProcessDefinitions'
import { CueDefinition, CueDefinitionUnpairedPilot, ParseCue, UnpairedPilotToGraphic, UnparsedCue } from './ParseCue'

interface INewsFields {
	title: string
	modifyDate: string // number
	pageNumber?: string
	tapeTime: string // number
	audioTime: string // number
	totalTime: string // number
	cumeTime: string // number
	backTime: string // number
}

interface INewsMetaData {
	wire?: 'f' | 'b' | 'u' | 'r' | 'o'
	mail?: 'read' | 'unread'
	locked?: 'pass' | 'user'
	words?: string // number
	rate?: string // number
	break?: string
	mcserror?: string
	hold?: string
	float?: 'float' | undefined
	delete?: string
}

export interface INewsStory {
	/** Same identifier as the file the story came from */
	identifier: string
	locator: string
	fields: INewsFields
	meta: INewsMetaData
	cues: Array<UnparsedCue | null>
	body?: string
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
	fields: { videoId?: string } & { [key: string]: string }
	modified: number
	transition?: PartTransition
	storyName: string
	segmentExternalId: string
	endWords?: string
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
	| Pick<PartDefinitionEVS, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionDVE, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionEkstern, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionTelefon, 'type' | 'variant' | 'effekt' | 'transition'>

const ACCEPTED_RED_TEXT = /\b(KAM(?:\d+)?|CAM(?:\d+)?|KAMERA(?:\d+)?|CAMERA(?:\d+)?|SERVER|ATTACK|TEKNIK|GRAFIK|EVS ?\d+(?:VOV?)?|VOV?|VOSB)+\b/gi

export function ParseBody(
	config: TV2BlueprintConfig,
	segmentId: string,
	segmentName: string,
	body: string,
	cues: UnparsedCue[],
	fields: any,
	modified: number
): PartDefinition[] {
	const definitions: PartDefinition[] = []
	let definition: PartDefinition = initDefinition(fields, modified, segmentName)

	// Handle intro segments, they have special behaviour.
	if (segmentName === 'INTRO') {
		;((definition as unknown) as PartDefinitionIntro).type = PartType.INTRO
		cues.forEach(cue => {
			if (cue !== null) {
				const parsedCue = ParseCue(cue, config)

				if (parsedCue !== undefined && parsedCue.type !== CueType.UNKNOWN) {
					definition.cues.push(parsedCue)
				}
			}
		})
		definition.rawType = 'INTRO'
		definition.externalId = `${segmentId}-${definitions.length}`
		definition.segmentExternalId = segmentId
		definitions.push(definition)
		definition = initDefinition(fields, modified, segmentName)
		return definitions
	}

	let lines = body.split('\r\n')

	for (let i = 0; i < lines.length; i++) {
		lines[i] = lines[i].replace(/<cc>(.*?)<\/cc>/gi, '')
	}
	lines = lines.filter(line => line !== '<p></p>' && line !== '<p><pi></pi></p>')

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

				/** Hold any secondary cues in the form: `[] KAM 1` */
				const secondaryInlineCues: CueDefinition[] = []

				// Find all inline primaries appearing before the red text
				let pos = 0
				let redTextFound = false
				while (pos < inlineCues.length && !redTextFound) {
					if (inlineCues[pos].match(ACCEPTED_RED_TEXT)) {
						redTextFound = true
					} else {
						const parsedCues = getCuesInLine(inlineCues[pos], cues, config)
						parsedCues.forEach(cue => {
							// Create standalone parts for primary cues.
							if (
								isPrimaryCue(cue) &&
								!(cue.type === CueType.UNPAIRED_TARGET && cue.target === 'FULL' && !!typeStr.match(/GRAFIK/i))
							) {
								if (shouldPushDefinition(definition)) {
									definitions.push(definition)
									definition = initDefinition(fields, modified, segmentName)
								}
								definition = makeDefinitionPrimaryCue(
									segmentId,
									definitions.length,
									'',
									fields,
									modified,
									segmentName,
									definition.type,
									cue
								)
								definition.cues.push(cue)
							} else {
								secondaryInlineCues.push(cue)
							}

							line = line.replace(inlineCues[pos], '')
						})
					}
					pos++
				}

				line = line.replace(/<\/a>/g, '')

				if (shouldPushDefinition(definition)) {
					definitions.push(definition)
					definition = initDefinition(fields, modified, segmentName)
				}

				definition = makeDefinition(segmentId, definitions.length, typeStr, fields, modified, segmentName)

				definition.cues.push(...secondaryInlineCues)
			}

			if (typeStr && typeStr.match(/SLUTORD/i)) {
				if (definition.endWords) {
					definition.endWords += ` ${typeStr.replace(/^SLUTORD:? ?/i, '')}`
				} else {
					definition.endWords = typeStr.replace(/^SLUTORD:? ?/i, '')
				}
			}
		}

		addScript(line, definition)

		// Add any remaining cues in the line.
		if (cueInLine(line)) {
			const parsedCues = getCuesInLine(line, cues, config)

			parsedCues.forEach(cue => {
				if (isPrimaryCue(cue)) {
					let storedScript = ''
					if (shouldPushDefinition(definition)) {
						definitions.push(definition)
						definition = initDefinition(fields, modified, segmentName)
					} else if (definition.script.length) {
						storedScript = definition.script
					}

					definition = makeDefinitionPrimaryCue(
						segmentId,
						definitions.length,
						definition.rawType,
						fields,
						modified,
						segmentName,
						definition.type,
						cue
					)

					definition.script = storedScript
				}
				definition.cues.push(cue)
			})
		}
	})

	if (shouldPushDefinition(definition)) {
		definitions.push(definition)
		definition = initDefinition(fields, modified, segmentName)
	}

	// Flatten cues such as targetEngine.
	definitions.forEach(partDefinition => {
		if (partDefinition.cues.length) {
			while (FindTargetPair(partDefinition)) {
				// NO-OP
			}
		}

		// Discard UNKNOWN cues, we won't do anything with them
		partDefinition.cues = partDefinition.cues.filter(c => c.type !== CueType.UNKNOWN)
	})

	return PostProcessDefinitions(definitions, segmentId)
}

export function FindTargetPair(partDefinition: PartDefinition): boolean {
	const index = partDefinition.cues.findIndex(
		cue => (cue.type === CueType.UNPAIRED_TARGET && cue.mergeable) || (cue.type === CueType.Telefon && !cue.graphic)
	)

	if (index === -1) {
		// No more targets
		return false
	}

	const targetCue = partDefinition.cues[index]

	if (!targetCue) {
		return false
	}

	if (index + 1 >= partDefinition.cues.length) {
		return false
	}

	const nextCue = partDefinition.cues[index + 1]

	if (!nextCue) {
		return false
	}

	if (nextCue.type === CueType.UNPAIRED_PILOT) {
		const mosCue = nextCue as CueDefinitionUnpairedPilot
		if (targetCue.type === CueType.UNPAIRED_TARGET) {
			partDefinition.cues[index] = UnpairedPilotToGraphic(mosCue, targetCue.target, targetCue)
		} else if (targetCue.type === CueType.Telefon) {
			targetCue.graphic = UnpairedPilotToGraphic(mosCue, 'TLF', targetCue)
			partDefinition.cues[index] = targetCue
		}
		partDefinition.cues.splice(index + 1, 1)
		return true
	} else {
		// Target with no grafik
		return false
	}
}

/** Creates an initial part definition. */
function initDefinition(fields: any, modified: number, segmentName: string): PartDefinitionUnknown {
	return {
		externalId: '',
		type: PartType.Unknown,
		rawType: '',
		variant: {},
		cues: [],
		script: '',
		fields,
		modified,
		storyName: segmentName,
		segmentExternalId: ''
	}
}

/** Returns true if there is a cue in the given line. */
function cueInLine(line: string) {
	return !!line.match(/<a idref=["|'](\d+)["|']>/gi)
}

/** Returns all the cues in a given line as parsed cues. */
function getCuesInLine(line: string, cues: UnparsedCue[], config: TV2BlueprintConfig): CueDefinition[] {
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
				const parsedCue = ParseCue(realCue, config)

				if (parsedCue !== undefined) {
					definitions.push(parsedCue)
				}
			}
		}
	})

	return definitions
}

function addScript(line: string, definition: PartDefinition) {
	const script = line.match(/<p>(.*)?<\/p>/i)
	if (script && script[1] && !script[1].match(/<pi>(.*?)<\/pi>/i)) {
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
	return (
		cue.type === CueType.Telefon ||
		cue.type === CueType.Ekstern ||
		cue.type === CueType.DVE ||
		((cue.type === CueType.Graphic || cue.type === CueType.UNPAIRED_TARGET) && cue.target === 'FULL')
	)
}

function shouldPushDefinition(definition: PartDefinition) {
	return (
		(definition.cues.filter(c => c.type !== CueType.UNKNOWN).length ||
			(definition.script.length && definition.cues.length) ||
			definition.type !== PartType.Unknown) &&
		!(definition.type === PartType.Grafik && definition.cues.length === 0)
	)
}

function makeDefinitionPrimaryCue(
	segmentId: string,
	i: number,
	typeStr: string,
	fields: any,
	modified: number,
	storyName: string,
	partType: PartType,
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
		case CueType.Graphic:
			definition.type = partType
			break
		case CueType.UNPAIRED_TARGET:
			definition.type = partType
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
		storyName,
		segmentExternalId: ''
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
	} else if (typeStr.match(/EVS ?\d+(?:VOV?)?/i)) {
		const strippedToken = typeStr.match(/EVS ?(\d+)(VOV?)?/i)
		return {
			type: PartType.EVS,
			variant: {
				evs: strippedToken && strippedToken[1] ? strippedToken[1] : '1',
				isVO: !!strippedToken && !!strippedToken[2]
			},
			...definition
		}
	} else if (firstToken.match(/VOV?/i)) {
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
	} else {
		return {
			type: PartType.Unknown,
			variant: {},
			...definition
		}
	}
}
