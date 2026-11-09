import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import {
	ActionSelectFullGrafik,
	Adlib,
	assertUnreachable,
	CreateTimingGraphic,
	CueDefinitionGraphic,
	FullPieceMetaData,
	generateExternalId,
	GetFullGraphicTemplateNameFromCue,
	GetPieceLifespanForGraphic,
	GetTagForFull,
	GetTagForFullNext,
	GraphicDisplayName,
	GraphicPilot,
	HtmlPilotGraphicGenerator,
	IsTargetingFull,
	IsTargetingWall,
	literal,
	PieceMetaData,
	ShowStyleContext,
	SisyfosPersistMetaData,
	t,
	TV2BlueprintConfig,
	VizPilotGraphicGenerator
} from 'tv2-common'
import {
	AdlibActionType,
	AdlibTags,
	GraphicEngine,
	SharedGraphicLLayer,
	SharedOutputLayers,
	SharedSourceLayers,
	TallyTags
} from 'tv2-constants'

export interface PilotGraphicProps {
	context: ShowStyleContext
	partId: string
	parsedCue: CueDefinitionGraphic<GraphicPilot>
	adlib?: Adlib
	segmentExternalId: string
}

export abstract class PilotGraphicGenerator {
	public static createPilotGraphicGenerator(graphicProps: PilotGraphicProps): PilotGraphicGenerator {
		if (graphicProps.context.config.studio.GraphicsType === 'HTML' && !IsTargetingWall(graphicProps.parsedCue.target)) {
			return new HtmlPilotGraphicGenerator(graphicProps)
		}
		return new VizPilotGraphicGenerator(graphicProps)
	}
	protected readonly config: TV2BlueprintConfig
	protected readonly context: ShowStyleContext
	protected readonly engine: GraphicEngine
	protected readonly partId: string
	protected readonly parsedCue: CueDefinitionGraphic<GraphicPilot>
	protected readonly adlib?: Adlib
	protected readonly segmentExternalId: string

	protected constructor(graphicProps: PilotGraphicProps) {
		this.config = graphicProps.context.config
		this.context = graphicProps.context
		this.engine = graphicProps.parsedCue.target
		this.parsedCue = graphicProps.parsedCue
		this.partId = graphicProps.partId
		this.adlib = graphicProps.adlib
		this.segmentExternalId = graphicProps.segmentExternalId
	}

	public abstract getContent(): WithTimeline<GraphicsContent>

	public getTemplateName(): string {
		return GraphicDisplayName(this.config, this.parsedCue)
	}

	public createFullPilotAdLibAction(): IBlueprintActionManifest {
		const name = GraphicDisplayName(this.config, this.parsedCue)
		const sourceLayerId = this.getSourceLayer()
		const outputLayerId = this.getOutputLayer()

		const userData: ActionSelectFullGrafik = {
			type: AdlibActionType.SELECT_FULL_GRAFIK,
			name: this.parsedCue.graphic.name,
			vcpid: this.parsedCue.graphic.vcpid,
			segmentExternalId: this.segmentExternalId
		}
		return {
			externalId: generateExternalId(this.context.core, userData),
			actionId: AdlibActionType.SELECT_FULL_GRAFIK,
			userData,
			userDataManifest: {},
			display: {
				_rank: (this.adlib && this.adlib.rank) || 0,
				label: t(GetFullGraphicTemplateNameFromCue(this.config, this.parsedCue)),
				sourceLayerId: SharedSourceLayers.PgmPilot,
				outputLayerId: SharedOutputLayers.PGM,
				content: this.getContent(),
				uniquenessId: `gfx_${name}_${sourceLayerId}_${outputLayerId}`,
				tags: [
					AdlibTags.ADLIB_KOMMENTATOR,
					...(this.config.showStyle.MakeAdlibsForFulls && IsTargetingFull(this.engine)
						? [AdlibTags.ADLIB_FLOW_PRODUCER]
						: [])
				],
				currentPieceTags: [GetTagForFull(this.segmentExternalId, this.parsedCue.graphic.vcpid)],
				nextPieceTags: [GetTagForFullNext(this.segmentExternalId, this.parsedCue.graphic.vcpid)]
			}
		}
	}

	public createPiece(): IBlueprintPiece<PieceMetaData> {
		return {
			externalId: this.partId,
			name: GraphicDisplayName(this.config, this.parsedCue),
			...(IsTargetingFull(this.engine) || IsTargetingWall(this.engine)
				? { enable: { start: 0 } }
				: {
						enable: {
							...CreateTimingGraphic(this.config, this.parsedCue)
						}
				  }),
			outputLayerId: this.getOutputLayer(),
			sourceLayerId: this.getSourceLayer(),
			prerollDuration: this.getPrerollDuration(),
			lifespan: GetPieceLifespanForGraphic(this.engine, this.config, this.parsedCue),
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: []
				}
			},
			content: this.getContent(),
			tags: IsTargetingFull(this.engine)
				? [GetTagForFull(this.segmentExternalId, this.parsedCue.graphic.vcpid), TallyTags.FULL_IS_LIVE]
				: []
		}
	}

	public createAdlibPiece(rank?: number): IBlueprintAdLibPiece {
		const pilotPiece = this.createPiece()
		pilotPiece.tags = [...(pilotPiece.tags ?? []), AdlibTags.ADLIB_FLOW_PRODUCER, AdlibTags.ADLIB_KOMMENTATOR]
		return {
			...pilotPiece,
			_rank: rank ?? 0
		}
	}

	public createFullDataStore(): IBlueprintPiece<FullPieceMetaData> {
		const content = this.getContent()
		content.timelineObjects = content.timelineObjects.filter(
			o =>
				!this.context.videoSwitcher.isVideoSwitcherTimelineObject(o) &&
				o.content.deviceType !== TSR.DeviceType.SISYFOS &&
				o.content.deviceType !== TSR.DeviceType.VIZMSE &&
				o.content.deviceType !== TSR.DeviceType.CASPARCG
		)
		return {
			externalId: this.partId,
			name: GraphicDisplayName(this.config, this.parsedCue),
			enable: {
				start: 0
			},
			outputLayerId: SharedOutputLayers.SELECTED_ADLIB,
			sourceLayerId: SharedSourceLayers.SelectedAdlibGraphicsFull,
			lifespan: PieceLifespan.OutOnSegmentEnd,
			metaData: {
				userData: {
					type: AdlibActionType.SELECT_FULL_GRAFIK,
					name: this.parsedCue.graphic.name,
					vcpid: this.parsedCue.graphic.vcpid,
					segmentExternalId: this.segmentExternalId
				},
				sisyfosPersistMetaData: literal<SisyfosPersistMetaData>({
					sisyfosLayers: []
				})
			},
			content,
			tags: [GetTagForFullNext(this.segmentExternalId, this.parsedCue.graphic.vcpid)]
		}
	}

	protected getPrerollDuration(): number {
		return this.config.studio.GraphicsType === 'HTML' && !IsTargetingWall(this.engine)
			? this.config.studio.CasparPrerollDuration
			: this.config.studio.VizPilotGraphics.PrerollDuration
	}

	protected getSourceLayer(): SharedSourceLayers {
		switch (this.engine) {
			case 'WALL':
				return SharedSourceLayers.WallGraphics
			case 'TLF':
				return SharedSourceLayers.PgmGraphicsTLF
			case 'OVL':
				return SharedSourceLayers.PgmPilotOverlay
			case 'FULL':
				return SharedSourceLayers.PgmPilot
			default:
				assertUnreachable(this.engine)
		}
	}

	protected getOutputLayer(): SharedOutputLayers {
		switch (this.engine) {
			case 'WALL':
				return SharedOutputLayers.SEC
			case 'OVL':
				return SharedOutputLayers.OVERLAY
			case 'FULL':
			case 'TLF':
				return SharedOutputLayers.PGM
			default:
				assertUnreachable(this.engine)
		}
	}

	protected getLayerMappingName(): SharedGraphicLLayer {
		switch (this.engine) {
			case 'WALL':
				return SharedGraphicLLayer.GraphicLLayerWall
			case 'OVL':
				return SharedGraphicLLayer.GraphicLLayerOverlayPilot
			case 'FULL':
			case 'TLF':
				return SharedGraphicLLayer.GraphicLLayerPilot
			default:
				assertUnreachable(this.engine)
		}
	}
}
