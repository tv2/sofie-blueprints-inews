import { BlueprintResultPart, BlueprintResultSegment, IBlueprintSegment, IngestSegment } from 'blueprints-integration'
import {
	assertUnreachable,
	GetNextPartCue,
	INewsPayload,
	IsTargetingFull,
	literal,
	ParseBody,
	PartDefinition,
	PartDefinitionEVS,
	PartDefinitionKam,
	PartMetaData,
	SegmentContext,
	ShowStyleContext
} from 'tv2-common'
import { AdlibActionType, CueType, PartType, SharedSourceLayer, TallyTags } from 'tv2-constants'
import { TV2ShowStyleConfig } from './blueprintConfig'
import {
	CueDefinitionUnpairedTarget,
	PartDefinitionDVE,
	PartDefinitionEkstern,
	PartDefinitionGrafik,
	PartDefinitionTeknik,
	PartDefinitionTelefon,
	TimeFromINewsField
} from './inewsConversion'
import { CreatePartInvalid, ServerPartProps } from './parts'
import { Invalidity } from './types/invalidity'

export interface GetSegmentShowstyleOptions<ShowStyleConfig extends TV2ShowStyleConfig> {
	CreatePartContinuity: (
		context: ShowStyleContext<ShowStyleConfig>,
		ingestSegment: IngestSegment
	) => BlueprintResultPart
	CreatePartUnknown: (
		context: ShowStyleContext<ShowStyleConfig>,
		partDefinition: PartDefinition,
		totalWords: number,
		asAdlibs?: boolean
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartIntro?: (
		context: ShowStyleContext<ShowStyleConfig>,
		partDefinition: PartDefinition,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartKam?: (
		context: ShowStyleContext<ShowStyleConfig>,
		partDefinition: PartDefinitionKam,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartServer?: (
		context: ShowStyleContext<ShowStyleConfig>,
		partDefinition: PartDefinition,
		partProps: ServerPartProps
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartTeknik?: (
		context: ShowStyleContext<ShowStyleConfig>,
		partDefinition: PartDefinitionTeknik,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartGrafik?: (
		context: ShowStyleContext<ShowStyleConfig>,
		partDefinition: PartDefinitionGrafik,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartEkstern?: (
		context: ShowStyleContext<ShowStyleConfig>,
		partDefinition: PartDefinitionEkstern,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartTelefon?: (
		context: ShowStyleContext<ShowStyleConfig>,
		partDefinition: PartDefinitionTelefon,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartDVE?: (
		context: ShowStyleContext<ShowStyleConfig>,
		partDefinition: PartDefinitionDVE,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartEVS?: (
		context: ShowStyleContext<ShowStyleConfig>,
		partDefinition: PartDefinitionEVS,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
}

interface Segment<T> extends IBlueprintSegment<T> {
	invalidity?: Invalidity
	definesShowStyleVariant?: boolean
}

interface SegmentMetadata {
	miniShelfVideoClipFile?: string
}

const SHOW_STYLE_VARIANT_LOWER_CASE_CUE: string = 'sofie=showstylevariant'

export async function getSegmentBase<ShowStyleConfig extends TV2ShowStyleConfig>(
	context: SegmentContext<ShowStyleConfig>,
	ingestSegment: IngestSegment,
	showStyleOptions: GetSegmentShowstyleOptions<ShowStyleConfig>
): Promise<BlueprintResultSegment> {
	const { config } = context

	const segmentPayload = ingestSegment.payload as INewsPayload | undefined
	const iNewsStory = segmentPayload?.iNewsStory
	const segment: Segment<SegmentMetadata> = {
		name: ingestSegment.name || '',
		metaData: {},
		showShelf: false,
		identifier:
			iNewsStory && iNewsStory.fields.pageNumber && iNewsStory.fields.pageNumber.trim()
				? iNewsStory.fields.pageNumber.trim()
				: undefined
	}

	if (!segmentPayload || !iNewsStory || iNewsStory.meta.float === 'float' || !iNewsStory.body) {
		segment.isHidden = true
		return {
			segment,
			parts: []
		}
	} else {
		segment.isHidden = false
	}

	segment.definesShowStyleVariant = iNewsStory.cues.some((cue) =>
		cue?.some((cueElement) => cueElement.toLowerCase().includes(SHOW_STYLE_VARIANT_LOWER_CASE_CUE))
	)

	const totalTimeMs = TimeFromINewsField(iNewsStory.fields.totalTime) * 1000
	let blueprintParts: BlueprintResultPart[] = []
	const parsedParts: PartDefinition[] = ParseBody(
		config,
		ingestSegment.externalId,
		ingestSegment.name,
		ingestSegment.rank,
		iNewsStory.body,
		iNewsStory.cues,
		iNewsStory.fields,
		TimeFromINewsField(iNewsStory.fields.modifyDate) || Date.now()
	)

	const totalWords = parsedParts.reduce((prev, cur) => {
		if (cur.type === PartType.Server) {
			return prev
		}
		return prev + cur.script.replace(/\n/g, '').replace(/\r/g, '').length
	}, 0)

	if (segment.name && segment.name.trim().match(/^\s*continuity\s*$/i)) {
		blueprintParts.push(showStyleOptions.CreatePartContinuity(context, ingestSegment))
		return {
			segment,
			parts: blueprintParts
		}
	}

	let jingleTime = 0
	const totalTime = TimeFromINewsField(iNewsStory.fields.totalTime)
	const tapeTime = TimeFromINewsField(iNewsStory.fields.tapeTime)

	for (const part of parsedParts) {
		// Make orphaned secondary cues into adlibs
		if (
			GetNextPartCue(part, -1) === -1 &&
			part.type === PartType.Unknown &&
			part.cues.filter((cue) => cue.type === CueType.Jingle || cue.type === CueType.AdLib).length === 0
		) {
			blueprintParts.push(await showStyleOptions.CreatePartUnknown(context, part, totalWords, true))
			continue
		}

		const unpairedTargets = part.cues.filter(
			(c) => c.type === CueType.UNPAIRED_TARGET && IsTargetingFull(c.target)
		) as CueDefinitionUnpairedTarget[]
		if (unpairedTargets.length) {
			blueprintParts.push(
				CreatePartInvalid(part, {
					reason: `The part has one or more unpaired targets: ${unpairedTargets
						.map((cue) => cue.iNewsCommand)
						.join(', ')}`
				})
			)
			unpairedTargets.forEach((cue) => {
				context.core.notifyUserWarning(`No graphic found after ${cue.iNewsCommand} cue`)
			})
			continue
		}

		switch (part.type) {
			case PartType.INTRO:
				if (showStyleOptions.CreatePartIntro) {
					blueprintParts.push(await showStyleOptions.CreatePartIntro(context, part, totalWords))
				}
				break
			case PartType.Kam:
				if (showStyleOptions.CreatePartKam) {
					blueprintParts.push(await showStyleOptions.CreatePartKam(context, part, totalWords))
				}
				break
			case PartType.Server:
				if (showStyleOptions.CreatePartServer) {
					blueprintParts.push(
						await showStyleOptions.CreatePartServer(context, part, {
							voLayer: false,
							voLevels: false,
							totalTime,
							totalWords,
							tapeTime,
							adLibPix: false
						})
					)
				}
				break
			case PartType.Teknik:
				if (showStyleOptions.CreatePartTeknik) {
					blueprintParts.push(await showStyleOptions.CreatePartTeknik(context, part, totalWords))
				}
				break
			case PartType.Grafik:
				if (showStyleOptions.CreatePartGrafik) {
					blueprintParts.push(await showStyleOptions.CreatePartGrafik(context, part, totalWords))
				}
				break
			case PartType.VO:
				if (showStyleOptions.CreatePartServer) {
					blueprintParts.push(
						await showStyleOptions.CreatePartServer(context, part, {
							voLayer: true,
							voLevels: true,
							totalTime,
							totalWords,
							tapeTime,
							adLibPix: false
						})
					)
				}
				break
			case PartType.DVE:
				if (showStyleOptions.CreatePartDVE) {
					blueprintParts.push(await showStyleOptions.CreatePartDVE(context, part, totalWords))
				}
				break
			case PartType.REMOTE:
				if (showStyleOptions.CreatePartEkstern) {
					blueprintParts.push(await showStyleOptions.CreatePartEkstern(context, part, totalWords))
				}
				break
			case PartType.Telefon:
				if (showStyleOptions.CreatePartTelefon) {
					blueprintParts.push(await showStyleOptions.CreatePartTelefon(context, part, totalWords))
				}
				break
			case PartType.Unknown:
				if (part.cues.length) {
					blueprintParts.push(await showStyleOptions.CreatePartUnknown(context, part, totalWords))
				}
				break
			case PartType.EVS:
				if (showStyleOptions.CreatePartEVS) {
					blueprintParts.push(await showStyleOptions.CreatePartEVS(context, part, totalWords))
				}
				break
			default:
				assertUnreachable(part)
				break
		}

		if (part.cues.filter((cue) => cue.type === CueType.Jingle).length) {
			if (blueprintParts[blueprintParts.length - 1]) {
				const t = blueprintParts[blueprintParts.length - 1].part.expectedDuration
				if (t) {
					jingleTime += t
				}
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

	const partsWithoutExpectedDuration = blueprintParts.reduce(
		(total, p) => (!p.part.expectedDuration ? total + 1 : total),
		0
	)

	blueprintParts.forEach((part) => {
		// part.part.displayDurationGroup = ingestSegment.externalId

		if (!part.part.expectedDuration && totalTimeMs > 0) {
			part.part.expectedDuration = (totalTimeMs - allocatedTime || 0) / partsWithoutExpectedDuration

			if (part.part.expectedDuration < 0) {
				part.part.expectedDuration = 0
			}

			if (part.part.expectedDuration > config.studio.MaximumPartDuration) {
				part.part.expectedDuration = config.studio.MaximumPartDuration
			}
		}
	})

	let extraTime = totalTimeMs

	blueprintParts.forEach((part) => {
		if (part.part.expectedDuration === undefined || part.part.expectedDuration < 0) {
			part.part.expectedDuration =
				extraTime > config.studio.DefaultPartDuration
					? extraTime > config.studio.MaximumPartDuration
						? config.studio.MaximumPartDuration
						: extraTime
					: config.studio.DefaultPartDuration
		}

		extraTime -= part.part.expectedDuration

		if (part.part.displayDuration && (part.part.displayDuration < 0 || isNaN(part.part.displayDuration))) {
			part.part.displayDuration = 0
		}
	})

	if (blueprintParts.every((part) => part.pieces.length === 0 && (part.adLibPieces.length || part.actions?.length))) {
		segment.isHidden = true
		if (blueprintParts.length > 0) {
			segment.showShelf = true
		}
	}

	if (blueprintParts.find((part) => part.adLibPieces.length || part.actions?.length)) {
		segment.showShelf = true
	}

	blueprintParts = blueprintParts.map((blueprintPart) => {
		blueprintPart.actions = blueprintPart.actions.map((action) => {
			if (action.actionId !== AdlibActionType.SELECT_SERVER_CLIP) {
				return action
			}
			segment.metaData!.miniShelfVideoClipFile = action.userData.file
			return action
		})
		return blueprintPart
	})

	if (
		// Filter out Jingle-only parts
		blueprintParts.length > 1 ||
		(blueprintParts[blueprintParts.length - 1] &&
			!blueprintParts[blueprintParts.length - 1].pieces.some(
				(piece) => piece.sourceLayerId === SharedSourceLayer.PgmJingle
			))
	) {
		blueprintParts[0].part.budgetDuration = totalTimeMs
		/*NOTE: Set budgetDuration to Segment to new sofie-server*/
		;(segment as any).budgetDuration = totalTimeMs
	}

	if (blueprintParts.every((part) => part.part.invalid) && iNewsStory.cues.length === 0) {
		segment.isHidden = true
	}

	blueprintParts.forEach((part) => {
		if (
			part.part.expectedDuration! < config.studio.DefaultPartDuration &&
			// Jingle-only part, do not modify duration
			!part.pieces.some(
				(p) => p.sourceLayerId === SharedSourceLayer.PgmJingle && p.tags?.some((tag) => TallyTags.JINGLE === tag)
			)
		) {
			part.part.expectedDuration = config.studio.DefaultPartDuration
		}
	})

	blueprintParts = blueprintParts.map((part) => {
		const actualPart = part.part
		actualPart.metaData = literal<PartMetaData>({
			...(actualPart.metaData as any),
			segmentExternalId: ingestSegment.externalId
		})

		if (actualPart.autoNext === undefined) {
			actualPart.autoNext = false
		}

		if (actualPart.invalid === undefined) {
			actualPart.invalid = false
		}

		if (segmentPayload?.untimed) {
			actualPart.untimed = true
		}

		return {
			...part,
			part: actualPart
		}
	})

	segment.invalidity = getSegmentInvalidity(segment, blueprintParts)

	return {
		segment,
		parts: blueprintParts
	}
}

function getSegmentInvalidity(segment: Segment<SegmentMetadata>, parts: BlueprintResultPart[]): Invalidity | undefined {
	const doesSegmentHaveMiniShelf: boolean = !!segment.metaData?.miniShelfVideoClipFile
	const doesSegmentHaveValidParts: boolean = parts.length > 0 && parts.some((part) => part.pieces.length > 0)
	if (doesSegmentHaveMiniShelf && doesSegmentHaveValidParts) {
		return {
			reason: 'MiniShelf Segments are not allowed to also have Parts.'
		}
	}
	return undefined
}
