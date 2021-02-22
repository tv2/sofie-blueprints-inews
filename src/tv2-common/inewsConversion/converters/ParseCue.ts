import { literal, TV2BlueprintConfig } from 'tv2-common'
import { CueType, GraphicEngine, PartType } from 'tv2-constants'
import { PartDefinition } from './ParseBody'

export type UnparsedCue = string[] | null

export interface CueTime {
	frames?: number
	seconds?: number
	infiniteMode?: 'B' | 'S' | 'O'
}

export interface CueDefinitionBase {
	type: CueType
	start?: CueTime
	end?: CueTime
	adlib?: boolean
	iNewsCommand: string
}

export interface CueDefinitionUnknown extends CueDefinitionBase {
	type: CueType.UNKNOWN
}

export interface CueDefinitionEkstern extends CueDefinitionBase {
	type: CueType.Ekstern
	source: string
}

export interface DVESources {
	INP1?: string
	INP2?: string
	INP3?: string
	INP4?: string
}

export interface CueDefinitionDVE extends CueDefinitionBase {
	type: CueType.DVE
	template: string
	sources: DVESources
	labels: string[]
}

export interface CueDefinitionTelefon extends CueDefinitionBase {
	type: CueType.Telefon
	source: string
	graphic?: CueDefinitionGraphic<GraphicInternalOrPilot>
}

export interface CueDefinitionMic extends CueDefinitionBase {
	type: CueType.Mic
	mics: {
		[key: string]: boolean
	}
}

export interface CueDefinitionAdLib extends CueDefinitionBase {
	type: CueType.AdLib
	variant: string
	inputs: DVESources
	bynavn?: string
}

export interface CueDefinitionLYD extends CueDefinitionBase {
	type: CueType.LYD
	variant: string
}

export interface CueDefinitionJingle extends CueDefinitionBase {
	type: CueType.Jingle
	clip: string
}

export interface CueDefinitionProfile extends CueDefinitionBase {
	type: CueType.Profile
	profile: string
}

export interface CueDefinitionClearGrafiks extends CueDefinitionBase {
	type: CueType.ClearGrafiks
}

// If unpaired when evaluated, throw warning. If target === 'FULL' create invalid part.
export interface CueDefinitionUnpairedTarget extends CueDefinitionBase {
	type: CueType.UNPAIRED_TARGET
	target: GraphicEngine
	routing?: CueDefinitionRouting
	mergeable?: boolean
}

export interface CueDefinitionUnpairedPilot extends CueDefinitionBase {
	type: CueType.UNPAIRED_PILOT
	name: string
	vcpid: number
	continueCount: number
	engineNumber?: number
}

export interface CueDefinitionBackgroundLoop extends CueDefinitionBase {
	type: CueType.BackgroundLoop
	target: 'FULL' | 'DVE'
	backgroundLoop: string
}

export interface CueDefinitionGraphicDesign extends CueDefinitionBase {
	type: CueType.GraphicDesign
	design: string
}

export interface GraphicInternal {
	type: 'internal'
	template: string
	cue: string
	textFields: string[]
}

export interface GraphicPilot {
	type: 'pilot'
	name: string
	vcpid: number
	continueCount: number
}

export type GraphicInternalOrPilot = GraphicInternal | GraphicPilot

export interface CueDefinitionGraphic<T extends GraphicInternalOrPilot> extends CueDefinitionBase {
	type: CueType.Graphic
	target: GraphicEngine
	routing?: CueDefinitionRouting
	graphic: T
	engineNumber?: number // #cg4 -> 4
}

export interface CueDefinitionRouting extends CueDefinitionBase {
	type: CueType.Routing
	target: GraphicEngine
	INP?: string
	INP1?: string
}

export type CueDefinition =
	| CueDefinitionUnknown
	| CueDefinitionEkstern
	| CueDefinitionDVE
	| CueDefinitionTelefon
	| CueDefinitionMic
	| CueDefinitionAdLib
	| CueDefinitionLYD
	| CueDefinitionJingle
	| CueDefinitionProfile
	| CueDefinitionClearGrafiks
	| CueDefinitionUnpairedTarget
	| CueDefinitionUnpairedPilot
	| CueDefinitionBackgroundLoop
	| CueDefinitionGraphicDesign
	| CueDefinitionGraphic<GraphicInternalOrPilot>
	| CueDefinitionRouting

export function GraphicIsInternal(
	o: CueDefinitionGraphic<GraphicInternalOrPilot>
): o is CueDefinitionGraphic<GraphicInternal> {
	return o.graphic.type === 'internal'
}

export function GraphicIsPilot(
	o: CueDefinitionGraphic<GraphicInternalOrPilot>
): o is CueDefinitionGraphic<GraphicPilot> {
	return o.graphic.type === 'pilot'
}

export function ParseCue(cue: UnparsedCue, config: TV2BlueprintConfig): CueDefinition | undefined {
	if (!cue) {
		return undefined
	}

	cue = cue.filter(c => c !== '')
	// Replace multiple spaces / tabs with a single space
	cue = cue.map(c => c?.trim().replace(/\s+/g, ' '))

	if (cue.length === 0) {
		return undefined
	}

	if (cue[0].match(/^[#* ]?kg[= ]ovl-all-out$/i) || cue[0].match(/^[#* ]?kg[= ]altud$/i)) {
		// All out
		return parseAllOut(cue)
	} else if (cue[0].match(/(?:^[*|#]?kg[ |=])|(?:^digi)/i)) {
		// kg (Grafik)
		return parsekg(cue, config)
	} else if (cue[0].match(/^]] [a-z]\d\.\d [a-z] \d \[\[$/i)) {
		// MOS
		return parsePilot(cue)
	} else if (cue[0].match(/[#|*]?cg\d+[ -]pilotdata/i)) {
		return parsePilot(cue)
	} else if (cue[0].match(/^EKSTERN=/i)) {
		// EKSTERN
		const eksternSource = cue[0].match(/^EKSTERN=(.+)$/i)
		if (eksternSource) {
			return {
				type: CueType.Ekstern,
				source: eksternSource[1],
				iNewsCommand: 'EKSTERN'
			}
		}
	} else if (cue[0].match(/^DVE=/i)) {
		// DVE
		return parseDVE(cue)
	} else if (cue[0].match(/^TELEFON=/i)) {
		// Telefon
		return parseTelefon(cue, config)
	} else if (cue[0].match(/^(?:SS|GRAFIK)=(?:.*)(?:$| )/i)) {
		// Target engine
		return parseTargetEngine(cue, config)
	} else if (cue[0].match(/^(?:SS|GRAFIK|VIZ)=(?:full|ovl|wall)(?:$| )/i)) {
		return parseTargetEngine(cue, config)
	} else if (cue[0].match(/^VIZ=/i)) {
		return parseVIZCues(cue)
	} else if (cue[0].match(/^STUDIE=MIC ON OFF$/i)) {
		return parseMic(cue)
	} else if (cue[0].match(/^ADLIBPI?X=/i)) {
		return parseAdLib(cue)
	} else if (cue[0].match(/^KOMMANDO=/i)) {
		return parseKommando(cue)
	} else if (cue[0].match(/^LYD=/i)) {
		return parseLYD(cue)
	} else if (cue[0].match(/^JINGLE\d+=/i)) {
		return parseJingle(cue)
	}

	return literal<CueDefinitionUnknown>({
		type: CueType.UNKNOWN,
		iNewsCommand: ''
	})
}

function parsekg(
	cue: string[],
	config: TV2BlueprintConfig
): CueDefinitionGraphic<GraphicInternalOrPilot> | CueDefinitionGraphicDesign | CueDefinitionUnpairedTarget {
	let kgCue: CueDefinitionGraphic<GraphicInternalOrPilot> = {
		type: CueType.Graphic,
		target: 'OVL',
		graphic: {
			type: 'internal',
			template: '',
			textFields: [],
			cue: ''
		},
		iNewsCommand: ''
	}

	const graphic: GraphicInternal = {
		type: 'internal',
		template: '',
		textFields: [],
		cue: ''
	}

	const command = cue[0].match(/^([*|#]?kg|digi)/i)
	kgCue.iNewsCommand = command ? command[1] : 'kg'

	const code = cue[0]
		.match(/^[*|#]?kg[ | =]/i)
		?.toString()
		?.trim()

	const firstLineValues = cue[0].match(/^[*|#]?kg[ |=]([\w|\d]+)( (.+))*$/i)
	if (firstLineValues) {
		graphic.cue = code || ''
		graphic.template = firstLineValues[1]
		if (firstLineValues[3]) {
			graphic.textFields.push(firstLineValues[3])
		}
	} else if (cue[0].match(/^DIGI=/i)) {
		graphic.cue = 'DIGI'
		const templateType = cue[0].match(/^DIGI=(.+)$/i)
		if (templateType) {
			graphic.template = templateType[1]
		}
	}

	let textFields = cue.length - 1
	if (isTime(cue[cue.length - 1])) {
		kgCue = { ...kgCue, ...parseTime(cue[cue.length - 1]) }
	} else if (!cue[cue.length - 1].match(/;[x|\d+].[x|\d+]x/i)) {
		textFields += 1
	} else {
		kgCue.adlib = true
		const end = parseTime(cue[cue.length - 1]).end
		if (end) {
			kgCue = { ...kgCue, end }
		}
	}

	for (let i = 1; i < textFields; i++) {
		graphic.textFields.push(cue[i])
	}

	if (!kgCue.start) {
		kgCue.adlib = true
	}

	kgCue.graphic = graphic

	const graphicConfig = code
		? config.showStyle.GFXTemplates.find(
				tmpl =>
					tmpl.INewsCode.replace(/^KG=?/gi, '#KG').toUpperCase() === code.replace(/^KG=?/gi, '#KG').toUpperCase() &&
					tmpl.INewsName.toUpperCase() === graphic.template.toUpperCase()
		  )
		: undefined

	if (graphicConfig && graphicConfig.IsDesign) {
		return literal<CueDefinitionGraphicDesign>({
			type: CueType.GraphicDesign,
			design: graphicConfig.VizTemplate,
			iNewsCommand: kgCue.iNewsCommand,
			start: kgCue.start,
			end: kgCue.end,
			adlib: kgCue.adlib
		})
	} else if (graphicConfig && !!graphicConfig.VizTemplate.match(/^VCP$/i)) {
		return literal<CueDefinitionUnpairedTarget>({
			type: CueType.UNPAIRED_TARGET,
			target: graphicConfig.VizDestination.match(/OVL/i)
				? 'OVL'
				: graphicConfig.VizDestination.match(/FULL/i)
				? 'FULL'
				: graphicConfig.VizDestination.match(/WALL/i)
				? 'WALL'
				: 'OVL',
			iNewsCommand: graphicConfig.INewsCode,
			mergeable: true
		})
	}

	return kgCue
}

const MOS_TIMING = /\/MOSART=[L|F|W]\|(M|\d{1,2}(?:\:\d{1,2}){0,2})\|([SBO]|\d{1,2}(?:\:\d{1,2}){0,2})$/i

function parsePilot(cue: string[]): CueDefinitionUnpairedPilot | CueDefinitionGraphic<GraphicInternalOrPilot> {
	const pilotCue: CueDefinitionUnpairedPilot = {
		type: CueType.UNPAIRED_PILOT,
		name: '',
		vcpid: -1,
		continueCount: -1,
		iNewsCommand: 'VCP'
	}
	const realCue: string[] = []
	cue.forEach(line => {
		if (
			!line.match(/[#|*]?cg\d+[ -]pilotdata/i) &&
			!line.match(/^]] [a-z]\d\.\d [a-z] \d \[\[$/i) &&
			!line.match(/cg\d+ \]\] .+? \[\[ pilotdata/i)
		) {
			realCue.push(line)
		} else if (!!line.match(/[#|*]?cg\d+[ -]pilotdata/i)) {
			const engine = line.match(/[#|*]?cg(\d+)[ -]pilotdata/i)
			if (engine && engine[1]) {
				pilotCue.engineNumber = Number(engine[1])
			}
		}
	})
	if (realCue.length === 4) {
		const vcpid = realCue[1].match(/^VCPID=(\d+)$/i)
		const continueCount = realCue[2].match(/^ContinueCount=(-?\d+)$/i)
		const timing = realCue[0].match(MOS_TIMING)

		if (vcpid && continueCount) {
			pilotCue.name = realCue[0].replace(MOS_TIMING, '')
			pilotCue.vcpid = Number(vcpid[1])
			pilotCue.continueCount = Number(continueCount[1])

			if (timing) {
				if (timing[1] === 'M') {
					pilotCue.adlib = true
				} else if (isMosTime(timing[1])) {
					pilotCue.start = parseTime(timing[1]).start
				}

				if (timing[2].match(/[SBO]/i)) {
					pilotCue.end = {
						infiniteMode: timing[2] as keyof { B: any; S: any; O: any }
					}
				} else if (isMosTime(timing[2])) {
					pilotCue.end = parseTime(timing[2]).start
				}
			} else {
				pilotCue.start = { seconds: 0 }
			}
		}
	}

	const targeting = realCue[0].match(/MOSART=(L|F|W)/i)
	if (targeting && targeting[1]) {
		const target = targeting[1].toUpperCase()
		return UnpairedPilotToGraphic(pilotCue, target === 'L' ? 'OVL' : target === 'W' ? 'WALL' : 'FULL')
	}

	return pilotCue
}

function parseDVE(cue: string[]): CueDefinitionDVE {
	let dvecue: CueDefinitionDVE = {
		type: CueType.DVE,
		template: '',
		sources: {},
		labels: [],
		iNewsCommand: 'DVE'
	}

	cue.forEach(c => {
		if (c.match(/^DVE=/i)) {
			const template = c.match(/^DVE=(.+)$/i)
			if (template) {
				dvecue.template = template[1]
			}
		} else if (c.match(/^INP\d+=/i)) {
			const input = c.match(/^(INP\d)+=(.+)$/i)
			if (input && input[1] && input[2]) {
				dvecue.sources[input[1].toUpperCase() as keyof DVESources] = input[2]
			}
		} else if (c.match(/^BYNAVN=/i)) {
			const labels = c.match(/^BYNAVN=(.+)$/i)
			if (labels) {
				dvecue.labels = labels[1].split(/\/|\\/i)
			}
		} else if (isTime(c)) {
			dvecue = { ...dvecue, ...parseTime(c) }
		}
	})

	return dvecue
}

function parseTelefon(cue: string[], config: TV2BlueprintConfig): CueDefinitionTelefon {
	const telefonCue: CueDefinitionTelefon = {
		type: CueType.Telefon,
		source: '',
		iNewsCommand: 'TELEFON'
	}
	const source = cue[0].match(/^TELEFON=(.+)$/i)
	if (source) {
		telefonCue.source = source[1]
	}

	if (cue.length > 1) {
		// tslint:disable-next-line:prefer-conditional-expression
		if (cue[1].match(/(?:^[*|#]?kg[ |=])|(?:^digi)/i)) {
			const graphic = parsekg(cue.slice(1, cue.length), config)
			if (graphic.type === CueType.Graphic) {
				telefonCue.graphic = graphic
			}
		} else {
			const pilot = parsePilot(cue.slice(1, cue.length))
			if (pilot.type === CueType.Graphic) {
				pilot.target = 'TLF'
				telefonCue.graphic = pilot
			} else {
				telefonCue.graphic = UnpairedPilotToGraphic(pilot, 'TLF')
			}
		}
	}

	return telefonCue
}

function parseVIZCues(cue: string[]): CueDefinitionBackgroundLoop | undefined {
	if (cue[0].match(/grafik-design/i)) {
		// Not currently supported
		return undefined
	}

	let backgroundLoopCue: CueDefinitionBackgroundLoop = {
		type: CueType.BackgroundLoop,
		target: cue[0].match(/dve/) ? 'DVE' : 'FULL',
		backgroundLoop: '',
		iNewsCommand: 'VIZ'
	}

	for (let i = 1; i < cue.length; i++) {
		if (isTime(cue[i])) {
			backgroundLoopCue = { ...backgroundLoopCue, ...parseTime(cue[i]) }
		} else {
			const c = cue[i].split('=')
			if ((c[0].match(/GRAFIK/i) || c[0].match(/triopage/i)) && c[1]) {
				backgroundLoopCue.backgroundLoop = c[1]
			}
		}
	}

	return backgroundLoopCue
}

function parseMic(cue: string[]): CueDefinitionMic {
	let micCue: CueDefinitionMic = {
		type: CueType.Mic,
		mics: {},
		iNewsCommand: 'STUDIE'
	}
	cue.forEach(c => {
		if (!c.match(/^STUDIE=MIC ON OFF$/i)) {
			if (isTime(c)) {
				micCue = { ...micCue, ...parseTime(c) }
			} else {
				const micState = c.match(/^(.+)=((?:ON)|(?:OFF))?$/i)
				if (micState) {
					micCue.mics[micState[1].toString()] = micState[2] ? micState[2] === 'ON' : false
				}
			}
		}
	})

	return micCue
}

function parseAdLib(cue: string[]) {
	const adlib: CueDefinitionAdLib = {
		type: CueType.AdLib,
		variant: '',
		inputs: {},
		iNewsCommand: 'ADLIBPIX'
	}

	const variant = cue[0].match(/^ADLIBPI?X=(.+)$/i)
	if (variant) {
		adlib.variant = variant[1]
	}

	// tslint:disable-next-line: prefer-for-of
	for (let i = 0; i < cue.length; i++) {
		const input = cue[i].match(/^(INP\d)+=(.+)$/i)
		if (input && input[1] && input[2] && adlib.inputs !== undefined) {
			adlib.inputs[input[1].toString().toUpperCase() as keyof DVESources] = input[2]
		}

		const bynavn = cue[i].match(/^BYNAVN=(.)$/i)
		if (bynavn) {
			adlib.bynavn = bynavn[1]
		}
	}

	return adlib
}

function parseKommando(cue: string[]) {
	let kommandoCue: CueDefinitionProfile = {
		type: CueType.Profile,
		profile: '',
		iNewsCommand: 'KOMMANDO'
	}

	if (cue[1]) {
		kommandoCue.profile = cue[1]
	}

	if (cue[2] && isTime(cue[2])) {
		kommandoCue = { ...kommandoCue, ...parseTime(cue[2]) }
	}

	return kommandoCue
}

function parseLYD(cue: string[]) {
	let lydCue: CueDefinitionLYD = {
		type: CueType.LYD,
		variant: '',
		iNewsCommand: 'LYD'
	}

	const command = cue[0].match(/^LYD=(.*)$/i)
	if (command) {
		lydCue.variant = command[1]
	}

	if (cue[1]) {
		if (isTime(cue[1])) {
			lydCue = { ...lydCue, ...parseTime(cue[1]) }
		} else if (cue[1].match(/;[x|\d+].[x|\d+]x/i)) {
			lydCue.adlib = true
		}
	}

	return lydCue
}

function parseJingle(cue: string[]) {
	const jingleCue: CueDefinitionJingle = {
		type: CueType.Jingle,
		clip: '',
		iNewsCommand: 'JINGLE'
	}
	const clip = cue[0].match(/^JINGLE\d+=(.*)$/i)
	if (clip && clip[1]) {
		jingleCue.clip = clip[1]
	}

	return jingleCue
}

function parseTargetEngine(
	cue: string[],
	config: TV2BlueprintConfig
): CueDefinitionUnpairedTarget | CueDefinitionGraphic<GraphicInternalOrPilot> | CueDefinitionGraphicDesign {
	let engineCue: CueDefinitionUnpairedTarget = {
		type: CueType.UNPAIRED_TARGET,
		target: 'FULL',
		iNewsCommand: ''
	}

	const command = cue[0].match(/^(VIZ|GRAFIK|SS)/i)
	engineCue.iNewsCommand = command ? command[1] : 'SS'
	const engine = cue[0].match(/^(?:VIZ|GRAFIK|SS)=(.*)$/i)

	const code = cue[0].match(/VIZ/i) ? 'VIZ' : cue[0].match(/GRAFIK/i) ? 'GRAFIK' : cue[0].match(/SS/i) ? 'SS' : 'GRAFIK'

	let iNewsName = ''
	if (engine) {
		iNewsName = engine[1]
		engineCue.target = engine[1].match(/OVL/i)
			? 'OVL'
			: engine[1].match(/WALL/i)
			? 'WALL'
			: engine[1].match(/TLF/i)
			? 'TLF'
			: cue[0].match(/^SS=/i)
			? 'WALL'
			: 'FULL'
	}

	const routing: CueDefinitionRouting = {
		type: CueType.Routing,
		target: engineCue.target,
		iNewsCommand: ''
	}

	for (let i = 1; i < cue.length; i++) {
		if (isTime(cue[i])) {
			engineCue = { ...engineCue, ...parseTime(cue[i]) }
		} else {
			const c = cue[i].split('=')
			const input = c[0].toString().toUpperCase()
			if (input === 'INP') {
				routing.INP = c[1]
			}

			if (input === 'INP1') {
				routing.INP1 = c[1]
			}
		}
	}

	if (routing.INP1 !== undefined || routing.INP !== undefined) {
		engineCue.routing = routing
	}

	const graphicConfig = config.showStyle.GFXTemplates.find(
		tmpl =>
			tmpl.INewsCode.toUpperCase() === code?.toUpperCase() && tmpl.INewsName.toUpperCase() === iNewsName.toUpperCase()
	)

	if (graphicConfig) {
		if (!!graphicConfig.VizTemplate.toUpperCase().match(/^VCP$/i)) {
			engineCue.mergeable = true
		} else {
			if (graphicConfig.IsDesign) {
				return literal<CueDefinitionGraphicDesign>({
					type: CueType.GraphicDesign,
					design: graphicConfig.VizTemplate,
					iNewsCommand: code,
					start: engineCue.start,
					end: engineCue.end,
					adlib: engineCue.adlib
				})
			}

			return literal<CueDefinitionGraphic<GraphicInternalOrPilot>>({
				type: CueType.Graphic,
				target: engineCue.target,
				graphic: {
					type: 'internal',
					template: graphicConfig.VizTemplate,
					textFields: [],
					cue: iNewsName
				},
				iNewsCommand: graphicConfig.INewsCode,
				start: engineCue.start,
				end: engineCue.end,
				adlib: engineCue.adlib,
				routing: engineCue.routing
			})
		}
	}

	return engineCue
}

function parseAllOut(cue: string[]): CueDefinitionClearGrafiks {
	let clearCue: CueDefinitionClearGrafiks = {
		type: CueType.ClearGrafiks,
		iNewsCommand: ''
	}

	let time = false
	cue.forEach(c => {
		const command = c.match(/^([#* ]?kg)/i)
		if (command) {
			clearCue.iNewsCommand = command[1]
		}
		if (isTime(c)) {
			time = true
			clearCue = { ...clearCue, ...parseTime(c) }
		}
	})

	if (!time) {
		clearCue.adlib = true
	}

	return clearCue
}

export function isTime(line: string) {
	return (
		line &&
		!!line
			.replace(/\s+/gi, '')
			.match(/^;\d{1,2}(?:(?:\.\d{1,2}){0,1}){0,2}(?:(?:-\d{1,2}(?:(?:\.\d{1,2}){0,1}){0,2}){0,1}|(?:-[BSO]))$/i)
	)
}

export function isMosTime(line: string) {
	return !!line.replace(/\s+/gi, '').match(/\d{1,2}(?:\:\d{1,2}){1,2}/i)
}

export function parseTime(line: string): Pick<CueDefinitionBase, 'start' | 'end'> {
	const retTime: any = {
		start: {},
		end: {}
	}
	const startAndEnd = line.split('-')
	startAndEnd[0] = startAndEnd[0].replace(';', '')
	startAndEnd.forEach((time, i) => {
		time = time.replace(/\s+/gi, '')
		const field = i === 0 ? 'start' : 'end'
		if (time.match(/^[BSO]$/i) && i !== 0) {
			retTime[field].infiniteMode = time
		} else {
			if (!!time.match(/\./i)) {
				const timeSegments = time.split('.')

				if (timeSegments[0]) {
					retTime[field].seconds = (Number(timeSegments[0]) || 0) * 60
				}

				if (timeSegments[1]) {
					if (retTime[field].seconds) {
						retTime[field].seconds += Number(timeSegments[1].replace('.', '')) || 0
					} else {
						retTime[field].seconds = Number(timeSegments[1].replace('.', '')) || 0
					}
				}

				if (timeSegments[2]) {
					retTime[field].frames = Number(timeSegments[2].replace('.', '')) || 0
				}
			} else {
				const timeSegments = time.split(':')
				if (timeSegments[0]) {
					retTime[field].seconds = (Number(timeSegments[0]) || 0) * 60
				}

				if (timeSegments[1]) {
					if (retTime[field].seconds) {
						retTime[field].seconds += Number(timeSegments[1]) || 0
					} else {
						retTime[field].seconds = Number(timeSegments[1]) || 0
					}
				}
			}
		}
	})

	if (!Object.keys(retTime.start).length) {
		retTime.start = undefined
	}

	if (!Object.keys(retTime.end).length) {
		retTime.end = undefined
	}

	return retTime
}

/**
 * Creates a parent class for a part, for keeping children of the parent alive when the parent is alive.
 * @param studio Studio name that the part belongs to.
 * @param partDefinition Part to create parent string for.
 */
export function PartToParentClass(studio: string, partDefinition: PartDefinition): string | undefined {
	switch (partDefinition.type) {
		case PartType.Kam:
			return CameraParentClass(studio, partDefinition.variant.name)
		case PartType.Server:
			const clip = partDefinition.fields.videoId

			if (clip) {
				return ServerParentClass(studio, clip)
			} else {
				return
			}
		case PartType.EVS:
			return EVSParentClass(studio, partDefinition.variant.evs)
		default:
			return UnknownPartParentClass(studio, partDefinition)
	}
}

export function CameraParentClass(studio: string, cameraName: string) {
	return `${studio.toLowerCase()}_parent_camera_${cameraName.toLowerCase().replace(/\W/, '_')}`
}

export function EksternParentClass(studio: string, source: string) {
	return `${studio.toLowerCase()}_parent_ekstern_${source.toLowerCase().replace(/\W/, '_')}`
}

export function ServerParentClass(studio: string, clip: string) {
	return `${studio.toLowerCase()}_parent_server_${clip.toLowerCase().replace(/\W/, '_')}`
}

export function EVSParentClass(studio: string, evs: string) {
	return `${studio.toLowerCase()}_parent_evs_${evs.toLowerCase().replace(/\W/, '_')}`
}

export function DVEParentClass(studio: string, dve: string) {
	return `${studio.toLowerCase()}_parent_dve_${dve.toLowerCase().replace(/\W/, '_')}`
}

export function TLFParentClass(studio: string, source: string) {
	return `${studio.toLowerCase()}_parent_tlf_${source.toLowerCase().replace(/\W/, '_')}`
}

export function UnknownPartParentClass(studio: string, partDefinition: PartDefinition): string | undefined {
	const firstCue = partDefinition.cues.find(c => [CueType.DVE, CueType.Ekstern, CueType.Telefon].includes(c.type))

	if (!firstCue) {
		return
	}

	switch (firstCue.type) {
		case CueType.DVE:
			return DVEParentClass(studio, firstCue.template)
		case CueType.Ekstern:
			return EksternParentClass(studio, firstCue.source)
		case CueType.Telefon:
			return TLFParentClass(studio, firstCue.source)
		default:
			return
	}
}

export function AddParentClass(partDefinition: PartDefinition) {
	return !!partDefinition.cues.filter(
		cue => cue.type === CueType.Graphic && cue.end && cue.end.infiniteMode && cue.end.infiniteMode === 'B'
	).length
}

export function UnpairedPilotToGraphic(
	pilotCue: CueDefinitionUnpairedPilot,
	target: GraphicEngine,
	targetCue?: CueDefinitionUnpairedTarget | CueDefinitionTelefon
): CueDefinitionGraphic<GraphicInternalOrPilot> {
	return literal<CueDefinitionGraphic<GraphicInternalOrPilot>>({
		type: CueType.Graphic,
		target,
		routing: targetCue?.type === CueType.UNPAIRED_TARGET ? targetCue.routing : undefined,
		iNewsCommand: targetCue?.iNewsCommand ?? pilotCue.iNewsCommand,
		graphic: {
			type: 'pilot',
			name: pilotCue.name,
			vcpid: pilotCue.vcpid,
			continueCount: pilotCue.continueCount
		},
		start: targetCue?.start ?? pilotCue.start,
		end: targetCue?.end ?? pilotCue.end,
		engineNumber: pilotCue.engineNumber,
		adlib: targetCue?.adlib ?? pilotCue.adlib
	})
}
