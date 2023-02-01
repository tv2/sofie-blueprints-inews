import { PieceLifespan, TSR } from 'blueprints-integration'
import {
	CalculateTime,
	CreateTimingEnable,
	CueDefinitionGraphic,
	ExtendedShowStyleContext,
	GetDefaultOut,
	GetEnableForWall,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	IsTargetingTLF,
	IsTargetingWall,
	LifeSpan,
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

	public abstract getTemplateName(): string

	protected getGraphicDuration(): number | undefined {
		if (this.config.showStyle.GfxTemplates) {
			const template = this.findGfxTemplate()
			if (template && template.OutType && !template.OutType.toString().match(/default/i)) {
				return undefined
			}
		}

		return GetDefaultOut(this.config)
	}

	protected getSourceLayerForGraphic(name: string) {
		const conf = this.config.showStyle.GfxTemplates
			? this.config.showStyle.GfxTemplates.find(gfx => gfx.VizTemplate.toString() === name)
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
		const start = this.cue.start ? CalculateTime(this.cue.start) : 0
		start !== undefined ? (ret.start = start) : (ret.start = 0)

		const duration = this.getGraphicDuration()
		const end = this.cue.end
			? this.cue.end.infiniteMode
				? undefined
				: CalculateTime(this.cue.end)
			: duration
			? ret.start + duration
			: undefined
		ret.duration = end ? end - ret.start : undefined

		return ret
	}

	protected GetEnableForGraphic(): TSR.TSRTimelineObj['enable'] {
		if (IsTargetingWall(this.engine)) {
			return GetEnableForWall()
		}

		const timing = CreateTimingEnable(this.cue, GetDefaultOut(this.config))

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
		let graphicId: string | undefined
		// @todo: this should be implemented in derivatives
		if (GraphicIsInternal(this.cue)) {
			graphicId = this.cue.graphic.template
		} else if (GraphicIsPilot(this.cue)) {
			graphicId = this.cue.graphic.vcpid.toString()
		}
		if (graphicId === undefined) {
			return undefined
		}
		return this.config.showStyle.GfxTemplates.find(templ =>
			templ.INewsName ? templ.INewsName.toString().toUpperCase() === graphicId?.toUpperCase() : false
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
			return LifeSpan(this.cue.end.infiniteMode)
		}
		if (this.cue.end && CalculateTime(this.cue.end)) {
			return PieceLifespan.WithinPart
		}
		return this.FindInfiniteModeFromConfig()
	}

	protected FindInfiniteModeFromConfig(): PieceLifespan {
		const template = this.getTemplateName()
		const iNewsName = GraphicIsInternal(this.cue) ? this.cue.graphic.template : undefined
		const conf = this.config.showStyle.GfxTemplates.find(gfx =>
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

		return LifeSpan(type)
	}
}
