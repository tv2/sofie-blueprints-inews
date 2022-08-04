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
	Adlib,
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
	adlib?: Adlib
	segmentExternalId: string
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

	const generator = new PilotGraphicGenerator(pilotGraphicProps)

	if (IsTargetingOVL(engine) && adlib) {
		adlibPieces.push(generator.createAdlibPiece())
	} else {
		pieces.push(generator.createPiece())
	}

	if (IsTargetingFull(engine)) {
		actions.push(generator.createPilotAdLibAction())
		pieces.push(generator.createFullDataStore())
	}
}

export class PilotGraphicGenerator {
	private readonly config: TV2BlueprintConfig
	private readonly context: IShowStyleUserContext
	private readonly engine: GraphicEngine
	private readonly partId: string
	private readonly parsedCue: CueDefinitionGraphic<GraphicPilot>
	private readonly settings: PilotGeneratorSettings
	private readonly adlib?: Adlib
	private readonly segmentExternalId: string

	constructor(graphicProps: PilotGraphicProps) {
		this.config = graphicProps.config
		this.context = graphicProps.context
		this.engine = graphicProps.engine
		this.parsedCue = graphicProps.parsedCue
		this.partId = graphicProps.partId
		this.settings = graphicProps.settings
		this.adlib = graphicProps.adlib
		this.segmentExternalId = graphicProps.segmentExternalId
	}

	public createPilotAdLibAction() {
		const name = GraphicDisplayName(this.config, this.parsedCue)
		const sourceLayerId = this.getSourceLayer()
		const outputLayerId = this.getOutputLayer()

		const userData = literal<ActionSelectFullGrafik>({
			type: AdlibActionType.SELECT_FULL_GRAFIK,
			name: this.parsedCue.graphic.name,
			vcpid: this.parsedCue.graphic.vcpid,
			segmentExternalId: this.segmentExternalId
		})
		return literal<IBlueprintActionManifest>({
			externalId: generateExternalId(this.context, userData),
			actionId: AdlibActionType.SELECT_FULL_GRAFIK,
			userData,
			userDataManifest: {},
			display: {
				_rank: (this.adlib && this.adlib.rank) || 0,
				label: t(GetFullGraphicTemplateNameFromCue(this.config, this.parsedCue)),
				sourceLayerId: SharedSourceLayers.PgmPilot,
				outputLayerId: SharedOutputLayers.PGM,
				content: this.createContent(),
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
		})
	}

	public createPiece(): IBlueprintPiece {
		return literal<IBlueprintPiece>({
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
			lifespan: GetInfiniteModeForGraphic(this.engine, this.config, this.parsedCue),
			metaData: literal<PieceMetaData>({
				sisyfosPersistMetaData: {
					sisyfosLayers: []
				}
			}),
			content: this.createContent(),
			tags: IsTargetingFull(this.engine)
				? [GetTagForFull(this.segmentExternalId, this.parsedCue.graphic.vcpid), TallyTags.FULL_IS_LIVE]
				: []
		})
	}

	public createAdlibPiece(rank?: number): IBlueprintAdLibPiece {
		const pilotPiece = this.createPiece()
		pilotPiece.tags = [...(pilotPiece.tags ?? []), AdlibTags.ADLIB_FLOW_PRODUCER]
		return {
			...pilotPiece,
			_rank: rank ?? 0
		}
	}

	public createFullDataStore(): IBlueprintPiece {
		const content = this.createContent()
		content.timelineObjects = content.timelineObjects.filter(
			o =>
				o.content.deviceType !== TSR.DeviceType.ATEM &&
				o.content.deviceType !== TSR.DeviceType.SISYFOS &&
				o.content.deviceType !== TSR.DeviceType.VIZMSE &&
				o.content.deviceType !== TSR.DeviceType.CASPARCG
		)
		return literal<IBlueprintPiece>({
			externalId: this.partId,
			name: GraphicDisplayName(this.config, this.parsedCue),
			enable: {
				start: 0
			},
			outputLayerId: SharedOutputLayers.SELECTED_ADLIB,
			sourceLayerId: SharedSourceLayers.SelectedAdlibGraphicsFull,
			lifespan: PieceLifespan.OutOnSegmentEnd,
			metaData: {
				userData: literal<ActionSelectFullGrafik>({
					type: AdlibActionType.SELECT_FULL_GRAFIK,
					name: this.parsedCue.graphic.name,
					vcpid: this.parsedCue.graphic.vcpid,
					segmentExternalId: this.segmentExternalId
				}),
				sisyfosPersistMetaData: literal<SisyfosPersistMetaData>({
					sisyfosLayers: []
				})
			},
			content,
			tags: [GetTagForFullNext(this.segmentExternalId, this.parsedCue.graphic.vcpid)]
		})
	}

	private createContent(): WithTimeline<GraphicsContent> {
		if (this.config.studio.GraphicsType === 'HTML') {
			return GetPilotGraphicContentCaspar(this.config, this.context, this.parsedCue, this.settings.caspar, this.engine)
		} else {
			return GetPilotGraphicContentViz(
				this.config,
				this.context,
				this.settings.viz,
				this.parsedCue,
				this.engine,
				this.adlib
			)
		}
	}

	private getPrerollDuration(): number {
		return this.config.studio.GraphicsType === 'HTML'
			? this.config.studio.CasparPrerollDuration
			: this.config.studio.VizPilotGraphics.PrerollDuration
	}

	private getSourceLayer(): SharedSourceLayers {
		const engine = this.engine
		return IsTargetingWall(engine)
			? SharedSourceLayers.WallGraphics
			: IsTargetingTLF(engine)
			? SharedSourceLayers.PgmGraphicsTLF
			: IsTargetingOVL(engine)
			? SharedSourceLayers.PgmPilotOverlay
			: SharedSourceLayers.PgmPilot
	}

	private getOutputLayer() {
		const engine = this.engine
		return IsTargetingWall(engine)
			? SharedOutputLayers.SEC
			: IsTargetingOVL(engine)
			? SharedOutputLayers.OVERLAY
			: IsTargetingFull(engine)
			? SharedOutputLayers.PGM
			: SharedOutputLayers.OVERLAY
	}
}
