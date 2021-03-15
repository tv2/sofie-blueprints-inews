import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	NotesContext,
	PieceLifespan,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import {
	ActionSelectFullGrafik,
	CreateTimingGraphic,
	CueDefinitionGraphic,
	GetFullGraphicTemplateNameFromCue,
	GetInfiniteModeForGraphic,
	GetPilotGraphicContentViz,
	GetTagForFull,
	GetTagForFullNext,
	GraphicDisplayName,
	GraphicPilot,
	IsTargetingFull,
	IsTargetingOVL,
	IsTargetingTLF,
	IsTargetingWall,
	literal,
	TV2BlueprintConfig
} from 'tv2-common'
import {
	AdlibActionType,
	AdlibTags,
	GraphicEngine,
	SharedOutputLayers,
	SharedSourceLayers,
	TallyTags
} from 'tv2-constants'
import { CasparPilotGeneratorSettings, GetPilotGraphicContentCaspar } from '../caspar'
import { VizPilotGeneratorSettings } from '../viz'

export interface PilotGeneratorSettings {
	caspar: CasparPilotGeneratorSettings
	viz: VizPilotGeneratorSettings
}

export function CreatePilotGraphic(
	config: TV2BlueprintConfig,
	context: SegmentContext,
	pieces: IBlueprintPiece[],
	_adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	settings: PilotGeneratorSettings,
	adlib: boolean,
	adlibRank: number,
	externalSegmentId: string
) {
	if (
		parsedCue.graphic.vcpid === undefined ||
		parsedCue.graphic.vcpid === null ||
		parsedCue.graphic.vcpid.toString() === '' ||
		parsedCue.graphic.vcpid.toString().length === 0
	) {
		context.warning('No valid VCPID provided')
		return
	}

	const engine = parsedCue.target

	if (IsTargetingFull(engine)) {
		actions.push(
			CreatePilotAdLibAction(config, context, partId, parsedCue, engine, settings, adlib, adlibRank, externalSegmentId)
		)
	}

	if (!(IsTargetingOVL(engine) && adlib)) {
		pieces.push(
			CreateFullPiece(config, context, partId, parsedCue, engine, settings, adlib, adlibRank, externalSegmentId)
		)
	}

	if (IsTargetingFull(engine)) {
		pieces.push(
			CreateFullDataStore(config, context, settings, parsedCue, engine, partId, adlib, adlibRank, externalSegmentId)
		)
	}
}

function CreatePilotAdLibAction(
	config: TV2BlueprintConfig,
	context: NotesContext,
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	engine: GraphicEngine,
	settings: PilotGeneratorSettings,
	adlib: boolean,
	adlibRank: number,
	segmentExternalId: string
) {
	const name = GraphicDisplayName(config, parsedCue)
	const sourceLayerId = GetSourceLayer(engine)
	const outputLayerId = GetOutputLayer(engine)

	return literal<IBlueprintActionManifest>({
		actionId: AdlibActionType.SELECT_FULL_GRAFIK,
		userData: literal<ActionSelectFullGrafik>({
			type: AdlibActionType.SELECT_FULL_GRAFIK,
			name: parsedCue.graphic.name,
			vcpid: parsedCue.graphic.vcpid,
			segmentExternalId
		}),
		userDataManifest: {},
		display: {
			_rank: adlibRank,
			label: GetFullGraphicTemplateNameFromCue(config, parsedCue),
			sourceLayerId: SharedSourceLayers.PgmPilot,
			outputLayerId: SharedOutputLayers.PGM,
			content: {
				...CreateFullContent(config, context, settings, parsedCue, engine, partId, adlib, adlibRank),
				timelineObjects: []
			},
			uniquenessId: `gfx_${name}_${sourceLayerId}_${outputLayerId}`,
			tags: [
				AdlibTags.ADLIB_KOMMENTATOR,
				...(config.showStyle.MakeAdlibsForFulls && IsTargetingFull(engine) ? [AdlibTags.ADLIB_FLOW_PRODUCER] : [])
			],
			currentPieceTags: [GetTagForFull(segmentExternalId, parsedCue.graphic.vcpid)],
			nextPieceTags: [GetTagForFullNext(segmentExternalId, parsedCue.graphic.vcpid)]
		}
	})
}

export function CreateFullPiece(
	config: TV2BlueprintConfig,
	context: NotesContext,
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	engine: GraphicEngine,
	settings: PilotGeneratorSettings,
	adlib: boolean,
	adlibRank: number,
	segmentExternalId: string
): IBlueprintPiece {
	return literal<IBlueprintPiece>({
		externalId: partId,
		name: GraphicDisplayName(config, parsedCue),
		...(IsTargetingFull(engine) || IsTargetingWall(engine)
			? { enable: { start: 0 } }
			: {
					enable: {
						...CreateTimingGraphic(config, parsedCue)
					}
			  }),
		outputLayerId: GetOutputLayer(engine),
		sourceLayerId: GetSourceLayer(engine),
		adlibPreroll: config.studio.VizPilotGraphics.PrerollDuration,
		lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue),
		content: CreateFullContent(config, context, settings, parsedCue, engine, partId, adlib, adlibRank),
		tags: [GetTagForFull(segmentExternalId, parsedCue.graphic.vcpid), TallyTags.FULL_IS_LIVE]
	})
}

export function CreateFullDataStore(
	config: TV2BlueprintConfig,
	context: NotesContext,
	settings: PilotGeneratorSettings,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	engine: GraphicEngine,
	partId: string,
	adlib: boolean,
	adlibRank: number,
	segmentExternalId: string
): IBlueprintPiece {
	return literal<IBlueprintPiece>({
		externalId: partId,
		name: GraphicDisplayName(config, parsedCue),
		enable: {
			start: 0
		},
		outputLayerId: SharedOutputLayers.SELECTED_ADLIB,
		sourceLayerId: SharedSourceLayers.SelectedAdlibGraphicsFull,
		lifespan: PieceLifespan.OutOnSegmentEnd,
		metaData: {
			userData: literal<ActionSelectFullGrafik>({
				type: AdlibActionType.SELECT_FULL_GRAFIK,
				name: parsedCue.graphic.name,
				vcpid: parsedCue.graphic.vcpid,
				segmentExternalId
			})
		},
		content: {
			...CreateFullContent(config, context, settings, parsedCue, engine, partId, adlib, adlibRank)
		},
		tags: [GetTagForFullNext(segmentExternalId, parsedCue.graphic.vcpid)]
	})
}

function CreateFullContent(
	config: TV2BlueprintConfig,
	context: NotesContext,
	settings: PilotGeneratorSettings,
	cue: CueDefinitionGraphic<GraphicPilot>,
	engine: GraphicEngine,
	partId: string,
	adlib: boolean,
	adlibRank: number
): GraphicsContent {
	if (config.studio.GraphicsType === 'HTML') {
		return GetPilotGraphicContentCaspar(config, context, cue, settings.caspar, engine)
	} else {
		return GetPilotGraphicContentViz(config, context, settings.viz, cue, engine, partId, adlib, adlibRank)
	}
}

function GetSourceLayer(engine: GraphicEngine): SharedSourceLayers {
	return IsTargetingWall(engine)
		? SharedSourceLayers.WallGraphics
		: IsTargetingTLF(engine)
		? SharedSourceLayers.PgmGraphicsTLF
		: IsTargetingOVL(engine)
		? SharedSourceLayers.PgmPilotOverlay
		: SharedSourceLayers.PgmPilot
}

function GetOutputLayer(engine: GraphicEngine) {
	return IsTargetingWall(engine)
		? SharedOutputLayers.SEC
		: IsTargetingOVL(engine)
		? SharedOutputLayers.OVERLAY
		: IsTargetingFull(engine)
		? SharedOutputLayers.PGM
		: SharedOutputLayers.OVERLAY
}
