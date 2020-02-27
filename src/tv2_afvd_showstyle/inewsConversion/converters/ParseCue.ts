import { PartDefinition, PartType } from './ParseBody'

export type UnparsedCue = string[] | null

export enum CueType {
	Unknown,
	Grafik,
	MOS,
	Ekstern,
	DVE,
	Telefon,
	VIZ,
	Mic,
	AdLib,
	LYD,
	Jingle,
	Design,
	Profile,
	TargetEngine,
	ClearGrafiks,
	TargetWall
}

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
}

export interface CueDefinitionUnknown extends CueDefinitionBase {
	type: CueType.Unknown
}

export interface CueDefinitionGrafik extends CueDefinitionBase {
	type: CueType.Grafik
	template: string
	cue: string
	textFields: string[]
}

export interface CueDefinitionMOS extends CueDefinitionBase {
	type: CueType.MOS
	name: string
	vcpid: number
	continueCount: number
	engine?: string
	isActuallyWall?: boolean
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
	vizObj?: CueDefinitionGrafik | CueDefinitionMOS
}

export interface CueDefinitionVIZ extends CueDefinitionBase {
	type: CueType.VIZ
	rawType: string
	content: {
		[key: string]: string
	}
	design: string
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

export interface CueDefinitionDesign extends CueDefinitionBase {
	type: CueType.Design
	design: string
}

export interface CueDefinitionProfile extends CueDefinitionBase {
	type: CueType.Profile
	profile: string
}

export interface CueDefinitionTargetEngine extends CueDefinitionBase {
	type: CueType.TargetEngine
	rawType: string
	engine: string
	content: {
		[key: string]: string
	}
	grafik?: CueDefinitionMOS
}

export interface CueDefinitionTargetWall extends CueDefinitionBase {
	type: CueType.TargetWall
	clip: string
}

export interface CueDefinitionClearGrafiks extends CueDefinitionBase {
	type: CueType.ClearGrafiks
}

export type CueDefinition =
	| CueDefinitionUnknown
	| CueDefinitionGrafik
	| CueDefinitionMOS
	| CueDefinitionEkstern
	| CueDefinitionDVE
	| CueDefinitionTelefon
	| CueDefinitionVIZ
	| CueDefinitionMic
	| CueDefinitionAdLib
	| CueDefinitionLYD
	| CueDefinitionJingle
	| CueDefinitionDesign
	| CueDefinitionProfile
	| CueDefinitionTargetEngine
	| CueDefinitionClearGrafiks
	| CueDefinitionTargetWall

export function ParseCue(cue: UnparsedCue): CueDefinition {
	if (!cue) {
		return {
			type: CueType.Unknown
		}
	}

	cue = cue.filter(c => c !== '')
	// Replace multiple spaces / tabs with a single space
	cue = cue.map(c => c.trim().replace(/\s+/g, ' '))

	if (cue.length === 0) {
		return {
			type: CueType.Unknown
		}
	}

	if (cue[0].match(/^[#* ]?kg[= ]ovl-all-out$/i) || cue[0].match(/^[#* ]?kg[= ]altud$/i)) {
		// All out
		return parseAllOut(cue)
	} else if (cue[0].match(/(?:^[*|#]?kg[ |=])|(?:^digi)/i)) {
		// kg (Grafik)
		return parsekg(cue)
	} else if (cue[0].match(/ss=/i)) {
		return parseTargetWall(cue)
	} else if (cue[0].match(/^]] [a-z]\d\.\d [a-z] \d \[\[$/i)) {
		// MOS
		return parseMOS(cue)
	} else if (cue[0].match(/[#|*]?cg\d+[ -]pilotdata/i)) {
		return parseMOS(cue)
	} else if (cue[0].match(/^EKSTERN=/i)) {
		// EKSTERN
		const eksternSource = cue[0].match(/^EKSTERN=(.+)$/i)
		if (eksternSource) {
			return {
				type: CueType.Ekstern,
				source: eksternSource[1]
			}
		}
	} else if (cue[0].match(/^DVE=/i)) {
		// DVE
		return parseDVE(cue)
	} else if (cue[0].match(/^TELEFON=/i)) {
		// Telefon
		return parseTelefon(cue)
	} else if (cue[0].match(/^(?:GRAFIK|VIZ)=(?:full|ovl|wall)(?:$| )/i)) {
		// Target engine
		return parseTargetEngine(cue)
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
	return {
		type: CueType.Unknown
	}
}

function parsekg(cue: string[]): CueDefinitionGrafik {
	let kgCue: CueDefinitionGrafik = {
		type: CueType.Grafik,
		template: '',
		cue: '',
		textFields: []
	}

	const firstLineValues = cue[0].match(/^[*|#]?kg[ |=]([\w|\d]+)( (.+))*$/i)
	if (firstLineValues) {
		kgCue.cue = cue[0].match(/kg/) ? 'kg' : 'KG' // THIS ONE SHOULD NOT BE INSENSITIVE
		kgCue.template = firstLineValues[1]
		if (firstLineValues[3]) {
			kgCue.textFields.push(firstLineValues[3])
		}
	} else if (cue[0].match(/^DIGI=/i)) {
		kgCue.cue = 'DIGI'
		const templateType = cue[0].match(/^DIGI=(.+)$/i)
		if (templateType) {
			kgCue.template = templateType[1]
		}
	}

	let textFields = cue.length - 1
	if (isTime(cue[cue.length - 1])) {
		kgCue = { ...kgCue, ...parseTime(cue[cue.length - 1]) }
	} else if (!cue[cue.length - 1].match(/;x.xx/i)) {
		textFields += 1
	} else {
		kgCue.adlib = true
	}

	for (let i = 1; i < textFields; i++) {
		kgCue.textFields.push(cue[i])
	}

	if (!kgCue.start) {
		kgCue.adlib = true
	}

	return kgCue
}

function parseMOS(cue: string[]): CueDefinitionMOS {
	const mosCue: CueDefinitionMOS = {
		type: CueType.MOS,
		name: '',
		vcpid: -1,
		continueCount: -1
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
				mosCue.engine = engine[1]
			}
		}
	})
	if (realCue.length === 4) {
		const vcpid = realCue[1].match(/^VCPID=(\d+)$/i)
		const continueCount = realCue[2].match(/^ContinueCount=(-?\d+)$/i)
		const timing = realCue[0].match(/L\|(M|\d{1,2}(?:\:\d{1,2}){0,2})\|([SBO]|\d{1,2}(?:\:\d{1,2}){0,2})$/i)

		if (vcpid && continueCount) {
			mosCue.name = realCue[0]
			mosCue.vcpid = Number(vcpid[1])
			mosCue.continueCount = Number(continueCount[1])

			if (!!mosCue.name.match(/^ST4_WALL/i)) {
				mosCue.isActuallyWall = true
			}

			if (timing) {
				if (timing[1] === 'M') {
					mosCue.adlib = true
				} else if (isMosTime(timing[1])) {
					mosCue.start = parseTime(timing[1]).start
				}

				if (timing[2].match(/[SBO]/i)) {
					mosCue.end = {
						infiniteMode: timing[2] as keyof { B: any; S: any; O: any }
					}
				} else if (isMosTime(timing[2])) {
					mosCue.end = parseTime(timing[2]).start
				}
			} else {
				mosCue.start = { seconds: 0 }
			}
		}
	}
	return mosCue
}

function parseDVE(cue: string[]): CueDefinitionDVE {
	let dvecue: CueDefinitionDVE = {
		type: CueType.DVE,
		template: '',
		sources: {},
		labels: []
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

function parseTelefon(cue: string[]): CueDefinitionTelefon {
	const telefonCue: CueDefinitionTelefon = {
		type: CueType.Telefon,
		source: ''
	}
	const source = cue[0].match(/^TELEFON=(.+)$/i)
	if (source) {
		telefonCue.source = source[1]
	}

	if (cue.length > 1) {
		// tslint:disable-next-line:prefer-conditional-expression
		if (cue[1].match(/(?:^[*|#]?kg[ |=])|(?:^digi)/i)) {
			telefonCue.vizObj = parsekg(cue.slice(1, cue.length))
		} else {
			telefonCue.vizObj = parseMOS(cue.slice(1, cue.length))
		}
	}

	return telefonCue
}

function parseVIZCues(cue: string[]): CueDefinitionVIZ {
	let vizCues: CueDefinitionVIZ = {
		type: CueType.VIZ,
		rawType: cue[0],
		content: {},
		design: ''
	}

	const design = cue[0].match(/^(?:VIZ|GRAFIK)=(.*)$/i)
	if (design) {
		vizCues.design = design[1]
	}

	for (let i = 1; i < cue.length; i++) {
		if (isTime(cue[i])) {
			vizCues = { ...vizCues, ...parseTime(cue[i]) }
		} else {
			const c = cue[i].split('=')
			vizCues.content[c[0].toString().toUpperCase()] = c[1]
		}
	}

	return vizCues
}

function parseMic(cue: string[]): CueDefinitionMic {
	let micCue: CueDefinitionMic = {
		type: CueType.Mic,
		mics: {}
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
		inputs: {}
	}

	const variant = cue[0].match(/^ADLIBPI?X=(.+)$/i)
	if (variant) {
		adlib.variant = variant[1]
	}

	if (cue[1]) {
		const input = cue[1].match(/^(INP\d)+=(.+)$/i)
		if (input && input[1] && input[2] && adlib.inputs !== undefined) {
			adlib.inputs[input[1].toString().toUpperCase() as keyof DVESources] = input[2]
		}
	}

	if (cue[2]) {
		const bynavn = cue[2].match(/^BYNAVN=(.)$/i)
		if (bynavn) {
			adlib.bynavn = bynavn[1]
		}
	}

	return adlib
}

function parseKommando(cue: string[]) {
	let kommandoCue: CueDefinitionProfile = {
		type: CueType.Profile,
		profile: ''
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
		variant: ''
	}

	const command = cue[0].match(/^LYD=(.*)$/i)
	if (command) {
		lydCue.variant = command[1]
	}

	if (cue[1]) {
		if (isTime(cue[1])) {
			lydCue = { ...lydCue, ...parseTime(cue[1]) }
		} else if (cue[1].match(/;x.xx/i)) {
			lydCue.adlib = true
		}
	}

	return lydCue
}

function parseJingle(cue: string[]) {
	const jingleCue: CueDefinitionJingle = {
		type: CueType.Jingle,
		clip: ''
	}
	const clip = cue[0].match(/^JINGLE\d+=(.*)$/i)
	if (clip && clip[1]) {
		jingleCue.clip = clip[1]
	}

	return jingleCue
}

function parseTargetEngine(cue: string[]): CueDefinitionTargetEngine {
	let engineCue: CueDefinitionTargetEngine = {
		type: CueType.TargetEngine,
		rawType: cue[0],
		content: {},
		engine: ''
	}

	const engine = cue[0].match(/^(?:VIZ|GRAFIK)=(.*)$/i)

	if (engine) {
		engineCue.engine = engine[1]
	}

	for (let i = 1; i < cue.length; i++) {
		if (isTime(cue[i])) {
			engineCue = { ...engineCue, ...parseTime(cue[i]) }
		} else {
			const c = cue[i].split('=')
			engineCue.content[c[0].toString().toUpperCase()] = c[1]
		}
	}

	return engineCue
}

function parseTargetWall(cue: string[]): CueDefinitionTargetWall {
	let engineCue: CueDefinitionTargetWall = {
		type: CueType.TargetWall,
		clip: ''
	}

	const clip = cue[0].match(/^SS=(.*)$/i)

	if (clip) {
		engineCue.clip = clip[1]
	}

	for (let i = 1; i < cue.length; i++) {
		if (isTime(cue[i])) {
			engineCue = { ...engineCue, ...parseTime(cue[i]) }
		}
	}

	return engineCue
}

function parseAllOut(cue: string[]): CueDefinitionClearGrafiks {
	let clearCue: CueDefinitionClearGrafiks = {
		type: CueType.ClearGrafiks
	}

	let time = false
	cue.forEach(c => {
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
		case PartType.Unknown:
			return UnknownPartParentClass(studio, partDefinition)
		default:
			return
	}
}

export function CameraParentClass(studio: string, cameraName: string) {
	return `${studio.toLowerCase()}_parent_camera_${cameraName.toLowerCase()}`
}

export function EksternParentClass(studio: string, source: string) {
	return `${studio.toLowerCase()}_parent_ekstern_${source.toLowerCase()}`
}

export function ServerParentClass(studio: string, clip: string) {
	return `${studio.toLowerCase()}_parent_server_${clip.toLowerCase()}`
}

export function EVSParentClass(studio: string, evs: string) {
	return `${studio.toLowerCase()}_parent_evs_${evs.toLowerCase()}`
}

export function DVEParentClass(studio: string, dve: string) {
	return `${studio.toLowerCase()}_parent_dve_${dve.toLowerCase()}`
}

export function TLFParentClass(studio: string, source: string) {
	return `${studio.toLowerCase()}_parent_tlf_${source.toLowerCase()}`
}

export function UnknownPartParentClass(studio: string, partDefinition: PartDefinition): string | undefined {
	const firstCue = partDefinition.cues[0]

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
		cue =>
			(cue.type === CueType.Grafik || cue.type === CueType.MOS) &&
			cue.end &&
			cue.end.infiniteMode &&
			cue.end.infiniteMode === 'B'
	).length
}
