export * from './slotMappings'

import { IBlueprintPiece, TSR } from '@sofie-automation/blueprints-integration'
import { CueDefinitionGraphic, GraphicInternal, literal, PartDefinition, TV2BlueprintConfig } from 'tv2-common'
import { GraphicEngine } from 'tv2-constants'
import { GetEnableForGraphic, GetTimelineLayerForGraphic } from '..'
import { layerToHTMLGraphicSlot, Slots } from './slotMappings'

export function GetInternalGraphicContentCaspar(
	config: TV2BlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	isIdentGraphic: boolean,
	partDefinition: PartDefinition,
	mappedTemplate: string
): IBlueprintPiece['content'] {
	return {
		timelineObjects: CasparOverlayTimeline(config, engine, parsedCue, isIdentGraphic, partDefinition, mappedTemplate)
	}
}

function CasparOverlayTimeline(
	config: TV2BlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	isIdentGrafik: boolean,
	partDefinition: PartDefinition,
	mappedTemplate: string
): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: GetEnableForGraphic(config, engine, parsedCue, isIdentGrafik, partDefinition),
			priority: 1,
			layer: GetTimelineLayerForGraphic(config, mappedTemplate),
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				templateType: 'html',
				name: 'sport-overlay/index',
				data: `<templateData>${encodeURI(
					JSON.stringify({
						display: 'program',
						slots: HTMLTemplateContent(config, mappedTemplate, parsedCue),
						partialUpdate: true
					})
				)}</templateData>`,
				useStopCommand: false
			}
		})
	]
}

function HTMLTemplateContent(
	config: TV2BlueprintConfig,
	graphicTemplate: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>
): Partial<Slots> {
	const conf = config.showStyle.GFXTemplates.find(g => g.VizTemplate.toLowerCase() === graphicTemplate.toLowerCase())

	if (!conf) {
		return {}
	}

	const layer = conf.LayerMapping

	const slot = layerToHTMLGraphicSlot[layer]

	if (!slot) {
		return {}
	}

	return {
		[slot]: {
			display: 'program',
			payload: {
				type: graphicTemplate,
				...parsedCue.graphic.textFields
			}
		}
	}
}
