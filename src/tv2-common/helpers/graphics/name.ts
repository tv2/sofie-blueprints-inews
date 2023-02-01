import {
	CueDefinitionGraphic,
	GraphicInternalOrPilot,
	// 	GraphicIsInternal,
	// 	GraphicIsPilot,
	TV2ShowStyleConfig
} from 'tv2-common'

export function GraphicDisplayName(
	_config: TV2ShowStyleConfig,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>
): string {
	// @todo: bring this back
	// if (GraphicIsInternal(parsedCue)) {
	// 	return `${parsedCue.graphic.template ? `${GetFullGraphicTemplateNameFromCue(config, parsedCue)}` : ''}${
	// 		parsedCue.graphic.textFields.length ? ' - ' : ''
	// 	}${parsedCue.graphic.textFields.filter(txt => !txt.match(/^;.\.../i)).join('\n - ')}`
	// } else if (GraphicIsPilot(parsedCue)) {
	// 	return `${parsedCue.graphic.name ? parsedCue.graphic.name : ''}`
	// }

	// Shouldn't be possible
	return parsedCue.iNewsCommand
}
