import { IBlueprintAdLibPiece, IBlueprintPiece, IShowStyleUserContext, PieceLifespan } from 'blueprints-integration'
import {
	CueDefinitionGraphic,
	GraphicInternal,
	GraphicPieceMetaData,
	HtmlInternalGraphic,
	IsTargetingTLF,
	IsTargetingWall,
	PartDefinition,
	PieceMetaData,
	ShowStyleContext,
	VizInternalGraphic
} from 'tv2-common'
import { AdlibTags, SharedOutputLayer, SharedSourceLayer } from 'tv2-constants'
import * as _ from 'underscore'

import { Graphic } from '../Graphic'

export abstract class InternalGraphic extends Graphic {
	public static createInternalGraphicGenerator(graphicProps: InternalGraphicProps): InternalGraphic {
		if (graphicProps.context.config.studio.GraphicsType === 'HTML') {
			return new HtmlInternalGraphic(graphicProps)
		}
		return new VizInternalGraphic(graphicProps)
	}
	public readonly templateName: string
	protected readonly cue: CueDefinitionGraphic<GraphicInternal>
	protected readonly core: IShowStyleUserContext
	private readonly partDefinition?: PartDefinition
	private readonly displayName: string
	private readonly sourceLayerId: SharedSourceLayer
	private readonly outputLayerId: SharedOutputLayer
	private readonly partId?: string
	private readonly rank?: number
	private readonly content: IBlueprintPiece['content']

	protected constructor(graphicProps: InternalGraphicProps) {
		super(graphicProps.context, graphicProps.parsedCue)
		this.templateName = this.getTemplateName()
		this.sourceLayerId = this.getSourceLayer(this.templateName)
		this.core = graphicProps.context.core
		this.context = graphicProps.context
		this.cue = graphicProps.parsedCue
		this.partDefinition = graphicProps.partDefinition
		this.displayName = this.getDisplayName()
		this.outputLayerId = IsTargetingWall(this.engine) ? SharedOutputLayer.SEC : SharedOutputLayer.OVERLAY
		this.partId = graphicProps.partId
		this.content = this.getContent()
	}

	public createCommentatorAdlib(): IBlueprintAdLibPiece<PieceMetaData> {
		return {
			_rank: this.rank || 0,
			externalId: this.partId ?? '',
			name: this.displayName,
			uniquenessId: `gfx_${this.displayName}_${this.sourceLayerId}_${this.outputLayerId}_commentator`,
			sourceLayerId: this.sourceLayerId,
			outputLayerId: SharedOutputLayer.OVERLAY,
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
			name: this.displayName,
			uniquenessId: `gfx_${this.displayName}_${this.sourceLayerId}_${this.outputLayerId}_flow`,
			sourceLayerId: this.sourceLayerId,
			outputLayerId: this.outputLayerId,
			tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
			...(IsTargetingTLF(this.engine) || (this.cue.end && this.cue.end.infiniteMode)
				? {}
				: {
						expectedDuration: this.getPieceEnable().duration
				  }),
			lifespan: this.getPieceLifespan(),
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
			name: this.displayName,
			...(IsTargetingTLF(this.engine) || IsTargetingWall(this.engine)
				? { enable: { start: 0 } }
				: {
						enable: this.getPieceEnable()
				  }),
			outputLayerId: this.outputLayerId,
			sourceLayerId: this.sourceLayerId,
			lifespan: this.getPieceLifespan(),
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

	public getTemplateName(): string {
		const iNewsTemplateName = this.cue.graphic.template
		const template = this.config.showStyle.GfxTemplates.find(templ =>
			templ.INewsName ? templ.INewsName.toString().toUpperCase() === iNewsTemplateName.toUpperCase() : false
		)
		if (template && template.VizTemplate.toString().length) {
			return template.VizTemplate.toString()
		}

		// This means unconfigured templates will still be supported, with default out.
		return iNewsTemplateName
	}

	public getTemplateId(): string {
		return this.cue.graphic.template
	}

	public getDisplayName(): string {
		return `${this.cue.graphic.template ? `${this.templateName}` : ''}${
			this.cue.graphic.textFields.length ? ' - ' : ''
		}${this.cue.graphic.textFields.filter(txt => !txt.match(/^;.\.../i)).join('\n - ')}`
	}

	protected abstract getContent(): IBlueprintPiece['content']
}

export interface InternalGraphicProps {
	context: ShowStyleContext
	parsedCue: CueDefinitionGraphic<GraphicInternal>
	partId?: string
	partDefinition?: PartDefinition
}
