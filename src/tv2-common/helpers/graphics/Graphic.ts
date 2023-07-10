import { IBlueprintPiece, PieceLifespan, TSR } from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionGraphic,
	getDefaultOut,
	getLifeSpan,
	getTimingEnable,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	IsTargetingTLF,
	IsTargetingWall,
	ShowStyleContext,
	TableConfigItemGfxTemplate,
	TV2ShowStyleConfig
} from 'tv2-common'
import { GraphicEngine, SharedSourceLayer } from 'tv2-constants'

const GFX_LAYERS = new Set([
	SharedSourceLayer.PgmGraphicsHeadline,
	SharedSourceLayer.PgmGraphicsIdent,
	SharedSourceLayer.PgmGraphicsLower,
	SharedSourceLayer.PgmGraphicsOverlay,
	SharedSourceLayer.PgmGraphicsTLF,
	SharedSourceLayer.PgmGraphicsTema,
	SharedSourceLayer.PgmGraphicsTop,
	SharedSourceLayer.WallGraphics
])

export abstract class Graphic {
	protected readonly config: TV2ShowStyleConfig
	protected readonly engine: GraphicEngine
	constructor(protected context: ShowStyleContext, protected cue: CueDefinitionGraphic<GraphicInternalOrPilot>) {
		this.config = context.config
		this.engine = cue.target
	}

	public abstract getTemplateId(): string
	public abstract getTemplateName(): string

	protected getGraphicDuration(): number | undefined {
		const template = this.findGfxTemplate()
		if (template && template.OutType && !template.OutType.toString().match(/default/i)) {
			return undefined
		}

		return getDefaultOut(this.config)
	}

	protected getSourceLayer(name: string): SharedSourceLayer {
		const template = this.config.showStyle.GfxTemplates.find((gfx) => gfx.VizTemplate.toString() === name)

		if (template && GFX_LAYERS.has(template.SourceLayer as SharedSourceLayer)) {
			return this.getSubstituteLayer(template.SourceLayer as SharedSourceLayer)
		}

		return SharedSourceLayer.PgmGraphicsOverlay
	}

	protected getSubstituteLayer(sourceLayer: SharedSourceLayer): SharedSourceLayer {
		return sourceLayer
	}

	protected getPieceEnable(): IBlueprintPiece['enable'] {
		const start = this.cue.start ? calculateTime(this.cue.start) ?? 0 : 0
		let duration
		if (this.cue.end) {
			const end = calculateTime(this.cue.end)
			duration = end ? end - start : undefined
		} else {
			duration = this.getGraphicDuration()
		}
		return { start, duration }
	}

	protected getTimelineObjectEnable(): TSR.TSRTimelineObj['enable'] {
		if (IsTargetingWall(this.engine)) {
			return {
				while: '1'
			}
		}

		const timing = getTimingEnable(this.cue, getDefaultOut(this.config))

		if (!timing.lifespan) {
			return timing.enable
		}

		if (this.config.studio.PreventOverlayWithFull) {
			return {
				while: '!.full'
			}
		} else {
			return {
				start: 0
			}
		}
	}

	protected findGfxTemplate(): TableConfigItemGfxTemplate | undefined {
		const templateId = this.getTemplateId()

		return this.config.showStyle.GfxTemplates.find((templ) =>
			templ.INewsName ? templ.INewsName.toString().toUpperCase() === templateId?.toUpperCase() : false
		)
	}

	protected getPieceLifespan(): PieceLifespan {
		if (IsTargetingWall(this.engine)) {
			return PieceLifespan.OutOnRundownChange
		}
		if (IsTargetingTLF(this.engine)) {
			return PieceLifespan.WithinPart
		}
		if (this.cue.end?.infiniteMode) {
			return getLifeSpan(this.cue.end.infiniteMode)
		}
		if (this.cue.end && calculateTime(this.cue.end)) {
			return PieceLifespan.WithinPart
		}
		return this.FindInfiniteModeFromConfig()
	}

	protected FindInfiniteModeFromConfig(): PieceLifespan {
		const templateName = this.getTemplateName()
		const iNewsName = GraphicIsInternal(this.cue) ? this.cue.graphic.template : undefined
		const template = this.config.showStyle.GfxTemplates.find((gfx) =>
			gfx.VizTemplate
				? gfx.VizTemplate.toString().toUpperCase() === templateName.toUpperCase() &&
				  (iNewsName ? gfx.INewsName.toUpperCase() === iNewsName.toUpperCase() : true)
				: false
		)

		if (!template) {
			return PieceLifespan.WithinPart
		}

		if (!template.OutType || !template.OutType.toString().length) {
			return PieceLifespan.WithinPart
		}

		const type = template.OutType.toString().toUpperCase()

		if (type !== 'B' && type !== 'S' && type !== 'O') {
			return PieceLifespan.WithinPart
		}

		return getLifeSpan(type)
	}
}
