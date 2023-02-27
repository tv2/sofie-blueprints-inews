import { PieceLifespan, TSR } from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionGraphic,
	ExtendedShowStyleContext,
	getDefaultOut,
	getLifeSpan,
	getTimingEnable,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	IsTargetingTLF,
	IsTargetingWall,
	TableConfigItemGfxTemplate,
	TV2ShowStyleConfig
} from 'tv2-common'
import { GraphicEngine, SharedSourceLayers } from 'tv2-constants'

export abstract class Graphic {
	protected readonly config: TV2ShowStyleConfig
	protected readonly engine: GraphicEngine
	constructor(
		protected context: ExtendedShowStyleContext,
		protected cue: CueDefinitionGraphic<GraphicInternalOrPilot>
	) {
		this.config = context.config
		this.engine = cue.target
	}

	public abstract getTemplateId(): string
	public abstract getTemplateName(): string

	protected getGraphicDuration(): number | undefined {
		if (this.config.showStyle.GfxTemplates) {
			const template = this.findGfxTemplate()
			if (template && template.OutType && !template.OutType.toString().match(/default/i)) {
				return undefined
			}
		}

		return getDefaultOut(this.config)
	}

	protected getSourceLayerForGraphic(name: string) {
		const conf = this.config.showStyle.GfxTemplates
			? this.config.showStyle.GfxTemplates.find((gfx) => gfx.VizTemplate.toString() === name)
			: undefined

		if (!conf) {
			return SharedSourceLayers.PgmGraphicsOverlay
		}

		switch (conf.SourceLayer) {
			// TODO: When adding more sourcelayers
			// This is here to guard against bad user input
			case SharedSourceLayers.PgmGraphicsHeadline:
				if (this.config.studio.GraphicsType === 'HTML') {
					return SharedSourceLayers.PgmGraphicsLower
				}
				return SharedSourceLayers.PgmGraphicsHeadline
			case SharedSourceLayers.PgmGraphicsIdent:
				return SharedSourceLayers.PgmGraphicsIdent
			case SharedSourceLayers.PgmGraphicsLower:
				return SharedSourceLayers.PgmGraphicsLower
			case SharedSourceLayers.PgmGraphicsOverlay:
				return SharedSourceLayers.PgmGraphicsOverlay
			case SharedSourceLayers.PgmGraphicsTLF:
				return SharedSourceLayers.PgmGraphicsTLF
			case SharedSourceLayers.PgmGraphicsTema:
				return SharedSourceLayers.PgmGraphicsTema
			case SharedSourceLayers.PgmGraphicsTop:
				return SharedSourceLayers.PgmGraphicsTop
			case SharedSourceLayers.WallGraphics:
				return SharedSourceLayers.WallGraphics
			default:
				return SharedSourceLayers.PgmGraphicsOverlay
		}
	}

	protected createTimingGraphic(): { start: number; duration?: number } {
		const ret: { start: number; duration?: number } = { start: 0, duration: 0 }
		const start = this.cue.start ? calculateTime(this.cue.start) : 0
		start !== undefined ? (ret.start = start) : (ret.start = 0)

		const duration = this.getGraphicDuration()
		const end = this.cue.end
			? this.cue.end.infiniteMode
				? undefined
				: calculateTime(this.cue.end)
			: duration
			? ret.start + duration
			: undefined
		ret.duration = end ? end - ret.start : undefined

		return ret
	}

	protected GetEnableForGraphic(): TSR.TSRTimelineObj['enable'] {
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
			return PieceLifespan.OutOnShowStyleEnd
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
		const template = this.getTemplateName()
		const iNewsName = GraphicIsInternal(this.cue) ? this.cue.graphic.template : undefined
		const conf = this.config.showStyle.GfxTemplates.find((gfx) =>
			gfx.VizTemplate
				? gfx.VizTemplate.toString().toUpperCase() === template.toUpperCase() &&
				  (iNewsName ? gfx.INewsName.toUpperCase() === iNewsName.toUpperCase() : true)
				: false
		)

		if (!conf) {
			return PieceLifespan.WithinPart
		}

		if (!conf.OutType || !conf.OutType.toString().length) {
			return PieceLifespan.WithinPart
		}

		const type = conf.OutType.toString().toUpperCase()

		if (type !== 'B' && type !== 'S' && type !== 'O') {
			return PieceLifespan.WithinPart
		}

		return getLifeSpan(type)
	}
}
