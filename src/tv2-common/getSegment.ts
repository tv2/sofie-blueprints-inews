import {
	BlueprintResultPart,
	BlueprintResultSegment,
	IBlueprintPart,
	IBlueprintSegment,
	IngestSegment,
	SegmentContext,
	ShowStyleContext
} from 'tv-automation-sofie-blueprints-integration'
import {
	assertUnreachable,
	GetNextPartCue,
	IsTargetingFull,
	literal,
	ParseBody,
	PartContext2,
	PartDefinition,
	PartDefinitionEVS,
	PartDefinitionKam,
	PartMetaData
} from 'tv2-common'
import { CueType, PartType } from 'tv2-constants'
import * as _ from 'underscore'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from './blueprintConfig'
import {
	CueDefinitionUnpairedTarget,
	INewsStory,
	PartDefinitionDVE,
	PartDefinitionEkstern,
	PartDefinitionGrafik,
	PartDefinitionServer,
	PartDefinitionTeknik,
	PartDefinitionTelefon,
	PartDefinitionVO
} from './inewsConversion'
import { CreatePartInvalid } from './parts'

export interface GetSegmentShowstyleOptions<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
> {
	getConfig: (context: ShowStyleContext) => ShowStyleConfig
	CreatePartContinuity: (config: ShowStyleConfig, ingestSegment: IngestSegment) => BlueprintResultPart
	CreatePartUnknown: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinition,
		totalWords: number,
		asAdlibs?: boolean
	) => BlueprintResultPart
	CreatePartIntro?: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinition,
		totalWords: number
	) => BlueprintResultPart
	CreatePartKam?: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionKam,
		totalWords: number
	) => BlueprintResultPart
	CreatePartServer?: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionServer,
		mediaPlayerSession: string
	) => BlueprintResultPart
	CreatePartTeknik?: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionTeknik,
		totalWords: number
	) => BlueprintResultPart
	CreatePartGrafik?: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionGrafik,
		totalWords: number
	) => BlueprintResultPart
	CreatePartVO?: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionVO,
		mediaPlayerSession: string,
		totalWords: number,
		totalTime: number
	) => BlueprintResultPart
	CreatePartEkstern?: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionEkstern,
		totalWords: number
	) => BlueprintResultPart
	CreatePartTelefon?: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionTelefon,
		totalWords: number
	) => BlueprintResultPart
	CreatePartDVE?: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionDVE,
		totalWords: number
	) => BlueprintResultPart
	CreatePartEVS?: (
		context: PartContext2,
		config: ShowStyleConfig,
		partDefinition: PartDefinitionEVS,
		totalWords: number
	) => BlueprintResultPart
}

export function getSegmentBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: SegmentContext,
	ingestSegment: IngestSegment,
	showStyleOptions: GetSegmentShowstyleOptions<StudioConfig, ShowStyleConfig>
): BlueprintResultSegment {
	const iNewsStory: INewsStory | undefined = ingestSegment.payload?.iNewsStory
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {},
		identifier:
			iNewsStory && iNewsStory.fields.pageNumber && iNewsStory.fields.pageNumber.trim()
				? iNewsStory.fields.pageNumber.trim()
				: undefined
	})
	const config = showStyleOptions.getConfig(context)

	if (!iNewsStory || iNewsStory.meta.float === 'float' || !iNewsStory.body) {
		segment.isHidden = true
		return {
			segment,
			parts: []
		}
	} else {
		segment.isHidden = false
	}

	let blueprintParts: BlueprintResultPart[] = []
	const parsedParts = ParseBody(
		config,
		ingestSegment.externalId,
		ingestSegment.name,
		iNewsStory.body,
		iNewsStory.cues,
		iNewsStory.fields,
		Number(iNewsStory.fields.modifyDate) || Date.now()
	)

	const totalWords = parsedParts.reduce((prev, cur) => {
		if (cur.type === PartType.Server) {
			return prev
		}
		return prev + cur.script.replace(/\n/g, '').replace(/\r/g, '').length
	}, 0)

	if (segment.name.trim().match(/^CONTINUITY$/i)) {
		blueprintParts.push(showStyleOptions.CreatePartContinuity(config, ingestSegment))
		return {
			segment,
			parts: blueprintParts
		}
	}

	let serverParts = 0
	let jingleTime = 0
	let serverTime = 0
	for (const part of parsedParts) {
		// Apply showstyle-specific transformations of cues.
		// const part = TransformCuesIntoShowstyle(config, par) // TODO
		const partContext = new PartContext2(context, part.externalId)

		// Make orphaned secondary cues into adlibs
		if (
			GetNextPartCue(part, -1) === -1 &&
			part.type === PartType.Unknown &&
			part.cues.filter(cue => cue.type === CueType.Jingle || cue.type === CueType.AdLib).length === 0
		) {
			blueprintParts.push(showStyleOptions.CreatePartUnknown(partContext, config, part, totalWords, true))
			continue
		}

		const unpairedTargets = part.cues.filter(
			c => c.type === CueType.UNPAIRED_TARGET && IsTargetingFull(c.target)
		) as CueDefinitionUnpairedTarget[]
		if (unpairedTargets.length) {
			blueprintParts.push(CreatePartInvalid(part))
			unpairedTargets.forEach(cue => {
				context.warning(`No graphic found after ${cue.iNewsCommand} cue`)
			})
			continue
		}

		switch (part.type) {
			case PartType.INTRO:
				if (showStyleOptions.CreatePartIntro) {
					blueprintParts.push(showStyleOptions.CreatePartIntro(partContext, config, part, totalWords))
				}
				break
			case PartType.Kam:
				if (showStyleOptions.CreatePartKam) {
					blueprintParts.push(showStyleOptions.CreatePartKam(partContext, config, part, totalWords))
				}
				break
			case PartType.Server:
				if (showStyleOptions.CreatePartServer) {
					blueprintParts.push(showStyleOptions.CreatePartServer(partContext, config, part, ingestSegment.externalId))
				}
				break
			case PartType.Teknik:
				if (showStyleOptions.CreatePartTeknik) {
					blueprintParts.push(showStyleOptions.CreatePartTeknik(partContext, config, part, totalWords))
				}
				break
			case PartType.Grafik:
				if (showStyleOptions.CreatePartGrafik) {
					blueprintParts.push(showStyleOptions.CreatePartGrafik(partContext, config, part, totalWords))
				}
				break
			case PartType.VO:
				if (showStyleOptions.CreatePartVO) {
					blueprintParts.push(
						showStyleOptions.CreatePartVO(
							partContext,
							config,
							part,
							ingestSegment.externalId,
							totalWords,
							Number(iNewsStory.fields.totalTime) || 0
						)
					)
				}
				break
			case PartType.DVE:
				if (showStyleOptions.CreatePartDVE) {
					blueprintParts.push(showStyleOptions.CreatePartDVE(partContext, config, part, totalWords))
				}
				break
			case PartType.Ekstern:
				if (showStyleOptions.CreatePartEkstern) {
					blueprintParts.push(showStyleOptions.CreatePartEkstern(partContext, config, part, totalWords))
				}
				break
			case PartType.Telefon:
				if (showStyleOptions.CreatePartTelefon) {
					blueprintParts.push(showStyleOptions.CreatePartTelefon(partContext, config, part, totalWords))
				}
				break
			case PartType.Unknown:
				if (part.cues.length) {
					blueprintParts.push(showStyleOptions.CreatePartUnknown(partContext, config, part, totalWords))
				}
				break
			case PartType.EVS:
				if (showStyleOptions.CreatePartEVS) {
					blueprintParts.push(showStyleOptions.CreatePartEVS(partContext, config, part, totalWords))
				}
				break
			default:
				assertUnreachable(part)
				break
		}

		if (
			part.type === PartType.Server ||
			(part.type === PartType.VO && (Number(part.fields.tapeTime) > 0 || part.script.length))
		) {
			if (blueprintParts[blueprintParts.length - 1]) {
				serverTime += Number(blueprintParts[blueprintParts.length - 1].part.expectedDuration)
				serverParts++
			}
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

	blueprintParts.forEach(part => {
		part.part.displayDurationGroup = ingestSegment.externalId
		if (!part.part.expectedDuration && Number(iNewsStory.fields.totalTime) > 0) {
			part.part.expectedDuration =
				(Number(iNewsStory.fields.totalTime) * 1000 - allocatedTime - serverTime || 0) /
				(blueprintParts.length - serverParts)

			if (part.part.expectedDuration! < 0) {
				part.part.expectedDuration = 0
			}

			if (part.part.expectedDuration! > config.studio.MaximumPartDuration) {
				part.part.expectedDuration = config.studio.MaximumPartDuration
			}
		}
	})

	let extraTime = Number(iNewsStory.fields.totalTime) * 1000

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
	}

	if (
		extraTime > 0 &&
		// Filter out Jingle-only parts
		(blueprintParts.length !== 1 ||
			(blueprintParts[blueprintParts.length - 1] &&
				!blueprintParts[blueprintParts.length - 1].pieces.some(piece => piece.sourceLayerId === 'studio0_jingle')))
	) {
		const gapPart = literal<BlueprintResultPart>({
			part: literal<IBlueprintPart>({
				externalId: `${ingestSegment.externalId}-GAP`,
				title: `Adlib Gap`,
				metaData: {},
				gap: true,
				invalid: true,
				expectedDuration: extraTime,
				displayDurationGroup: ingestSegment.externalId
			}),
			pieces: [],
			adLibPieces: []
		})
		blueprintParts.push(gapPart)
	}

	if (
		blueprintParts.filter(part => part.part.invalid === true).length === blueprintParts.length &&
		iNewsStory.cues.length === 0
	) {
		segment.isHidden = true
	}

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
