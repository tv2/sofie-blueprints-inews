import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import {
	ActionSelectFullGrafik,
	Adlib,
	assertUnreachable,
	CueDefinitionGraphic,
	FullPieceMetaData,
	generateExternalId,
	GetTagForFull,
	GetTagForFullNext,
	GraphicPilot,
	HtmlPilotGraphicGenerator,
	IsTargetingFull,
	IsTargetingWall,
	PieceMetaData,
	ShowStyleContext,
	t,
	TV2ShowStyleConfig,
	VizPilotGraphicGenerator
} from 'tv2-common'
import {
	AdlibActionType,
	AdlibTags,
	GraphicEngine,
	SharedGraphicLLayer,
	SharedOutputLayer,
	SharedSourceLayer,
	TallyTags
} from 'tv2-constants'
import { Graphic } from '../index'

export interface PilotGraphicProps {
	context: ShowStyleContext
	partId: string
	parsedCue: CueDefinitionGraphic<GraphicPilot>
	adlib?: Adlib
	segmentExternalId: string
}

export abstract class PilotGraphicGenerator extends Graphic {
	public static createPilotGraphicGenerator(graphicProps: PilotGraphicProps): PilotGraphicGenerator {
		if (graphicProps.context.config.studio.GraphicsType === 'HTML') {
			return new HtmlPilotGraphicGenerator(graphicProps)
		}
		return new VizPilotGraphicGenerator(graphicProps)
	}
	protected readonly config: TV2ShowStyleConfig
	protected readonly core: IShowStyleUserContext
	protected readonly engine: GraphicEngine
	protected readonly partId: string
	protected readonly cue: CueDefinitionGraphic<GraphicPilot>
	protected readonly adlib?: Adlib
	protected readonly segmentExternalId: string

	protected constructor(graphicProps: PilotGraphicProps) {
		super(graphicProps.context, graphicProps.parsedCue)
		this.config = graphicProps.context.config
		this.core = graphicProps.context.core
		this.engine = graphicProps.parsedCue.target
		this.cue = graphicProps.parsedCue
		this.partId = graphicProps.partId
		this.adlib = graphicProps.adlib
		this.segmentExternalId = graphicProps.segmentExternalId
	}

	public abstract getContent(): WithTimeline<GraphicsContent>

	public createFullPilotAdLibAction(): IBlueprintActionManifest {
		const name = this.getTemplateName()
		const sourceLayerId = this.getSourceLayer()
		const outputLayerId = this.getOutputLayer()

		const userData: ActionSelectFullGrafik = {
			type: AdlibActionType.SELECT_FULL_GRAFIK,
			name: this.cue.graphic.name,
			vcpid: this.cue.graphic.vcpid,
			segmentExternalId: this.segmentExternalId
		}
		return {
			externalId: generateExternalId(this.core, userData),
			actionId: AdlibActionType.SELECT_FULL_GRAFIK,
			userData,
			userDataManifest: {},
			display: {
				_rank: (this.adlib && this.adlib.rank) || 0,
				label: t(this.getTemplateName()),
				sourceLayerId: SharedSourceLayer.PgmPilot,
				outputLayerId: SharedOutputLayer.PGM,
				content: this.getContent(),
				uniquenessId: `gfx_${name}_${sourceLayerId}_${outputLayerId}`,
				tags: [
					AdlibTags.ADLIB_KOMMENTATOR,
					...(this.config.showStyle.MakeAdlibsForFulls && IsTargetingFull(this.engine)
						? [AdlibTags.ADLIB_FLOW_PRODUCER]
						: [])
				],
				currentPieceTags: [GetTagForFull(this.segmentExternalId, this.cue.graphic.vcpid)],
				nextPieceTags: [GetTagForFullNext(this.segmentExternalId, this.cue.graphic.vcpid)]
			}
		}
	}

	public createPiece(): IBlueprintPiece<PieceMetaData> {
		return {
			externalId: this.partId,
			name: this.getTemplateName(),
			...(IsTargetingFull(this.engine) || IsTargetingWall(this.engine)
				? { enable: { start: 0 } }
				: {
						enable: this.getPieceEnable()
				  }),
			outputLayerId: this.getOutputLayer(),
			sourceLayerId: this.getSourceLayer(),
			prerollDuration: this.getPrerollDuration(),
			lifespan: this.getPieceLifespan(),
			content: this.getContent(),
			tags: IsTargetingFull(this.engine)
				? [GetTagForFull(this.segmentExternalId, this.cue.graphic.vcpid), TallyTags.FULL_IS_LIVE]
				: []
		}
	}

	public createAdlibPiece(rank?: number): IBlueprintAdLibPiece<PieceMetaData> {
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
			(o) =>
				o.content.deviceType !== TSR.DeviceType.ATEM &&
				o.content.deviceType !== TSR.DeviceType.TRICASTER &&
				o.content.deviceType !== TSR.DeviceType.SISYFOS &&
				o.content.deviceType !== TSR.DeviceType.VIZMSE &&
				o.content.deviceType !== TSR.DeviceType.CASPARCG
		)
		return {
			externalId: this.partId,
			name: this.getTemplateName(),
			enable: {
				start: 0
			},
			outputLayerId: SharedOutputLayer.SELECTED_ADLIB,
			sourceLayerId: SharedSourceLayer.SelectedAdlibGraphicsFull,
			lifespan: PieceLifespan.OutOnSegmentEnd,
			metaData: {
				userData: {
					type: AdlibActionType.SELECT_FULL_GRAFIK,
					name: this.cue.graphic.name,
					vcpid: this.cue.graphic.vcpid,
					segmentExternalId: this.segmentExternalId
				}
			},
			content,
			tags: [GetTagForFullNext(this.segmentExternalId, this.cue.graphic.vcpid)]
		}
	}

	public getTemplateName(): string {
		return this.cue.graphic.name
	}

	public getTemplateId(): string {
		return this.cue.graphic.vcpid.toString()
	}

	protected getPrerollDuration(): number {
		return this.config.studio.GraphicsType === 'HTML'
			? this.config.studio.CasparPrerollDuration
			: this.config.studio.VizPilotGraphics.PrerollDuration
	}

	protected getSourceLayer(): SharedSourceLayer {
		switch (this.engine) {
			case 'WALL':
				return SharedSourceLayer.WallGraphics
			case 'TLF':
				return SharedSourceLayer.PgmGraphicsTLF
			case 'OVL':
				return SharedSourceLayer.PgmPilotOverlay
			case 'FULL':
				return SharedSourceLayer.PgmPilot
			default:
				assertUnreachable(this.engine)
		}
	}

	protected getOutputLayer(): SharedOutputLayer {
		switch (this.engine) {
			case 'WALL':
				return SharedOutputLayer.SEC
			case 'OVL':
				return SharedOutputLayer.OVERLAY
			case 'FULL':
			case 'TLF':
				return SharedOutputLayer.PGM
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
