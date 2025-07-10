import {
	createCueDefinitionGraphicDesign,
	createCueDefinitionGraphicSchema,
	CueDefinitionFromField,
	INewsFields,
	parseTransitionStyle,
	PostProcessDefinitions,
	TableConfigItemSourceMappingWithSisyfos,
	TransitionStyle,
	TV2ShowStyleConfig,
	UnparsedCue
} from 'tv2-common'
import { CueType, PartType, SourceType } from 'tv2-constants'
import { CueDefinition, ParseCue, UnpairedPilotToGraphic } from './ParseCue'

export interface PartTransition {
	style: TransitionStyle
	duration?: number
}

export interface SourceDefinitionBase {
	sourceType: SourceType
	name?: string
}
export interface SourceDefinitionWithRaw {
	raw: string
}

export interface SourceDefinitionKam extends SourceDefinitionWithRaw {
	sourceType: SourceType.KAM
	/** name that appears in the Camera Mappings table (e.g. "1", "CS 3") */
	id: string
	/** full name for display/logging purposes e.g. "KAM 1" */
	name: string
	minusMic: boolean
}

export interface SourceDefinitionReplay extends SourceDefinitionWithRaw {
	sourceType: SourceType.REPLAY
	/** id that appears in the Replay Mappings table (e.g. "EVS 1", "EPSIO") */
	id: string
	/** full name for display/logging purposes e.g. "EVS 1 VO" */
	name: string
	vo: boolean
}

export enum RemoteType {
	LIVE = 'LIVE',
	FEED = 'FEED'
}
export interface SourceDefinitionRemote extends SourceDefinitionWithRaw {
	sourceType: SourceType.REMOTE
	remoteType: RemoteType
	/** name that appears in the Remote Mappings table (e.g. "1", "2") */
	id: string
	/** full name for display/logging purposes e.g. "LIVE 1" */
	name: string
}
export interface SourceDefinitionInvalid extends SourceDefinitionWithRaw {
	sourceType: SourceType.INVALID
	/** full name for display/logging purposes */
	name: string
}

export interface SourceDefinitionServer extends SourceDefinitionBase {
	sourceType: SourceType.SERVER
}

export interface SourceDefinitionGrafik extends SourceDefinitionWithRaw {
	sourceType: SourceType.GRAFIK
	name: string
}

export interface SourceDefinitionDefault extends SourceDefinitionBase {
	sourceType: SourceType.DEFAULT
}

export interface SourceDefinitionPGM extends SourceDefinitionBase {
	sourceType: SourceType.PGM
}

export interface SourceDefinitionVOSS extends SourceDefinitionBase {
	sourceType: SourceType.VOSS
	name: string,
	cameraId: string
	auxiliaryId: string
}


export type SourceDefinition =
	| SourceDefinitionKam
	| SourceDefinitionReplay
	| SourceDefinitionRemote
	| SourceDefinitionServer
	| SourceDefinitionGrafik
	| SourceDefinitionDefault
	| SourceDefinitionPGM
	| SourceDefinitionInvalid
	| SourceDefinitionVOSS

export interface PartDefinitionBase {
	externalId: string
	type: PartType
	rawType: string
	effekt?: number
	cues: CueDefinition[]
	script: string
	fields: { videoId?: string } & { [key: string]: string }
	modified: number
	transition?: PartTransition
	storyName: string
	segmentExternalId: string
	/**
	 * The rank of the Segment this PartDefinition belongs to
	 */
	segmentRank: number
	endWords?: string
	/** Title set based on the primary cue for the following PartTypes: Grafik, DVE, Ekstern, Telefon, Unknown */
	title?: string
}

export interface PartDefinitionUnknown extends PartDefinitionBase {
	type: PartType.Unknown
}
export interface PartDefinitionKam extends PartDefinitionBase {
	type: PartType.Kam
	/** Definition of the primary source */
	sourceDefinition: SourceDefinitionKam
}
export interface PartDefinitionServer extends PartDefinitionBase {
	type: PartType.Server
}

export interface PartDefinitionTeknik extends PartDefinitionBase {
	type: PartType.Teknik
}

export interface PartDefinitionGrafik extends PartDefinitionBase {
	type: PartType.Grafik
}

export interface PartDefinitionVO extends PartDefinitionBase {
	type: PartType.VO
}

export interface PartDefinitionVOSS extends PartDefinitionBase {
	type: PartType.VOSS
	sourceDefinition: SourceDefinitionVOSS
}

export interface PartDefinitionVO extends PartDefinitionBase {
	type: PartType.VO
}

export interface PartDefinitionIntro extends PartDefinitionBase {
	type: PartType.INTRO
}
export interface PartDefinitionEVS extends PartDefinitionBase {
	type: PartType.EVS
	/** Definition of the primary source */
	sourceDefinition: SourceDefinitionReplay
}

export interface PartDefinitionDVE extends PartDefinitionBase {
	type: PartType.DVE
}

export interface PartDefinitionEkstern extends PartDefinitionBase {
	type: PartType.REMOTE
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
	| PartDefinitionVOSS
	| PartDefinitionIntro
	| PartDefinitionEVS
	| PartDefinitionDVE
	| PartDefinitionEkstern
	| PartDefinitionTelefon
export type PartdefinitionTypes =
	| Pick<PartDefinitionUnknown, 'type' | 'effekt' | 'transition'>
	| Pick<PartDefinitionKam, 'type' | 'sourceDefinition' | 'effekt' | 'transition'>
	| Pick<PartDefinitionServer, 'type' | 'effekt' | 'transition'>
	| Pick<PartDefinitionTeknik, 'type' | 'effekt' | 'transition'>
	| Pick<PartDefinitionGrafik, 'type' | 'effekt' | 'transition'>
	| Pick<PartDefinitionVO, 'type' | 'effekt' | 'transition'>
	| Pick<PartDefinitionVOSS, 'type' |'sourceDefinition' | 'effekt' | 'transition'>
	| Pick<PartDefinitionIntro, 'type' | 'effekt' | 'transition'>
	| Pick<PartDefinitionEVS, 'type' | 'sourceDefinition' | 'effekt' | 'transition'>
	| Pick<PartDefinitionDVE, 'type' | 'effekt' | 'transition'>
	| Pick<PartDefinitionEkstern, 'type' | 'effekt' | 'transition'>
	| Pick<PartDefinitionTelefon, 'type' | 'effekt' | 'transition'>

const CAMERA_RED_TEXT = /\b[KC]AM(?:ERA)? ?(\S+)\b/i
const EVS_RED_TEXT = /\bEVS ?(\d+) ?(VOV?)?\b/i
const VOSS_RED_TEXT = /\bVO(\d+)SS(\d+)\b/i
const ACCEPTED_RED_TEXT = [/\b(SERVER|ATTACK|TEKNIK|GRAFIK|EPSIO|VOV?|VOSB)+\b/i, CAMERA_RED_TEXT, EVS_RED_TEXT, VOSS_RED_TEXT]
const ENGINE_CUE = /ENGINE ?([^\s]+)/i

const MAX_ALLOWED_TRANSITION_FRAMES = 250

export function ParseBody(
	config: TV2ShowStyleConfig,
	segmentId: string,
	segmentName: string,
	segmentRank: number,
	body: string,
	cues: UnparsedCue[],
	fields: INewsFields,
	modified: number
): PartDefinition[] {
	let definitions: PartDefinition[] = []
	let definition: PartDefinition = initDefinition(fields, modified, segmentName, segmentRank)

	// Handle intro segments, they have special behaviour.
	if (segmentName === 'INTRO') {
		definition = {
			...definition,
			type: PartType.INTRO,
			rawType: 'INTRO',
			externalId: `${segmentId}-${definitions.length}`,
			segmentExternalId: segmentId
		}
		cues.forEach((cue) => {
			if (cue !== null) {
				const parsedCue = ParseCue(cue, config)

				if (parsedCue !== undefined && parsedCue.type !== CueType.UNKNOWN) {
					definition.cues.push(parsedCue)
				}
			}
		})
		definitions.push(definition)
		definition = initDefinition(fields, modified, segmentName, segmentRank)
		return definitions
	}

	let lines = body.split('\r\n')

	for (let i = 0; i < lines.length; i++) {
		lines[i] = lines[i].replace(/<cc>(.*?)<\/cc>/gi, '')
	}
	lines = lines.filter((line) => line !== '<p></p>' && line !== '<p><pi></pi></p>')

	lines.forEach((line) => {
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

			if (typeStr && /SLUTORD/i.test(typeStr)) {
				if (definition.endWords) {
					definition.endWords += ` ${typeStr.replace(/^SLUTORD:? ?/i, '')}`
				} else {
					definition.endWords = typeStr.replace(/^SLUTORD:? ?/i, '')
				}
				// We should just add script for end words
				addScript(line, definition)
				return
			}

			if (typeStr && ACCEPTED_RED_TEXT.some((r) => r.test(typeStr))) {
				const inlineCues = line
					.replace(/<\/?p>/g, '')
					.split(/<pi>(.*?)<\/pi>/i)
					.filter((cue) => cue !== '' && !/<\/a>/.test(cue))

				/** Hold any secondary cues in the form: `[] KAM 1` */
				const secondaryInlineCues: CueDefinition[] = []

				// Find all inline primaries appearing before the red text
				let pos = 0
				let redTextFound = false
				while (pos < inlineCues.length && !redTextFound) {
					if (ACCEPTED_RED_TEXT.some((r) => r.test(inlineCues[pos]))) {
						redTextFound = true
					} else {
						const parsedCues = getCuesInLine(inlineCues[pos], cues, config)
						parsedCues.forEach((cue) => {
							// Create standalone parts for primary cues.
							if (
								isPrimaryCue(cue) &&
								!(cue.type === CueType.UNPAIRED_TARGET && cue.target === 'FULL' && /GRAFIK/i.test(typeStr))
							) {
								if (shouldPushDefinition(definition)) {
									definitions.push(definition)
									definition = initDefinition(fields, modified, segmentName, segmentRank)
								}
								definition = makeDefinitionPrimaryCue(
									segmentId,
									definitions.length,
									'',
									fields,
									modified,
									segmentName,
									definition.type,
									cue,
									segmentRank,
									config
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

				const lastCue = definition.cues[definition.cues.length - 1]
				
				// if (VOSS_RED_TEXT.test(typeStr)) {
				// 	// const strippedToken = typeStr.match(VOSS_RED_TEXT)
				// 	definition = makeDefinition(
				// 		segmentId,
				// 		definitions.length,
				// 		typeStr,
				// 		fields,
				// 		modified,
				// 		segmentName,
				// 		segmentRank,
				// 		config,
				// 	)

				// }
				if (/GRAFIK/i.test(typeStr) && lastCue && lastCue.type === CueType.UNPAIRED_TARGET && !definition.script) {
					definition = makeDefinition(
						segmentId,
						definitions.length,
						typeStr,
						fields,
						modified,
						segmentName,
						segmentRank,
						config
					)

					definition.cues.push(lastCue)
				} else {
					if (shouldPushDefinition(definition)) {
						definitions.push(definition)
						definition = initDefinition(fields, modified, segmentName, segmentRank)
					}

					definition = makeDefinition(
						segmentId,
						definitions.length,
						typeStr,
						fields,
						modified,
						segmentName,
						segmentRank,
						config
					)
				}

				definition.cues.push(...secondaryInlineCues)
			}
		}

		addScript(line, definition)

		// Add any remaining cues in the line.
		if (cueInLine(line)) {
			const parsedCues = getCuesInLine(line, cues, config)

			parsedCues.forEach((cue) => {
				if (isPrimaryCue(cue)) {
					let storedScript = ''
					if (shouldPushDefinition(definition)) {
						definitions.push(definition)
						definition = initDefinition(fields, modified, segmentName, segmentRank)
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
						cue,
						segmentRank,
						config
					)

					definition.script = storedScript
				}
				definition.cues.push(cue)
			})
		}
	})

	if (shouldPushDefinition(definition)) {
		definitions.push(definition)
		definition = initDefinition(fields, modified, segmentName, segmentRank)
	}

	// Flatten cues such as targetEngine.
	definitions.forEach((partDefinition) => {
		if (partDefinition.cues.length) {
			while (FindTargetPair(partDefinition)) {
				// NO-OP
			}
		}

		// Discard UNKNOWN cues, we won't do anything with them
		partDefinition.cues = partDefinition.cues.filter((c) => c.type !== CueType.UNKNOWN)
	})

	definitions[0]?.cues.push(...parseFieldsToCueDefinitions(fields, config))
	definitions = stripRedundantCuesWhenFieldCueIsPresent(definitions)

	return PostProcessDefinitions(definitions, segmentId)
}

function parseFieldsToCueDefinitions(fields: INewsFields, config: TV2ShowStyleConfig): CueDefinition[] {
	const cueDefinitions: CueDefinition[] = []
	if (fields.layout) {
		const cueDefinitionGraphicDesign = createCueDefinitionGraphicDesign(fields.layout, config)
		if (cueDefinitionGraphicDesign) {
			cueDefinitions.push(cueDefinitionGraphicDesign)
		}
	}

	if (fields.skema) {
		const cueDefinitionGraphicSchema = createCueDefinitionGraphicSchema(fields.skema, config)
		if (cueDefinitionGraphicSchema) {
			cueDefinitions.push(cueDefinitionGraphicSchema)
		}
	}
	return cueDefinitions
}

export function FindTargetPair(partDefinition: PartDefinition): boolean {
	const index = partDefinition.cues.findIndex(
		(cue) => (cue.type === CueType.UNPAIRED_TARGET && cue.mergeable) || (cue.type === CueType.Telefon && !cue.graphic)
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
		const mosCue = nextCue
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
function initDefinition(
	fields: any,
	modified: number,
	segmentName: string,
	segmentRank: number
): PartDefinitionUnknown {
	return {
		externalId: '',
		type: PartType.Unknown,
		rawType: '',
		cues: [],
		script: '',
		fields,
		modified,
		storyName: segmentName,
		segmentExternalId: '',
		segmentRank
	}
}

/** Returns true if there is a cue in the given line. */
function cueInLine(line: string) {
	return /<a idref=["|'](\d+)["|']>/i.test(line)
}

/** Returns all the cues in a given line as parsed cues. */
function getCuesInLine(line: string, cues: UnparsedCue[], config: TV2ShowStyleConfig): CueDefinition[] {
	if (!cueInLine(line)) {
		return []
	}

	const definitions: CueDefinition[] = []

	const cue = line.match(/<a idref=["|'](\d+)["|']>/gi)
	cue?.forEach((c) => {
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
	const script = line.match(/<p>(.*?)<\/p>/i)
	if (script && script[1] && !/<pi>.*?<\/pi>/i.test(script[1])) {
		const trimscript = script[1].replace(/<.*?>/gi, '').replace('\n\r', '').trim()
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
		(definition.cues.filter((c) => c.type !== CueType.UNKNOWN).length ||
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
	cue: CueDefinition,
	segmentRank: number,
	config: TV2ShowStyleConfig
): PartDefinition {
	let definition = makeDefinition(segmentId, i, typeStr, fields, modified, storyName, segmentRank, config)

	switch (cue.type) {
		case CueType.Ekstern:
			definition = { ...definition, ...cue.transition }
			definition.type = PartType.REMOTE
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
	storyName: string,
	segmentRank: number,
	config: TV2ShowStyleConfig
): PartDefinition {
	const part: PartDefinition = {
		externalId: `${segmentId}-${i}`, // TODO - this should be something that sticks when inserting a part before the current part
		...extractTypeProperties(typeStr, config),
		rawType: stripTransitionProperties(typeStr),
		cues: [],
		script: '',
		fields,
		modified,
		storyName,
		segmentExternalId: '',
		segmentRank,
	}

	return part
}

export function stripTransitionProperties(typeStr: string) {
	return typeStr
		.replace(/effekt \d+/gi, '')
		.replace(/(MIX|DIP|WIPE|STING)( \d+)?(?:$| |\n)/gi, '')
		.replace(/\s+/gi, ' ')
		.trim()
}

export function getTransitionProperties(typeStr: string): Pick<PartdefinitionTypes, 'effekt' | 'transition'> {
	const definition: Pick<PartdefinitionTypes, 'effekt' | 'transition'> = {}
	const effektMatch = typeStr.match(/effekt (\d+)/i)
	const transitionMatch = typeStr.match(/(MIX|DIP|WIPE|STING)( \d+)?(?:$| |\n)/i)

	if (effektMatch) {
		definition.effekt = Number(effektMatch[1])
	}

	if (transitionMatch) {
		definition.transition = {
			style: parseTransitionStyle(transitionMatch[1].toUpperCase()),
			duration: transitionMatch[2] ? getTimeForTransition(transitionMatch[2]) : undefined
		}
	}

	return definition
}

function getTimeForTransition(timeString: string): number {
	const time = Number(timeString)
	return Math.min(time, MAX_ALLOWED_TRANSITION_FRAMES)
}

function extractTypeProperties(typeStr: string, config: TV2ShowStyleConfig): PartdefinitionTypes {
	const transitionAndEffekt: Pick<PartdefinitionTypes, 'effekt' | 'transition'> = getTransitionProperties(typeStr)

	const sourceDefinition = getSourceDefinition(typeStr, config)
	switch (sourceDefinition?.sourceType) {
		case SourceType.KAM:
			return {
				type: PartType.Kam,
				sourceDefinition,
				...transitionAndEffekt
			}
		case SourceType.REPLAY:
			return {
				type: PartType.EVS,
				sourceDefinition,
				...transitionAndEffekt
			}
		case SourceType.VOSS:
			return {
				type: PartType.VOSS,
				sourceDefinition,
				...transitionAndEffekt
			}
		default:
			break
	}

	const tokens = stripTransitionProperties(typeStr).replace(/100%/g, '').trim().split(' ')
	const firstToken = tokens[0]

	if (/SERVER|ATTACK/i.test(firstToken)) {
		return {
			type: PartType.Server,
			...transitionAndEffekt
		}
	} else if (/TEKNIK/i.test(firstToken)) {
		return {
			type: PartType.Teknik,
			...transitionAndEffekt
		}
	} else if (/GRAFIK/i.test(firstToken)) {
		return {
			type: PartType.Grafik,
			...transitionAndEffekt
		}
	} else if (/VOV?|VOSB/i.test(firstToken)) {
		return {
			type: PartType.VO,
			...transitionAndEffekt
		}
	} else {
		return {
			type: PartType.Unknown,
			...transitionAndEffekt
		}
	}
}

export function getSourceDefinition(typeStr: string, config: TV2ShowStyleConfig): SourceDefinition | undefined {
	const strippedTypeStr = stripTransitionProperties(typeStr).replace(/100%/g, '').trim()
	if (CAMERA_RED_TEXT.test(strippedTypeStr)) {
		const id = strippedTypeStr.match(CAMERA_RED_TEXT)![1].toUpperCase()
		return {
			sourceType: SourceType.KAM,
			id,
			minusMic: isMinusMic(typeStr),
			raw: strippedTypeStr,
			name: `KAM ${id}`
		}
	} else if (isFeedOrLiveSource(typeStr, config)) {
		return {
			sourceType: SourceType.REMOTE,
			remoteType: RemoteType.LIVE,
			id: typeStr, // The 'id' field needs to match the 'Name' field of the SourceMappingConfiguration.
			raw: typeStr,
			name: typeStr
		}
	} else if (/EPSIO/i.test(typeStr)) {
		return {
			sourceType: SourceType.REPLAY,
			id: 'EPSIO 1/2',
			vo: true,
			raw: typeStr,
			name: 'EPSIO'
		}
	} else if (ENGINE_CUE.test(typeStr)) {
		const strippedToken = typeStr.match(ENGINE_CUE)
		return {
			sourceType: SourceType.GRAFIK,
			name: strippedToken![1].toUpperCase(),
			raw: typeStr
		}
	} else if (/DEFAULT/i.test(typeStr)) {
		return {
			sourceType: SourceType.DEFAULT
		}
	} else if (/SERVER/i.test(typeStr)) {
		return {
			sourceType: SourceType.SERVER
		}
	} else if (/PGM/i.test(typeStr)) {
		return {
			sourceType: SourceType.PGM
		}
	}
	else if (VOSS_RED_TEXT.test(typeStr)) {
		const strippedToken = typeStr.match(VOSS_RED_TEXT) 
		return {
			cameraId: strippedToken![1],
			auxiliaryId: strippedToken![2],
			name: 'VOSS',
			sourceType: SourceType.VOSS
		}
	}
	return undefined
}

function isFeedOrLiveSource(typeStr: string, config: TV2ShowStyleConfig): boolean {
	const liveAndFeedConfigs: TableConfigItemSourceMappingWithSisyfos[] = config.studio.SourcesFeed.concat(
		config.studio.SourcesRM
	)
	return liveAndFeedConfigs.some(
		(sourceConfig) => sourceConfig.SourceName.toLowerCase().replace(' ', '') === typeStr.toLowerCase().replace(' ', '')
	)
}

export function isMinusMic(inputName: string): boolean {
	return /minus mic/i.test(inputName)
}

export function stripRedundantCuesWhenFieldCueIsPresent(partDefinitions: PartDefinition[]): PartDefinition[] {
	return stripRedundantCuesForSchema(stripRedundantCuesForDesign(partDefinitions))
}

function stripRedundantCuesForDesign(partDefinitions: PartDefinition[]): PartDefinition[] {
	return stripRedundantCues(partDefinitions, [CueType.GraphicDesign])
}

function stripRedundantCuesForSchema(partDefinitions: PartDefinition[]): PartDefinition[] {
	return stripRedundantCues(partDefinitions, [CueType.GraphicSchema])
}

function stripRedundantCues(partDefinitions: PartDefinition[], cueTypesToCheck: CueType[]): PartDefinition[] {
	const hasFieldCue: boolean = partDefinitions.some((definition) =>
		definition.cues.some((cue) => {
			const cueFromField = cue as CueDefinitionFromField
			return cueTypesToCheck.includes(cue.type) && cueFromField.isFromField
		})
	)

	if (!hasFieldCue) {
		return partDefinitions
	}

	return partDefinitions.map((definition) => {
		const cues = definition.cues.filter((cue) => {
			if (!cueTypesToCheck.includes(cue.type)) {
				return true
			}
			return (cue as CueDefinitionFromField).isFromField
		})
		return {
			...definition,
			cues
		}
	})
}
