import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { CueDefinitionGrafik } from '../inewsConversion'

export function GetFullGrafikTemplateNameFromCue(
	config: TV2BlueprintConfigBase<TV2StudioConfigBase>,
	cue: CueDefinitionGrafik
): string {
	return GetFullGrafikTemplateName(config, cue.template)
}

export function GetFullGrafikTemplateName(
	config: TV2BlueprintConfigBase<TV2StudioConfigBase>,
	iNewsTempalateName: string
): string {
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
