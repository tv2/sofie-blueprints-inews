import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	TSR,
	WithTimeline
} from '@tv2media/blueprints-integration'
import {
	ActionSelectFullGrafik,
	CreateTimingGraphic,
	CueDefinitionGraphic,
	generateExternalId,
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
	PieceMetaData,
	SisyfosPersistMetaData,
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
import { t } from '../../translation'
import { CasparPilotGeneratorSettings, GetPilotGraphicContentCaspar } from '../caspar'
import { VizPilotGeneratorSettings } from '../viz'

// Work needed, this should be more generic than expecting showstyles to define how to display pilot graphics
export interface PilotGeneratorSettings {
	caspar: CasparPilotGeneratorSettings
	viz: VizPilotGeneratorSettings
}

export interface PilotGraphicProps {
	config: TV2BlueprintConfig
	context: IShowStyleUserContext
	engine: GraphicEngine
	partId: string
	parsedCue: CueDefinitionGraphic<GraphicPilot>
	settings: PilotGeneratorSettings
	adlib: boolean
	segmentExternalId: string
	adlibRank?: number
	prerollDuration?: number
}

export function CreatePilotGraphic(
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	pilotGraphicProps: PilotGraphicProps
) {
	const { context, engine, adlib, parsedCue } = pilotGraphicProps
	if (
		parsedCue.graphic.vcpid === undefined ||
		parsedCue.graphic.vcpid === null ||
		parsedCue.graphic.vcpid.toString() === '' ||
		parsedCue.graphic.vcpid.toString().length === 0
	) {
		context.notifyUserWarning('No valid VCPID provided')
		return
	}

	if (IsTargetingFull(engine)) {
		actions.push(CreatePilotAdLibAction(pilotGraphicProps))
	}

	if (!(IsTargetingOVL(pilotGraphicProps.engine) && adlib)) {
		pieces.push(CreatePilotPiece(pilotGraphicProps))
	}

	if (IsTargetingOVL(engine) && adlib) {
		adlibPieces.push(CreatePilotAdlibPiece(pilotGraphicProps))
	}

	if (IsTargetingFull(engine)) {
		pieces.push(CreateFullDataStore(pilotGraphicProps))
	}
}

function CreatePilotAdLibAction({
	config,
	context,
	parsedCue,
	engine,
	settings,
	adlib,
	adlibRank,
	segmentExternalId
}: PilotGraphicProps) {
	const name = GraphicDisplayName(config, parsedCue)
	const sourceLayerId = GetSourceLayer(engine)
	const outputLayerId = GetOutputLayer(engine)

	const userData = literal<ActionSelectFullGrafik>({
		type: AdlibActionType.SELECT_FULL_GRAFIK,
		name: parsedCue.graphic.name,
		vcpid: parsedCue.graphic.vcpid,
		segmentExternalId
	})
	return literal<IBlueprintActionManifest>({
		externalId: generateExternalId(context, userData),
		actionId: AdlibActionType.SELECT_FULL_GRAFIK,
		userData,
		userDataManifest: {},
		display: {
			_rank: adlibRank,
			label: t(GetFullGraphicTemplateNameFromCue(config, parsedCue)),
			sourceLayerId: SharedSourceLayers.PgmPilot,
			outputLayerId: SharedOutputLayers.PGM,
			content: CreatePilotContent(config, context, settings, parsedCue, engine, adlib),
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

export function CreatePilotPiece({
	config,
	context,
	partId,
	parsedCue,
	engine,
	settings,
	adlib,
	segmentExternalId,
	prerollDuration
}: PilotGraphicProps): IBlueprintPiece {
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
		prerollDuration: prerollDuration ?? config.studio.VizPilotGraphics.PrerollDuration,
		lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue),
		metaData: literal<PieceMetaData>({
			sisyfosPersistMetaData: {
				sisyfosLayers: []
			}
		}),
		content: CreatePilotContent(config, context, settings, parsedCue, engine, adlib),
		tags: IsTargetingFull(engine)
			? [GetTagForFull(segmentExternalId, parsedCue.graphic.vcpid), TallyTags.FULL_IS_LIVE]
			: []
	})
}

export function CreatePilotAdlibPiece(pieceProps: PilotGraphicProps, rank?: number): IBlueprintAdLibPiece {
	const pilotPiece = CreatePilotPiece(pieceProps)
	pilotPiece.tags = [...(pilotPiece.tags ?? []), AdlibTags.ADLIB_FLOW_PRODUCER]
	return {
		...pilotPiece,
		_rank: rank ?? 0
	}
}

export function CreateFullDataStore({
	config,
	context,
	partId,
	parsedCue,
	engine,
	settings,
	adlib,
	segmentExternalId
}: PilotGraphicProps): IBlueprintPiece {
	const content = CreatePilotContent(config, context, settings, parsedCue, engine, adlib)
	content.timelineObjects = content.timelineObjects.filter(
		o =>
			o.content.deviceType !== TSR.DeviceType.ATEM &&
			o.content.deviceType !== TSR.DeviceType.SISYFOS &&
			o.content.deviceType !== TSR.DeviceType.VIZMSE &&
			o.content.deviceType !== TSR.DeviceType.CASPARCG
	)
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
			}),
			sisyfosPersistMetaData: literal<SisyfosPersistMetaData>({
				sisyfosLayers: []
			})
		},
		content,
		tags: [GetTagForFullNext(segmentExternalId, parsedCue.graphic.vcpid)]
	})
}

function CreatePilotContent(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
	settings: PilotGeneratorSettings,
	cue: CueDefinitionGraphic<GraphicPilot>,
	engine: GraphicEngine,
	adlib: boolean
): WithTimeline<GraphicsContent> {
	if (config.studio.GraphicsType === 'HTML') {
		return GetPilotGraphicContentCaspar(config, context, cue, settings.caspar, engine)
	} else {
		return GetPilotGraphicContentViz(config, context, settings.viz, cue, engine, adlib)
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
