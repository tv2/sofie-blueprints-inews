import {
	CueDefinitionGraphic,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	TV2BlueprintConfig
} from 'tv2-common'

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
