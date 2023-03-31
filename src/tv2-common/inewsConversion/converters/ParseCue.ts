import { literal, TableConfigItemGfxDesignTemplate, TV2ShowStyleConfig, UnparsedCue } from 'tv2-common'
import { CueType, GraphicEngine, SourceType } from 'tv2-constants'
import {
	getSourceDefinition,
	getTransitionProperties,
	PartdefinitionTypes,
	SourceDefinition,
	SourceDefinitionInvalid,
	SourceDefinitionRemote,
	stripTransitionProperties
} from './ParseBody'

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
	/** Definition of the primary source */
	sourceDefinition: SourceDefinitionRemote | SourceDefinitionInvalid
	transition?: Pick<PartdefinitionTypes, 'effekt' | 'transition'>
}

export interface DVESources {
	INP1?: SourceDefinition
	INP2?: SourceDefinition
	INP3?: SourceDefinition
	INP4?: SourceDefinition
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
	bynavn?: string[]
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

export interface CueDefinitionMixMinus extends CueDefinitionBase {
	type: CueType.MixMinus
	sourceDefinition: SourceDefinition
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

export interface CueDefinitionBackgroundLoop extends CueDefinitionBase, CueDefinitionFromLayout {
	type: CueType.BackgroundLoop
	target: 'FULL' | 'DVE'
	backgroundLoop: string
}

export interface CueDefinitionGraphicDesign extends CueDefinitionBase, CueDefinitionFromLayout {
	type: CueType.GraphicDesign
	design: string
}

export interface CueDefinitionFromLayout {
	isFromLayout?: boolean
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
	INP?: SourceDefinition
	INP1?: SourceDefinition
}

export interface CueDefinitionPgmClean extends CueDefinitionBase {
	type: CueType.PgmClean
	sourceDefinition: SourceDefinition
}

export interface CueDefinitionRobotCamera extends CueDefinitionBase {
	type: CueType.RobotCamera
	presetIdentifier: number
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
	| CueDefinitionPgmClean
	| CueDefinitionMixMinus
	| CueDefinitionRobotCamera

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

export function ParseCue(cue: UnparsedCue, config: TV2ShowStyleConfig): CueDefinition | undefined {
	if (!cue) {
		return undefined
	}

	cue = cue.filter(c => c !== '')
	// Replace multiple spaces / tabs with a single space
	cue = cue.map(c => c?.trim().replace(/\s+/g, ' '))

	if (cue.length === 0) {
		return undefined
	}

	if (/^[#* ]?kg[= ]ovl-all-out$/i.test(cue[0]) || /^[#* ]?kg[= ]altud$/i.test(cue[0])) {
		// All out
		return parseAllOut(cue)
	} else if (/(?:^[*|#]?kg[ |=])|(?:^digi)/i.test(cue[0])) {
		// kg (Grafik)
		return parsekg(cue, config)
	} else if (/^]] [a-z]\d\.\d [a-z] \d \[\[$/i.test(cue[0])) {
		// MOS
		return parsePilot(cue)
	} else if (/[#|*]?cg\d+[ -]pilotdata/i.test(cue[0])) {
		return parsePilot(cue)
	} else if (/^EKSTERN=/i.test(cue[0])) {
		// EKSTERN
		return parseEkstern(cue)
	} else if (/^DVE=/i.test(cue[0])) {
		// DVE
		return parseDVE(cue)
	} else if (/^TELEFON=/i.test(cue[0])) {
		// Telefon
		return parseTelefon(cue, config)
	} else if (/^(?:SS|GRAFIK)=(?:.*)(?:$| )/i.test(cue[0])) {
		// Target engine
		return parseTargetEngine(cue, config)
	} else if (/^(?:SS|GRAFIK|VIZ)=(?:full|ovl|wall)(?:$| )/i.test(cue[0])) {
		return parseTargetEngine(cue, config)
	} else if (/^VIZ=/i.test(cue[0])) {
		return parseVIZCues(cue)
	} else if (/^STUDIE=MIC ON OFF$/i.test(cue[0])) {
		return parseMic(cue)
	} else if (/^ADLIBPI?X=/i.test(cue[0])) {
		return parseAdLib(cue)
	} else if (/^KOMMANDO=/i.test(cue[0])) {
		return parseKommando(cue)
	} else if (/^LYD=/i.test(cue[0])) {
		return parseLYD(cue)
	} else if (/^JINGLE\d+=/i.test(cue[0])) {
		return parseJingle(cue)
	} else if (/^PGMCLEAN=/i.test(cue[0])) {
		return parsePgmClean(cue)
	} else if (/^MINUSKAM\s*=/i.test(cue[0])) {
		return parseMixMinus(cue)
	} else if (/^DESIGN_LAYOUT=/i.test(cue[0])) {
		return parseDesignLayout(cue, config)
	} else if (/^ROBOT\s*=/i.test(cue[0])) {
		return parseRobotCue(cue)
	}

	return literal<CueDefinitionUnknown>({
		type: CueType.UNKNOWN,
		iNewsCommand: ''
	})
}

function parsekg(
	cue: string[],
	config: TV2ShowStyleConfig
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

	const graphicDesignConfig = code
		? config.showStyle.GfxDesignTemplates.find(
				template => template.INewsName.toUpperCase() === graphic.template.toUpperCase()
		  )
		: undefined

	if (graphicDesignConfig) {
		return literal<CueDefinitionGraphicDesign>({
			type: CueType.GraphicDesign,
			design: graphicDesignConfig.VizTemplate,
			iNewsCommand: kgCue.iNewsCommand,
			start: kgCue.start,
			end: kgCue.end,
			adlib: kgCue.adlib
		})
	}

	const graphicConfig = code
		? config.showStyle.GfxTemplates.find(
				template =>
					template.INewsCode.replace(/^KG=?/gi, '#KG').toUpperCase() === code.replace(/^KG=?/gi, '#KG').toUpperCase() &&
					template.INewsName.toUpperCase() === graphic.template.toUpperCase()
		  )
		: undefined

	if (graphicConfig && !!graphicConfig.VizTemplate.match(/^VCP$/i)) {
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

function parseEkstern(cue: string[]): CueDefinitionEkstern | undefined {
	const eksternSource = stripTransitionProperties(cue[0]).match(/^EKSTERN=(.+)$/i)
	if (eksternSource) {
		let sourceDefinition = getSourceDefinition(eksternSource[1])
		if (sourceDefinition?.sourceType !== SourceType.REMOTE) {
			sourceDefinition = {
				sourceType: SourceType.INVALID,
				name: eksternSource[1],
				raw: eksternSource[1]
			}
		}
		const transitionProperties = getTransitionProperties(cue[0])
		return literal<CueDefinitionEkstern>({
			type: CueType.Ekstern,
			iNewsCommand: 'EKSTERN',
			transition: transitionProperties,
			sourceDefinition
		})
	}

	return undefined
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
				dvecue.sources[input[1].toUpperCase() as keyof DVESources] = getSourceDefinition(input[2])
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

function parseTelefon(cue: string[], config: TV2ShowStyleConfig): CueDefinitionTelefon {
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
	for (const element of cue) {
		const input = element.match(/^(INP\d)+=(.+)$/i)
		if (input && input[1] && input[2] && adlib.inputs !== undefined) {
			adlib.inputs[input[1].toUpperCase() as keyof DVESources] = getSourceDefinition(input[2])
		}

		const bynavn = element.match(/^BYNAVN=(.+)$/i)
		if (bynavn) {
			adlib.bynavn = bynavn[1].split(/\/|\\/i)
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
	config: TV2ShowStyleConfig
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
	let hasInputs = false
	for (let i = 1; i < cue.length; i++) {
		if (isTime(cue[i])) {
			engineCue = { ...engineCue, ...parseTime(cue[i]) }
		} else {
			const c = cue[i].split('=')
			const input = c[0].toString().toUpperCase()
			if (input === 'INP') {
				routing.INP = getSourceDefinition(c[1])
				hasInputs = true
			}

			if (input === 'INP1') {
				routing.INP1 = getSourceDefinition(c[1])
				hasInputs = true
			}
		}
	}

	if (hasInputs) {
		engineCue.routing = routing
	}

	const graphicDesignConfig = code
		? config.showStyle.GfxDesignTemplates.find(template => template.INewsName.toUpperCase() === iNewsName.toUpperCase())
		: undefined

	if (graphicDesignConfig) {
		return literal<CueDefinitionGraphicDesign>({
			type: CueType.GraphicDesign,
			design: graphicDesignConfig.VizTemplate,
			iNewsCommand: code,
			start: engineCue.start,
			end: engineCue.end,
			adlib: engineCue.adlib
		})
	}

	const graphicConfig = config.showStyle.GfxTemplates.find(
		template =>
			template.INewsCode.toUpperCase() === code?.toUpperCase() &&
			template.INewsName.toUpperCase() === iNewsName.toUpperCase()
	)

	if (graphicConfig) {
		if (!!graphicConfig.VizTemplate.toUpperCase().match(/^VCP$/i)) {
			engineCue.mergeable = true
		} else {
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

export function parsePgmClean(cue: string[]): CueDefinitionPgmClean {
	const pgmSource = cue[0].match(/^PGMCLEAN=(.+)$/i)
	const pgmCleanCue: CueDefinitionPgmClean = {
		type: CueType.PgmClean,
		iNewsCommand: 'PGMCLEAN',
		sourceDefinition: { sourceType: SourceType.PGM }
	}
	if (pgmSource && pgmSource[1]) {
		const sourceDefinition = getSourceDefinition(pgmSource[1])
		if (sourceDefinition) {
			pgmCleanCue.sourceDefinition = sourceDefinition
		}
	}
	return pgmCleanCue
}

export function parseMixMinus(cue: string[]): CueDefinitionMixMinus | undefined {
	const sourceMatch = cue[0].match(/^MINUSKAM\s*=\s*(?<source>.+)\s*$/i)
	if (sourceMatch === null) {
		return undefined
	}
	const sourceDefinition = getSourceDefinition(sourceMatch.groups!.source)
	if (sourceDefinition === undefined) {
		return undefined
	}
	return literal<CueDefinitionMixMinus>({
		type: CueType.MixMinus,
		sourceDefinition,
		iNewsCommand: 'MINUSKAM'
	})
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

function parseDesignLayout(cue: string[], config: TV2ShowStyleConfig): CueDefinitionGraphicDesign | undefined {
	const array = cue[0].split('DESIGN_LAYOUT=')
	const layout = array[1]

	const designConfig = findGraphicDesignConfiguration(config, layout)

	if (!designConfig) {
		return undefined
	}

	return literal<CueDefinitionGraphicDesign>({
		type: CueType.GraphicDesign,
		design: designConfig.VizTemplate,
		iNewsCommand: layout,
		start: {
			frames: 1
		},
		isFromLayout: true
	})
}

function findGraphicDesignConfiguration(
	config: TV2ShowStyleConfig,
	layout: string
): TableConfigItemGfxDesignTemplate | undefined {
	return config.showStyle.GfxDesignTemplates.find(
		template => template.INewsStyleColumn && template.INewsStyleColumn.toUpperCase() === layout.toUpperCase()
	)
}

function parseRobotCue(cue: string[]): CueDefinitionRobotCamera {
	const presetIdentifier: number = Number(cue[0].match(/\d+/))
	const time: Pick<CueDefinitionBase, 'start' | 'end'> = cue[1] ? parseTime(cue[1]) : { start: { seconds: 0 } }
	return {
		type: CueType.RobotCamera,
		iNewsCommand: 'RobotCamera',
		presetIdentifier,
		...time
	}
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
