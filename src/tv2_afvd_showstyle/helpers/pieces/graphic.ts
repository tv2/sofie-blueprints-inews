import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import {
	CalculateTime,
	CueDefinition,
	CueDefinitionGraphic,
	GetDefaultOut,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	GraphicLLayer,
	IsTargetingWall,
	PartDefinition,
	PartToParentClass
} from 'tv2-common'
import { ControlClasses, GraphicEngine } from 'tv2-constants'
import { SourceLayer } from '../../layers'
import { BlueprintConfig } from '../config'
import { EvaluateCueGraphicInternal } from './graphicInternal'
import { EvaluateCueGraphicPilot } from './graphicPilot'
import { EvaluateCueRouting } from './routing'

export function EvaluateCueGraphic(
	config: BlueprintConfig,
	context: SegmentContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	adlib: boolean,
	partDefinition: PartDefinition,
	rank?: number
) {
	if (parsedCue.routing) {
		EvaluateCueRouting(config, context, pieces, adlibPieces, actions, partId, parsedCue.routing)
	}

	if (GraphicIsInternal(parsedCue)) {
		EvaluateCueGraphicInternal(
			config,
			context,
			pieces,
			adlibPieces,
			actions,
			partId,
			parsedCue,
			adlib,
			partDefinition,
			rank
		)
	} else if (GraphicIsPilot(parsedCue)) {
		EvaluateCueGraphicPilot(config, context, pieces, adlibPieces, actions, partId, parsedCue, adlib, rank)
	}
}

export function GetEnableForGrafik(
	config: BlueprintConfig,
	engine: GraphicEngine,
	cue: CueDefinition,
	isStickyIdent: boolean,
	partDefinition?: PartDefinition
): { while: string } | { start: number } {
	if (IsTargetingWall(engine)) {
		return {
			while: '1'
		}
	}
	if (isStickyIdent) {
		return {
			while: `.${ControlClasses.ShowIdentGraphic} & !.full`
		}
	}

	if (cue.end && cue.end.infiniteMode && cue.end.infiniteMode === 'B' && partDefinition) {
		return { while: `.${PartToParentClass('studio0', partDefinition)} & !.adlib_deparent & !.full` }
	}

	if (config.studio.PreventOverlayWithFull) {
		return {
			while: '!.full'
		}
	} else {
		return {
			start: 0
		}
	}
}

export function GetSourceLayerForGrafik(config: BlueprintConfig, name: string, isStickyIdent: boolean) {
	const conf = config.showStyle.GFXTemplates
		? config.showStyle.GFXTemplates.find(gfk => gfk.VizTemplate.toString() === name)
		: undefined

	if (!conf) {
		return SourceLayer.PgmGraphicsOverlay
	}

	switch (conf.SourceLayer) {
		// TODO: When adding more sourcelayers
		// This is here to guard against bad user input
		case SourceLayer.PgmGraphicsHeadline:
			return SourceLayer.PgmGraphicsHeadline
		case SourceLayer.PgmGraphicsIdent:
			if (isStickyIdent) {
				return SourceLayer.PgmGraphicsIdentPersistent
			}

			return SourceLayer.PgmGraphicsIdent
		case SourceLayer.PgmGraphicsLower:
			return SourceLayer.PgmGraphicsLower
		case SourceLayer.PgmGraphicsOverlay:
			return SourceLayer.PgmGraphicsOverlay
		case SourceLayer.PgmGraphicsTLF:
			return SourceLayer.PgmGraphicsTLF
		case SourceLayer.PgmGraphicsTema:
			return SourceLayer.PgmGraphicsTema
		case SourceLayer.PgmGraphicsTop:
			return SourceLayer.PgmGraphicsTop
		case SourceLayer.WallGraphics:
			return SourceLayer.WallGraphics
		default:
			return SourceLayer.PgmGraphicsOverlay
	}
}

export function GetTimelineLayerForGrafik(config: BlueprintConfig, name: string) {
	const conf = config.showStyle.GFXTemplates
		? config.showStyle.GFXTemplates.find(gfk => gfk.VizTemplate.toString() === name)
		: undefined

	if (!conf) {
		return GraphicLLayer.GraphicLLayerDesign
	}

	switch (conf.LayerMapping) {
		// TODO: When adding more output layers
		case GraphicLLayer.GraphicLLayerOverlayIdent:
			return GraphicLLayer.GraphicLLayerOverlayIdent
		case GraphicLLayer.GraphicLLayerOverlayTopt:
			return GraphicLLayer.GraphicLLayerOverlayTopt
		case GraphicLLayer.GraphicLLayerOverlayLower:
			return GraphicLLayer.GraphicLLayerOverlayLower
		case GraphicLLayer.GraphicLLayerOverlayHeadline:
			return GraphicLLayer.GraphicLLayerOverlayHeadline
		case GraphicLLayer.GraphicLLayerOverlayTema:
			return GraphicLLayer.GraphicLLayerOverlayTema
		case GraphicLLayer.GraphicLLayerWall:
			return GraphicLLayer.GraphicLLayerWall
		default:
			return GraphicLLayer.GraphicLLayerOverlay
	}
}

export function CreateTimingGrafik(
	config: BlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	defaultTime: boolean = true
): { start: number; duration?: number } {
	const ret: { start: number; duration?: number } = { start: 0, duration: 0 }
	const start = cue.start ? CalculateTime(cue.start) : 0
	start !== undefined ? (ret.start = start) : (ret.start = 0)

	const duration = GetGrafikDuration(config, cue, defaultTime)
	const end = cue.end
		? cue.end.infiniteMode
			? undefined
			: CalculateTime(cue.end)
		: duration
		? ret.start + duration
		: undefined
	ret.duration = end ? end - ret.start : undefined

	return ret
}

export function GetGrafikDuration(
	config: BlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	defaultTime: boolean
): number | undefined {
	if (config.showStyle.GFXTemplates) {
		if (GraphicIsInternal(cue)) {
			const template = config.showStyle.GFXTemplates.find(templ =>
				templ.INewsName ? templ.INewsName.toString().toUpperCase() === cue.graphic.template.toUpperCase() : false
			)
			if (template) {
				if (template.OutType && !template.OutType.toString().match(/default/i)) {
					return undefined
				}
			}
		} else if (GraphicIsPilot(cue)) {
			const template = config.showStyle.GFXTemplates.find(templ =>
				templ.INewsName
					? templ.INewsName.toString().toUpperCase() === cue.graphic.vcpid.toString().toUpperCase()
					: false
			)
			if (template) {
				if (template.OutType && !template.OutType.toString().match(/default/i)) {
					return undefined
				}
			}
		}
	}

	return defaultTime ? GetDefaultOut(config) : undefined
}
