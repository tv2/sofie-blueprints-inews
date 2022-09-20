import {
	BlueprintResultPart,
	BlueprintResultSegment,
	IBlueprintSegment,
	IngestSegment,
	IShowStyleUserContext
} from '@tv2media/blueprints-integration'
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
	PartMetaData
} from 'tv2-common'
import { CueType, PartType, SharedSourceLayers, TallyTags } from 'tv2-constants'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from './blueprintConfig'
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

export interface GetSegmentShowstyleOptions<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
> {
	getConfig: (context: IShowStyleUserContext) => ShowStyleConfig
	CreatePartContinuity: (config: ShowStyleConfig, ingestSegment: IngestSegment) => BlueprintResultPart
	CreatePartUnknown: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		partDefinition: PartDefinition,
		totalWords: number,
		asAdlibs?: boolean
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartIntro?: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		partDefinition: PartDefinition,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartKam?: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionKam,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartServer?: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		partDefinition: PartDefinition,
		partProps: ServerPartProps
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartTeknik?: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionTeknik,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartGrafik?: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionGrafik,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartEkstern?: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionEkstern,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartTelefon?: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionTelefon,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartDVE?: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionDVE,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
	CreatePartEVS?: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionEVS,
		totalWords: number
	) => BlueprintResultPart | Promise<BlueprintResultPart>
}

export async function getSegmentBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: IShowStyleUserContext,
	ingestSegment: IngestSegment,
	showStyleOptions: GetSegmentShowstyleOptions<StudioConfig, ShowStyleConfig>
): Promise<BlueprintResultSegment> {
	const segmentPayload = ingestSegment.payload as INewsPayload | undefined
	const iNewsStory = segmentPayload?.iNewsStory
	const segment: IBlueprintSegment = {
		name: ingestSegment.name || '',
		metaData: {},
		showShelf: false,
		identifier:
			iNewsStory && iNewsStory.fields.pageNumber && iNewsStory.fields.pageNumber.trim()
				? iNewsStory.fields.pageNumber.trim()
				: undefined
	}
	const config = showStyleOptions.getConfig(context)

	if (!segmentPayload || !iNewsStory || iNewsStory.meta.float === 'float' || !iNewsStory.body) {
		segment.isHidden = true
		return {
			segment,
			parts: []
		}
	} else {
		segment.isHidden = false
	}

	const totalTimeMs = TimeFromINewsField(iNewsStory.fields.totalTime) * 1000
	let blueprintParts: BlueprintResultPart[] = []
	const parsedParts: PartDefinition[] = ParseBody(
		config,
		ingestSegment.externalId,
		ingestSegment.name,
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
		blueprintParts.push(showStyleOptions.CreatePartContinuity(config, ingestSegment))
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
			part.cues.filter(cue => cue.type === CueType.Jingle || cue.type === CueType.AdLib).length === 0
		) {
			blueprintParts.push(await showStyleOptions.CreatePartUnknown(context, config, part, totalWords, true))
			continue
		}

		const unpairedTargets = part.cues.filter(
			c => c.type === CueType.UNPAIRED_TARGET && IsTargetingFull(c.target)
		) as CueDefinitionUnpairedTarget[]
		if (unpairedTargets.length) {
			blueprintParts.push(CreatePartInvalid(part))
			unpairedTargets.forEach(cue => {
				context.notifyUserWarning(`No graphic found after ${cue.iNewsCommand} cue`)
			})
			continue
		}

		switch (part.type) {
			case PartType.INTRO:
				if (showStyleOptions.CreatePartIntro) {
					blueprintParts.push(await showStyleOptions.CreatePartIntro(context, config, part, totalWords))
				}
				break
			case PartType.Kam:
				if (showStyleOptions.CreatePartKam) {
					blueprintParts.push(await showStyleOptions.CreatePartKam(context, config, part, totalWords))
				}
				break
			case PartType.Server:
				if (showStyleOptions.CreatePartServer) {
					blueprintParts.push(
						await showStyleOptions.CreatePartServer(context, config, part, {
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
					blueprintParts.push(await showStyleOptions.CreatePartTeknik(context, config, part, totalWords))
				}
				break
			case PartType.Grafik:
				if (showStyleOptions.CreatePartGrafik) {
					blueprintParts.push(await showStyleOptions.CreatePartGrafik(context, config, part, totalWords))
				}
				break
			case PartType.VO:
				if (showStyleOptions.CreatePartServer) {
					blueprintParts.push(
						await showStyleOptions.CreatePartServer(context, config, part, {
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
					blueprintParts.push(await showStyleOptions.CreatePartDVE(context, config, part, totalWords))
				}
				break
			case PartType.REMOTE:
				if (showStyleOptions.CreatePartEkstern) {
					blueprintParts.push(await showStyleOptions.CreatePartEkstern(context, config, part, totalWords))
				}
				break
			case PartType.Telefon:
				if (showStyleOptions.CreatePartTelefon) {
					blueprintParts.push(await showStyleOptions.CreatePartTelefon(context, config, part, totalWords))
				}
				break
			case PartType.Unknown:
				if (part.cues.length) {
					blueprintParts.push(await showStyleOptions.CreatePartUnknown(context, config, part, totalWords))
				}
				break
			case PartType.EVS:
				if (showStyleOptions.CreatePartEVS) {
					blueprintParts.push(await showStyleOptions.CreatePartEVS(context, config, part, totalWords))
				}
				break
			default:
				assertUnreachable(part)
				break
		}

		if (part.cues.filter(cue => cue.type === CueType.Jingle).length) {
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

	blueprintParts.forEach(part => {
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

	blueprintParts.forEach(part => {
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

	if (
		blueprintParts.filter(part => part.pieces.length === 0 && (part.adLibPieces.length || part.actions?.length))
			.length === blueprintParts.length
	) {
		segment.isHidden = true
		if (blueprintParts.length > 0) {
			segment.showShelf = true
		}
	}

	if (blueprintParts.find(part => part.adLibPieces.length || part.actions?.length)) {
		segment.showShelf = true
	}

	if (
		// Filter out Jingle-only parts
		blueprintParts.length > 1 ||
		(blueprintParts[blueprintParts.length - 1] &&
			!blueprintParts[blueprintParts.length - 1].pieces.some(
				piece => piece.sourceLayerId === SharedSourceLayers.PgmJingle
			))
	) {
		blueprintParts[0].part.budgetDuration = totalTimeMs
	}

	if (blueprintParts.every(part => part.part.invalid) && iNewsStory.cues.length === 0) {
		segment.isHidden = true
	}

	blueprintParts.forEach(part => {
		if (
			part.part.expectedDuration! < config.studio.DefaultPartDuration &&
			// Jingle-only part, do not modify duration
			!part.pieces.some(
				p => p.sourceLayerId === SharedSourceLayers.PgmJingle && p.tags?.some(tag => TallyTags.JINGLE === tag)
			)
		) {
			part.part.expectedDuration = config.studio.DefaultPartDuration
		}
	})

	blueprintParts = blueprintParts.map(part => {
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

	return {
		segment,
		parts: blueprintParts
	}
}
