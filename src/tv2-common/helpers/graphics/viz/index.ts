import { GraphicsContent, IShowStyleUserContext, TSR, WithTimeline } from 'blueprints-integration'
import {
	assertUnreachable,
	CueDefinitionGraphic,
	GetEnableForGraphic,
	GetFullGraphicTemplateNameFromCue,
	GetTimelineLayerForGraphic,
	GraphicInternal,
	IsTargetingFull,
	IsTargetingOVL,
	IsTargetingWall,
	literal,
	PartDefinition,
	PilotGraphicProps,
	TV2BlueprintConfig
} from 'tv2-common'
import { GraphicEngine } from 'tv2-constants'
import { EnableDSK } from '../../dsk'
import { PilotGraphicGenerator } from '../pilot/index'

export class VizPilotGraphicGenerator extends PilotGraphicGenerator {
	constructor(graphicProps: PilotGraphicProps) {
		super(graphicProps)
	}
	public getContent(): WithTimeline<GraphicsContent> {
		return {
			fileName: 'PILOT_' + this.parsedCue.graphic.vcpid.toString(),
			path: this.parsedCue.graphic.vcpid.toString(),
			timelineObjects: [
				literal<TSR.TimelineObjVIZMSEElementPilot>({
					id: '',
					enable: this.getEnable(),
					priority: 1,
					layer: this.getLayerMappingName(),
					content: {
						deviceType: TSR.DeviceType.VIZMSE,
						type: TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT,
						templateVcpId: this.parsedCue.graphic.vcpid,
						continueStep: this.parsedCue.graphic.continueCount,
						noAutoPreloading: false,
						channelName: this.getChannelName(),
						...this.getOutTransitionProperties()
					},
					...(IsTargetingFull(this.engine) ? { classes: ['full'] } : {})
				}),
				...(IsTargetingFull(this.engine)
					? this.settings.viz.createFullPilotTimelineForStudio(this.config, this.context, !!this.adlib)
					: [])
			]
		}
	}

	private getEnable() {
		if (IsTargetingOVL(this.engine) || IsTargetingWall(this.engine)) {
			return GetEnableForGraphic(this.config, this.engine, this.parsedCue, undefined, !!this.adlib)
		}
		return { start: 0 }
	}

	private getChannelName() {
		switch (this.engine) {
			case 'WALL':
				return 'WALL1'
			case 'OVL':
				return 'OVL1'
			case 'FULL':
			case 'TLF':
				return 'FULL1'
			default:
				assertUnreachable(this.engine)
		}
	}

	private getOutTransitionProperties(): Partial<TSR.TimelineObjVIZMSEElementPilot['content']> {
		if (IsTargetingWall(this.engine) || !this.config.studio.PreventOverlayWithFull) {
			return {}
		}
		return {
			delayTakeAfterOutTransition: true,
			outTransition: {
				type: TSR.VIZMSETransitionType.DELAY,
				delay: this.config.studio.VizPilotGraphics.OutTransitionDuration
			}
		}
	}
}

export interface VizPilotGeneratorSettings {
	createFullPilotTimelineForStudio(
		config: TV2BlueprintConfig,
		context: IShowStyleUserContext,
		adlib: boolean
	): TSR.TSRTimelineObj[]
}

export function GetInternalGraphicContentVIZ(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	partDefinition: PartDefinition | undefined,
	mappedTemplate: string,
	adlib: boolean
): WithTimeline<GraphicsContent> {
	return {
		fileName: parsedCue.graphic.template,
		path: parsedCue.graphic.template,
		ignoreMediaObjectStatus: true,
		timelineObjects: literal<TSR.TSRTimelineObj[]>([
			literal<TSR.TimelineObjVIZMSEElementInternal>({
				id: '',
				enable: GetEnableForGraphic(config, engine, parsedCue, partDefinition, adlib),
				priority: 1,
				layer: GetTimelineLayerForGraphic(config, GetFullGraphicTemplateNameFromCue(config, parsedCue)),
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
					templateName: mappedTemplate,
					templateData: parsedCue.graphic.textFields,
					channelName: engine === 'WALL' ? 'WALL1' : 'OVL1', // TODO: TranslateEngine
					showId: findShowName(config, context, engine)
				}
			}),
			// Assume DSK is off by default (config table)
			...EnableDSK(config, 'OVL')
		])
	}
}

function findShowName(config: TV2BlueprintConfig, context: IShowStyleUserContext, engine: GraphicEngine): string {
	const graphicsSetup = config.selectedGraphicsSetup
	switch (engine) {
		case 'FULL':
		case 'WALL':
			if (graphicsSetup.FullShowName === undefined) {
				context.logWarning("You're using Viz graphics with an incompatible ShowStyle")
				return ''
			}
			return graphicsSetup.FullShowName
		case 'TLF':
		case 'OVL':
			return graphicsSetup.OvlShowName
	}
}
