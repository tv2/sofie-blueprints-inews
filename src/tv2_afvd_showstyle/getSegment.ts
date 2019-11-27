import {
	BlueprintResultPart,
	BlueprintResultSegment,
	IBlueprintPiece,
	IBlueprintRundownDB,
	IBlueprintSegment,
	IngestSegment,
	PartContext,
	ScriptContent,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { assertUnreachable, literal } from '../common/util'
import { parseConfig } from './helpers/config'
import { ParseBody, PartDefinition, PartDefinitionSlutord, PartType } from './inewsConversion/converters/ParseBody'
import {
	CueDefinitionGrafik,
	CueDefinitionMOS,
	CueDefinitionTargetEngine,
	CueDefinitionTelefon,
	CueType
} from './inewsConversion/converters/ParseCue'
import { SourceLayer } from './layers'
import { CreatePartCueOnly } from './parts/cueonly'
import { CreatePartGrafik } from './parts/grafik'
import { CreatePartIntro } from './parts/intro'
import { CreatePartInvalid } from './parts/invalid'
import { CreatePartKam } from './parts/kam'
import { CreatePartLive } from './parts/live'
import { CreatePartServer } from './parts/server'
import { CreatePartTeknik } from './parts/teknik'
import { CreatePartUnknown } from './parts/unknown'
import { CreatePartVO } from './parts/vo'
import { postProcessPartTimelineObjects } from './postProcessTimelineObjects'

export function getSegment(context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const segment = literal<IBlueprintSegment>({
		name:
			ingestSegment.payload.iNewsStory.fields.pageNumber && ingestSegment.payload.iNewsStory.fields.pageNumber.trim()
				? `${ingestSegment.payload.iNewsStory.fields.pageNumber.trim()} ${ingestSegment.name}`
				: ingestSegment.name,
		metaData: {}
	})
	const config = parseConfig(context)

	if (ingestSegment.payload.iNewsStory.meta.float === 'float') {
		segment.isHidden = true
		return {
			segment,
			parts: []
		}
	}

	const blueprintParts: BlueprintResultPart[] = []
	const parsedParts = ParseBody(
		ingestSegment.externalId,
		ingestSegment.name,
		ingestSegment.payload.iNewsStory.body,
		ingestSegment.payload.iNewsStory.cues,
		ingestSegment.payload.iNewsStory.fields,
		ingestSegment.payload.iNewsStory.fields.modifyDate
	)
	const totalWords = parsedParts.reduce((prev, cur) => {
		return prev + cur.script.length
	}, 0)
	let serverParts = 0
	for (let i = 0; i < parsedParts.length; i++) {
		const part = parsedParts[i]
		const partContext = new PartContext2(context, part.externalId)
		const livecue = part.cues.filter(cue => cue.type === CueType.Ekstern)
		const dveCue = part.cues.filter(cue => cue.type === CueType.DVE)
		const targetCue = part.cues.filter(cue => cue.type === CueType.TargetEngine && cue.engine.match(/full/i))
		const tlfCue = part.cues.filter(cue => cue.type === CueType.Telefon)
		const extraParts: BlueprintResultPart[] = []
		if (
			livecue.length &&
			(dveCue.length || part.type === PartType.Kam || part.type === PartType.Server || part.type === PartType.VO)
		) {
			livecue.forEach((cue, j) => {
				extraParts.push(
					CreatePartCueOnly(
						partContext,
						config,
						part,
						`${part.externalId}-${j * j}`,
						`${part.rawType ? `${part.rawType}-` : ''}EKSTERN-${j}`,
						cue,
						totalWords,
						true
					)
				)
				part.cues.splice(
					part.cues.findIndex(c => _.isEqual(c, cue)),
					1
				)
			})
		}
		if (dveCue.length && part.type === PartType.Kam) {
			dveCue.forEach((cue, j) => {
				extraParts.push(
					CreatePartCueOnly(
						partContext,
						config,
						part,
						`${part.externalId}-${j * j}`,
						`${part.rawType ? `${part.rawType}-` : ''}DVE-${j}`,
						cue,
						totalWords,
						true
					)
				)
				part.cues.splice(
					part.cues.findIndex(c => _.isEqual(c, cue)),
					1
				)
			})
		}
		if (dveCue.length && part.type === PartType.Kam) {
			dveCue.forEach((cue, j) => {
				extraParts.push(
					CreatePartCueOnly(
						partContext,
						config,
						part,
						`${part.externalId}-${2}`,
						`${part.rawType ? `${part.rawType}-` : ''}DVE-${j}`,
						cue,
						totalWords,
						true
					)
				)
				part.cues.splice(
					part.cues.findIndex(c => _.isEqual(c, cue)),
					1
				)
			})
		}
		if (targetCue.length && !tlfCue.length && part.cues.length !== 1) {
			targetCue.forEach((cue: CueDefinitionTargetEngine, j: number) => {
				extraParts.push(
					CreatePartCueOnly(
						partContext,
						config,
						part,
						`${part.externalId}=${j * j ** 2}`,
						`${part.rawType}`,
						cue,
						totalWords
					)
				)
				part.cues.splice(
					part.cues.findIndex(c => _.isEqual(c, cue)),
					1
				)
			})
		}
		if (tlfCue.length) {
			tlfCue.forEach((cue: CueDefinitionTelefon, j) => {
				const index = part.cues.findIndex(c => _.isEqual(c, cue))
				if (index < part.cues.length - 1) {
					if (part.cues[index + 1].type === CueType.MOS || part.cues[index + 1].type === CueType.Grafik) {
						cue.vizObj =
							part.cues[index + 1].type === CueType.MOS
								? (part.cues[index + 1] as CueDefinitionMOS)
								: (part.cues[index + 1] as CueDefinitionGrafik)
						part.cues.splice(index + 1, 1)
					}
				}
				extraParts.push(
					CreatePartCueOnly(
						partContext,
						config,
						part,
						`${part.externalId}-${1}`,
						`${part.rawType ? `${part.rawType}-` : ''}EKSTERN-${j}`,
						cue,
						totalWords
					)
				)
				part.cues.splice(
					part.cues.findIndex(c => _.isEqual(c, cue)),
					1
				)
			})
		}
		switch (part.type) {
			case PartType.INTRO:
				blueprintParts.push(CreatePartIntro(partContext, config, part, totalWords))
				break
			case PartType.Kam:
				blueprintParts.push(CreatePartKam(partContext, config, part, totalWords))
				break
			case PartType.Server:
				blueprintParts.push(CreatePartServer(partContext, config, part))
				break
			case PartType.Live:
				const blueprintPart = CreatePartLive(partContext, config, part, totalWords)
				if (!blueprintPart.part.invalid && (blueprintPart.pieces.length || blueprintPart.adLibPieces.length)) {
					blueprintParts.push(blueprintPart)
				}
				break
			case PartType.Teknik:
				blueprintParts.push(CreatePartTeknik(partContext, config, part, totalWords))
				break
			case PartType.Grafik:
				blueprintParts.push(CreatePartGrafik(partContext, config, part, totalWords))
				break
			case PartType.VO:
				blueprintParts.push(CreatePartVO(partContext, config, part, totalWords))
				break
			case PartType.Unknown:
				blueprintParts.push(CreatePartUnknown(partContext, config, part, totalWords))
				break
			case PartType.Slutord:
				blueprintParts.push(CreatePartInvalid(part))
				context.warning('Slutord should have been filtered out by now, something may have gone wrong')
				break
			default:
				assertUnreachable(part)
				break
		}
		if (SlutordLookahead(parsedParts, i, 1, blueprintParts)) {
			if (SlutordLookahead(parsedParts, i, 2, blueprintParts)) {
				i++
			}
			i++
		}
		if (blueprintParts[blueprintParts.length - 1].pieces.length === 1) {
			const p = blueprintParts[blueprintParts.length - 1].pieces[0]
			if (p.sourceLayerId === SourceLayer.PgmScript) {
				blueprintParts[blueprintParts.length - 1].part.autoNext = true
				blueprintParts[blueprintParts.length - 1].part.expectedDuration = 1000
			}
		}
		extraParts.forEach(extraPart => {
			blueprintParts.push(extraPart)
		})

		if (part.type === PartType.Server || (part.type === PartType.VO && Number(part.fields.tapeTime) > 0)) {
			serverParts++
		}
	}

	blueprintParts.forEach(part => {
		part.part.displayDurationGroup = ingestSegment.externalId
		if (!part.part.expectedDuration) {
			part.part.expectedDuration =
				(Number(ingestSegment.payload.iNewsStory.fields.audioTime) * 1000 || 0) / (blueprintParts.length - serverParts)
		}
	})

	if (blueprintParts.filter(part => part.pieces.length === 0 && part.adLibPieces.length).length) {
		segment.isHidden = true
	}

	if (
		blueprintParts.filter(part => part.part.invalid === true).length === blueprintParts.length &&
		ingestSegment.payload.iNewsStory.cues.length === 0
	) {
		segment.isHidden = true
	}

	postProcessPartTimelineObjects(context, config, blueprintParts)

	return {
		segment,
		parts: blueprintParts
	}
}

function SlutordLookahead(
	parsedParts: PartDefinition[],
	currentIndex: number,
	offset: number,
	blueprintParts: BlueprintResultPart[]
): boolean {
	// Check if next part is Slutord
	if (currentIndex + offset < parsedParts.length) {
		if (parsedParts[currentIndex + offset].type === PartType.Slutord) {
			const part = (parsedParts[currentIndex + offset] as unknown) as PartDefinitionSlutord
			// If it's attached to a server and has some content
			if (
				(parsedParts[currentIndex].type === PartType.Server || parsedParts[currentIndex].type === PartType.Slutord) &&
				part.variant.endWords
			) {
				blueprintParts[blueprintParts.length - 1].pieces.push(
					literal<IBlueprintPiece>({
						_id: '',
						name: `Slutord: ${part.variant.endWords}`,
						sourceLayerId: SourceLayer.PgmScript,
						outputLayerId: 'manus',
						externalId: parsedParts[currentIndex].externalId,
						enable: {
							start: 0
						},
						content: literal<ScriptContent>({
							firstWords: 'SLUTORD:',
							lastWords: part.variant.endWords,
							fullScript: `SLUTORD: ${part.variant.endWords}`
						})
					})
				)
			}
			return true
		}
	}

	return false
}

export class PartContext2 implements PartContext {
	public readonly rundownId: string
	public readonly rundown: IBlueprintRundownDB
	private baseContext: SegmentContext
	private externalId: string

	constructor(baseContext: SegmentContext, externalId: string) {
		this.baseContext = baseContext
		this.externalId = externalId

		this.rundownId = baseContext.rundownId
		this.rundown = baseContext.rundown
	}

	/** PartContext */
	public getRuntimeArguments() {
		return this.baseContext.getRuntimeArguments(this.externalId) || {}
	}

	/** IShowStyleConfigContext */
	public getShowStyleConfig() {
		return this.baseContext.getShowStyleConfig()
	}
	public getShowStyleConfigRef(configKey: string) {
		return this.baseContext.getShowStyleConfigRef(configKey)
	}

	/** IStudioContext */
	public getStudioMappings() {
		return this.baseContext.getStudioMappings()
	}

	/** IStudioConfigContext */
	public getStudioConfig() {
		return this.baseContext.getStudioConfig()
	}
	public getStudioConfigRef(configKey: string) {
		return this.baseContext.getStudioConfigRef(configKey)
	}

	/** NotesContext */
	public error(message: string) {
		return this.baseContext.error(message)
	}
	public warning(message: string) {
		return this.baseContext.warning(message)
	}
	public getNotes() {
		return this.baseContext.getNotes()
	}

	/** ICommonContext */
	public getHashId(originString: string, originIsNotUnique?: boolean) {
		return this.baseContext.getHashId(`${this.externalId}_${originString}`, originIsNotUnique)
	}
	public unhashId(hash: string) {
		return this.baseContext.unhashId(hash)
	}
}
