import { IBlueprintAdLibPiece, IBlueprintPiece, IShowStyleUserContext, PieceLifespan } from 'blueprints-integration'
import { Adlib } from 'tv2-common'
import _ = require('underscore')
import { AdlibTags, GraphicEngine, SharedOutputLayers, SharedSourceLayers } from '../../../tv2-constants'
import { TV2BlueprintConfig } from '../../blueprintConfig'
import { CueDefinitionGraphic, GraphicInternal, PartDefinition } from '../../inewsConversion'
import { GraphicPieceMetaData, PieceMetaData } from '../../onTimelineGenerate'
import { GetInternalGraphicContentCaspar } from './caspar'
import { GetSourceLayerForGraphic } from './layers'
import { GetFullGraphicTemplateNameFromCue, GraphicDisplayName } from './name'
import { IsTargetingTLF, IsTargetingWall } from './target'
import { CreateTimingGraphic, GetPieceLifespanForGraphic } from './timing'
import { GetInternalGraphicContentVIZ } from './viz'

export class InternalGraphic {
	public mappedTemplate: string
	private readonly config: TV2BlueprintConfig
	private readonly context: IShowStyleUserContext
	private readonly parsedCue: CueDefinitionGraphic<GraphicInternal>
	private readonly partDefinition?: PartDefinition
	private readonly adlib?: Adlib
	private readonly engine: GraphicEngine
	private readonly name: string
	private readonly sourceLayerId: SharedSourceLayers
	private readonly outputLayerId: SharedOutputLayers
	private readonly partId?: string
	private readonly rank?: number
	private readonly content: IBlueprintPiece['content']

	public constructor(
		config: TV2BlueprintConfig,
		context: IShowStyleUserContext,
		parsedCue: CueDefinitionGraphic<GraphicInternal>,
		adlib?: Adlib,
		partId?: string,
		partDefinition?: PartDefinition
	) {
		const mappedTemplate = GetFullGraphicTemplateNameFromCue(config, parsedCue)

		const sourceLayerId = GetSourceLayerForGraphic(config, mappedTemplate)

		this.config = config
		this.context = context
		this.parsedCue = parsedCue
		this.partDefinition = partDefinition
		this.adlib = adlib
		this.mappedTemplate = mappedTemplate
		this.engine = parsedCue.target
		this.name = GraphicDisplayName(config, parsedCue)
		this.sourceLayerId = sourceLayerId
		this.outputLayerId = IsTargetingWall(this.engine) ? SharedOutputLayers.SEC : SharedOutputLayers.OVERLAY
		this.partId = partId
		this.content = this.getInternalGraphicContent()
	}

	public createCommentatorAdlib(): IBlueprintAdLibPiece<PieceMetaData> {
		return {
			_rank: this.rank || 0,
			externalId: this.partId ?? '',
			name: this.name,
			uniquenessId: `gfx_${this.name}_${this.sourceLayerId}_${this.outputLayerId}_commentator`,
			sourceLayerId: this.sourceLayerId,
			outputLayerId: SharedOutputLayers.OVERLAY,
			lifespan: PieceLifespan.WithinPart,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: []
				}
			},
			expectedDuration: 5000,
			tags: [AdlibTags.ADLIB_KOMMENTATOR],
			content: _.clone(this.content)
		}
	}

	public createAdlib(): IBlueprintAdLibPiece<PieceMetaData> {
		return {
			_rank: this.rank || 0,
			externalId: this.partId ?? '',
			name: this.name,
			uniquenessId: `gfx_${this.name}_${this.sourceLayerId}_${this.outputLayerId}_flow`,
			sourceLayerId: this.sourceLayerId,
			outputLayerId: this.outputLayerId,
			tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
			...(IsTargetingTLF(this.engine) || (this.parsedCue.end && this.parsedCue.end.infiniteMode)
				? {}
				: {
						expectedDuration: CreateTimingGraphic(this.config, this.parsedCue).duration
				  }),
			lifespan: GetPieceLifespanForGraphic(this.engine, this.config, this.parsedCue),
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: []
				}
			},
			content: _.clone(this.content)
		}
	}

	public createPiece(): IBlueprintPiece<GraphicPieceMetaData> {
		return {
			externalId: this.partId ?? '',
			name: this.name,
			...(IsTargetingTLF(this.engine) || IsTargetingWall(this.engine)
				? { enable: { start: 0 } }
				: {
						enable: {
							...CreateTimingGraphic(this.config, this.parsedCue)
						}
				  }),
			outputLayerId: this.outputLayerId,
			sourceLayerId: this.sourceLayerId,
			lifespan: GetPieceLifespanForGraphic(this.engine, this.config, this.parsedCue),
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: []
				},
				partType: this.partDefinition?.type,
				pieceExternalId: this.partDefinition?.externalId
			},
			content: _.clone(this.content)
		}
	}

	private getInternalGraphicContent(): IBlueprintPiece['content'] {
		return this.config.studio.GraphicsType === 'HTML'
			? GetInternalGraphicContentCaspar(
					this.config,
					this.engine,
					this.parsedCue,
					this.partDefinition,
					this.mappedTemplate,
					!!this.adlib
			  )
			: GetInternalGraphicContentVIZ(
					this.config,
					this.context,
					this.engine,
					this.parsedCue,
					this.partDefinition,
					this.mappedTemplate,
					!!this.adlib
			  )
	}
}
