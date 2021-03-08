import { PieceLifespan } from '@sofie-automation/blueprints-integration'
import { GraphicEngine } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { LifeSpan } from '../cueTiming'
import { CueDefinitionGraphic, GraphicInternalOrPilot, GraphicIsInternal, GraphicIsPilot } from '../inewsConversion'
import { SharedSourceLayers } from '../layers'

export function GraphicDisplayName(
	config: TV2BlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>
): string {
	if (GraphicIsInternal(parsedCue)) {
		return `${parsedCue.graphic.template ? `${GetFullGraphicTemplateNameFromCue(config, parsedCue)}` : ''}${
			parsedCue.graphic.textFields.length ? ' - ' : ''
		}${parsedCue.graphic.textFields.filter(txt => !txt.match(/^;.\.../i)).join('\n - ')}`
	} else if (GraphicIsPilot(parsedCue)) {
		return `${parsedCue.graphic.name ? parsedCue.graphic.name : ''}`
	}

	// Shouldn't be possible
	return parsedCue.iNewsCommand
}

export function GetFullGraphicTemplateNameFromCue(
	config: TV2BlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>
): string {
	if (cue.graphic.type === 'pilot') {
		return cue.graphic.name
	} else {
		return GetFullGrafikTemplateName(config, cue.graphic.template)
	}
}

export function GetFullGrafikTemplateName(config: TV2BlueprintConfig, iNewsTempalateName: string): string {
	if (config.showStyle.GFXTemplates) {
		const template = config.showStyle.GFXTemplates.find(templ =>
			templ.INewsName ? templ.INewsName.toString().toUpperCase() === iNewsTempalateName.toUpperCase() : false
		)
		if (template && template.VizTemplate.toString().length) {
			return template.VizTemplate.toString()
		}
	}

	// This means unconfigured templates will still be supported, with default out.
	return iNewsTempalateName
}

export function GetInfiniteModeForGraphic(
	engine: GraphicEngine,
	config: TV2BlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	isStickyIdent?: boolean
): PieceLifespan {
	return IsTargetingWall(engine)
		? PieceLifespan.OutOnRundownEnd
		: IsTargetingTLF(engine)
		? PieceLifespan.WithinPart
		: isStickyIdent
		? PieceLifespan.OutOnSegmentEnd
		: parsedCue.end && parsedCue.end.infiniteMode
		? LifeSpan(parsedCue.end.infiniteMode, PieceLifespan.WithinPart)
		: FindInfiniteModeFromConfig(config, parsedCue)
}

export function FindInfiniteModeFromConfig(
	config: TV2BlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>
): PieceLifespan {
	if (config.showStyle.GFXTemplates) {
		const template = GetFullGraphicTemplateNameFromCue(config, parsedCue)
		const iNewsName = GraphicIsInternal(parsedCue) ? parsedCue.graphic.template : undefined
		const conf = config.showStyle.GFXTemplates.find(cnf =>
			cnf.VizTemplate
				? cnf.VizTemplate.toString().toUpperCase() === template.toUpperCase() &&
				  (iNewsName ? cnf.INewsName.toUpperCase() === iNewsName.toUpperCase() : true)
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

		return LifeSpan(type, PieceLifespan.WithinPart)
	}

	return PieceLifespan.WithinPart
}

export function IsTargetingFull(engine: GraphicEngine) {
	return engine === 'FULL' || IsTargetingTLF(engine)
}

export function IsTargetingOVL(engine: GraphicEngine) {
	return engine === 'OVL'
}

export function IsTargetingWall(engine: GraphicEngine) {
	return engine === 'WALL'
}

export function IsTargetingTLF(engine: GraphicEngine) {
	return engine === 'TLF'
}

export function GetSourceLayerForGrafik(config: TV2BlueprintConfig, name: string, isStickyIdent?: boolean) {
	const conf = config.showStyle.GFXTemplates
		? config.showStyle.GFXTemplates.find(gfk => gfk.VizTemplate.toString() === name)
		: undefined

	if (!conf) {
		return SharedSourceLayers.PgmGraphicsOverlay
	}

	switch (conf.SourceLayer) {
		// TODO: When adding more sourcelayers
		// This is here to guard against bad user input
		case SharedSourceLayers.PgmGraphicsHeadline:
			return SharedSourceLayers.PgmGraphicsHeadline
		case SharedSourceLayers.PgmGraphicsIdent:
			if (isStickyIdent) {
				return SharedSourceLayers.PgmGraphicsIdentPersistent
			}

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
