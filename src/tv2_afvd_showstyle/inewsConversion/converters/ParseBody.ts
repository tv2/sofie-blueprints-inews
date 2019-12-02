import { ParseCueOrder } from '../../../tv2_afvd_showstyle/helpers/parseCueOrder'
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
	Slutord
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

export type PartDefinition =
	| PartDefinitionUnknown
	| PartDefinitionKam
	| PartDefinitionServer
	| PartDefinitionTeknik
	| PartDefinitionGrafik
	| PartDefinitionVO
	| PartDefinitionIntro
	| PartDefinitionSlutord
export type PartdefinitionTypes =
	| Pick<PartDefinitionUnknown, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionKam, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionServer, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionTeknik, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionGrafik, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionVO, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionIntro, 'type' | 'variant' | 'effekt' | 'transition'>
	| Pick<PartDefinitionSlutord, 'type' | 'variant' | 'effekt' | 'transition'>

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
		modified
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
		lines[i] = lines[i].replace(/<cc>(.*?)<\/cc>/g, '')
	}
	lines = lines.filter(line => line !== '<p></p>' && line !== '<p><pi></pi></p>')

	lines.forEach(line => {
		const type = line.match(/<pi>(.*?)<\/pi>/)

		if (type) {
			const typeStr = type[1]
				.replace(/<[a-z]+>/g, '')
				.replace(/<\/[a-z]+>/g, '')
				.replace(/[^\w\s]*\B[^\w\s]/g, '')
				.replace(/[\s]+/, ' ')
				.replace(/<tab>/, '')
				.replace(/<\/tab>/, '')
				.trim()

			if (typeStr) {
				if (!typeStr.match(/\b(KAM|CAM|KAMERA|CAMERA|SERVER|ATTACK|TEKNIK|GRAFIK|VO|VOSB|SLUTORD)+\b/gi)) {
					if (!!line.match(/<p><pi>(.*)?<\/pi><\/p>/)) {
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

						definition = makeDefinition(segmentId, definitions.length, typeStr, fields, modified)
					}
					return
				}
				if (definition.rawType || definition.cues.length || definition.script) {
					if (!definition.externalId) {
						definition.externalId = `${segmentId}-${definitions.length}`
					}
					definitions.push(definition)
				}

				definition = makeDefinition(segmentId, definitions.length, typeStr, fields, modified)

				// check for cues inline with the type definition
				addCue(definition, line, cues)

				return
			}
		}

		addCue(definition, line, cues)

		const script = line.match(/<p>(.*)?<\/p>/)
		if (script) {
			const trimscript = script[1]
				.replace(/<.*?>/g, '')
				.replace('\n\r', '')
				.trim()
			if (trimscript) {
				definition.script += `${trimscript}\n`
			}
		}
	})
	if (!definition.externalId) {
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

	if (definitions[0] && definitions[1]) {
		// Merge orphaned script / cues with first part.
		if (definitions[0].type === PartType.Unknown && definitions[1].type !== PartType.Unknown) {
			if (definitions[0].script.length) {
				definitions[1].script = definitions[0].script.concat(definitions[1].script)
			}

			if (definitions[0].cues.length) {
				definitions[1].cues = definitions[0].cues.concat(definitions[1].cues)
			}

			definitions.splice(0, 1)
			definitions.forEach((part, i) => {
				part.externalId = `${segmentId}-${i}`
			})
		}
	}

	return ParseCueOrder(definitions, segmentId)
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

function addCue(definition: PartDefinition, line: string, cues: UnparsedCue[]) {
	const cue = line.match(/<a idref=["|'](\d+)["|']>/g)
	if (cue) {
		cue.forEach(c => {
			const value = c.match(/<a idref=["|'](\d+)["|']>/)
			if (value) {
				const realCue = cues[Number(value[1])]
				if (realCue) {
					definition.cues.push(ParseCue(realCue))
				}
			}
		})
	}
}

function makeDefinition(segmentId: string, i: number, typeStr: string, fields: any, modified: number): PartDefinition {
	const part: PartDefinition = {
		externalId: `${segmentId}-${i}`, // TODO - this should be something that sticks when inserting a part before the current part
		...extractTypeProperties(typeStr),
		rawType: typeStr
			.replace(/effekt \d+/gi, '')
			.replace(/(MIX|DIP|WIPE|STING)( \d+)?(?:$| |\n)/gi, '')
			.replace(/\s+/g, ' ')
			.trim(),
		cues: [],
		script: '',
		fields,
		modified
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
		.replace(/\s+/g, ' ')
		.trim()
		.split(' ')
	const firstToken = tokens[0]

	if (firstToken.match(/KAM|CAM/)) {
		return {
			type: PartType.Kam,
			variant: {
				name: tokens[1]
			},
			...definition
		}
	} else if (firstToken.match(/SERVER/) || firstToken.match(/ATTACK/i)) {
		return {
			type: PartType.Server,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/TEKNIK/)) {
		return {
			type: PartType.Teknik,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/GRAFIK/)) {
		return {
			type: PartType.Grafik,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/VO/)) {
		return {
			type: PartType.VO,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/VOSB/)) {
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
