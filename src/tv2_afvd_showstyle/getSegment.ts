import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineObjAtemAny,
	TimelineObjAtemME
} from 'timeline-state-resolver-types'
import {
	BlueprintResultPart,
	BlueprintResultSegment,
	CameraContent,
	IBlueprintPiece,
	IBlueprintRundownDB,
	IBlueprintSegment,
	IngestSegment,
	PartContext,
	PieceLifespan,
	ScriptContent,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { assertUnreachable, literal } from '../common/util'
import { AtemLLayer } from '../tv2_afvd_studio/layers'
import { BlueprintConfig, parseConfig } from './helpers/config'
import { GetNextPartCue } from './helpers/nextPartCue'
import { ParseBody, PartDefinition, PartDefinitionSlutord, PartType } from './inewsConversion/converters/ParseBody'
import { CueType } from './inewsConversion/converters/ParseCue'
import { SourceLayer } from './layers'
import { CreatePartEVS } from './parts/evs'
import { CreatePartGrafik } from './parts/grafik'
import { CreatePartIntro } from './parts/intro'
import { CreatePartInvalid } from './parts/invalid'
import { CreatePartKam } from './parts/kam'
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
	} else {
		segment.isHidden = false
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
		return prev + cur.script.replace(/\n/g, '').replace(/\r/g, '').length
	}, 0)

	if (segment.name.trim().match(/^CONTINUITY$/i)) {
		blueprintParts.push(CreatePartContinuity(config, ingestSegment))
		return {
			segment,
			parts: blueprintParts
		}
	}

	let serverParts = 0
	let jingleTime = 0
	let serverTime = 0
	for (let i = 0; i < parsedParts.length; i++) {
		const part = parsedParts[i]
		const partContext = new PartContext2(context, part.externalId)

		if (
			GetNextPartCue(part, -1) === -1 &&
			part.type === PartType.Unknown &&
			part.cues.filter(cue => cue.type === CueType.Jingle || cue.type === CueType.AdLib).length === 0
		) {
			blueprintParts.push(CreatePartUnknown(partContext, config, part, totalWords, true))
			continue
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
			case PartType.Teknik:
				blueprintParts.push(CreatePartTeknik(partContext, config, part, totalWords))
				break
			case PartType.Grafik:
				blueprintParts.push(CreatePartGrafik(partContext, config, part, totalWords))
				break
			case PartType.VO:
				blueprintParts.push(
					CreatePartVO(partContext, config, part, totalWords, Number(ingestSegment.payload.iNewsStory.fields.audioTime))
				)
				break
			case PartType.Unknown:
				if (part.cues.length) {
					blueprintParts.push(CreatePartUnknown(partContext, config, part, totalWords))
				}
				break
			case PartType.Slutord:
				blueprintParts.push(CreatePartInvalid(part))
				context.warning('Slutord should have been moved to script, something may have gone wrong')
				break
			case PartType.EVS:
				blueprintParts.push(CreatePartEVS(partContext, config, part, totalWords))
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
		if (blueprintParts[blueprintParts.length - 1] && blueprintParts[blueprintParts.length - 1].pieces.length === 1) {
			const p = blueprintParts[blueprintParts.length - 1].pieces[0]
			if (p.sourceLayerId === SourceLayer.PgmScript) {
				blueprintParts[blueprintParts.length - 1].part.autoNext = true
				blueprintParts[blueprintParts.length - 1].part.expectedDuration = 1000
			}
		}

		if (
			part.type === PartType.Server ||
			(part.type === PartType.VO && (Number(part.fields.tapeTime) > 0 || part.script.length))
		) {
			serverTime += Number(blueprintParts[blueprintParts.length - 1].part.expectedDuration)
			serverParts++
		}

		if (part.cues.filter(cue => cue.type === CueType.Jingle)) {
			const t = blueprintParts[blueprintParts.length - 1].part.expectedDuration
			if (t) {
				jingleTime += t
			}
		}
	}

	let allocatedTime =
		blueprintParts.reduce((prev, cur) => {
			return prev + (cur.part.expectedDuration ? cur.part.expectedDuration : 0)
		}, 0) - jingleTime

	if (allocatedTime < 0) {
		allocatedTime = 0
	}

	let extraTime = 0 // The part at the end gets the extra time so display duration works correctly
	blueprintParts.forEach(part => {
		part.part.displayDurationGroup = ingestSegment.externalId
		if (!part.part.expectedDuration) {
			part.part.expectedDuration =
				(Number(ingestSegment.payload.iNewsStory.fields.totalTime) * 1000 - allocatedTime - serverTime || 0) /
				(blueprintParts.length - serverParts)
			part.part.displayDuration =
				(Number(ingestSegment.payload.iNewsStory.fields.totalTime) * 1000 - allocatedTime - serverTime || 0) /
				(blueprintParts.length - serverParts)
			if (
				!!part.part.title.match(/(?:kam|cam)(?:era)? ?.*/i) &&
				part.part.expectedDuration > config.studio.MaximumKamDisplayDuration
			) {
				extraTime += part.part.expectedDuration - config.studio.MaximumKamDisplayDuration
				part.part.displayDuration = config.studio.MaximumKamDisplayDuration
			}
		}
	})

	if (extraTime > 0) {
		blueprintParts[blueprintParts.length - 1].part.displayDuration =
			Number(blueprintParts[blueprintParts.length - 1].part.displayDuration) + extraTime
	}

	if (
		blueprintParts.filter(part => part.pieces.length === 0 && part.adLibPieces.length).length === blueprintParts.length
	) {
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

export function CreatePartContinuity(config: BlueprintConfig, ingestSegment: IngestSegment) {
	return literal<BlueprintResultPart>({
		part: {
			externalId: `${ingestSegment.externalId}-CONTINUITY`,
			title: 'CONTINUITY',
			typeVariant: ''
		},
		pieces: [
			literal<IBlueprintPiece>({
				_id: '',
				externalId: `${ingestSegment.externalId}-CONTINUITY`,
				enable: {
					start: 0
				},
				name: 'CONTINUITY',
				sourceLayerId: SourceLayer.PgmContinuity,
				outputLayerId: 'pgm',
				infiniteMode: PieceLifespan.OutOnNextSegment,
				content: literal<CameraContent>({
					studioLabel: '',
					switcherInput: config.studio.AtemSource.Continuity,
					timelineObjects: _.compact<TimelineObjAtemAny>([
						literal<TimelineObjAtemME>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									input: config.studio.AtemSource.Continuity,
									transition: AtemTransitionStyle.CUT
								}
							}
						})
					])
				})
			})
		],
		adLibPieces: []
	})
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
