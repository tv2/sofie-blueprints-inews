import { PieceLifespan } from 'tv-automation-sofie-blueprints-integration'
import { GraphicEngine } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { LifeSpan } from '../cueTiming'
import { CueDefinitionGraphic } from '../inewsConversion'

export function GetFullGrafikTemplateNameFromCue(config: TV2BlueprintConfig, cue: CueDefinitionGraphic): string {
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

export function GetInfiniteModeForGrafik(
	engine: GraphicEngine,
	config: TV2BlueprintConfig,
	parsedCue: CueDefinitionGraphic,
	isTlf?: boolean,
	isStickyIdent?: boolean
): PieceLifespan {
	return engine === 'WALL'
		? PieceLifespan.OutOnRundownEnd
		: isTlf
		? PieceLifespan.WithinPart
		: isStickyIdent
		? PieceLifespan.OutOnSegmentEnd
		: parsedCue.end && parsedCue.end.infiniteMode
		? LifeSpan(parsedCue.end.infiniteMode, PieceLifespan.WithinPart)
		: FindInfiniteModeFromConfig(config, parsedCue)
}

export function FindInfiniteModeFromConfig(config: TV2BlueprintConfig, parsedCue: CueDefinitionGraphic): PieceLifespan {
	if (config.showStyle.GFXTemplates) {
		const template = GetFullGrafikTemplateNameFromCue(config, parsedCue)
		const conf = config.showStyle.GFXTemplates.find(cnf =>
			cnf.VizTemplate ? cnf.VizTemplate.toString().toUpperCase() === template.toUpperCase() : false
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
