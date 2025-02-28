import { GraphicsContent, TSR, WithTimeline } from 'blueprints-integration'
import {
	findDskFullGfx,
	getDskOnAirTimelineObjects,
	getHtmlTemplateName,
	GetSisyfosTimelineObjForFull,
	IsTargetingFull,
	joinAssetToFolder,
	joinAssetToNetworkPath,
	layerToHTMLGraphicSlot,
	literal,
	PilotGraphicProps,
	TimelineBlueprintExt,
	TransitionStyle
} from 'tv2-common'
import { DskRole } from 'tv2-constants'

import { PilotGraphicGenerator } from '../pilot'

export class HtmlPilotGraphicGenerator extends PilotGraphicGenerator {
	private readonly layerMappingName

	constructor(graphicProps: PilotGraphicProps) {
		super(graphicProps)
		this.layerMappingName = this.getLayerMappingName()
	}
	public getContent(): WithTimeline<GraphicsContent> {
		const graphicFolder = this.config.studio.GraphicFolder ? `${this.config.studio.GraphicFolder}\\` : ''
		const sceneName = this.getSceneName()
		const fileName = joinAssetToFolder(this.config.studio.GraphicFolder, sceneName)
		const absoluteFilePath = `${this.config.studio.HTMLGraphics.GraphicURL}\\${fileName}${this.config.studio.GraphicFileExtension}`
		const payloadType = IsTargetingFull(this.engine) ? 'still' : 'overlay'
		const templateData = {
			display: 'program',
			slots: {
				[layerToHTMLGraphicSlot[this.layerMappingName]]: {
					payload: {
						type: payloadType,
						url: encodeURI(
							absoluteFilePath

								.replace(/\//g, '\\') // Replace forward slash with backward slash
								.replace(/\\/g, '\\\\') // Replace every \ with \\ and encodURI. Double backslash means the HTML template will be able to parse the string correctly. encodeURI so Caspar doesn't mangle the data.
						),
						noAnimation: false
					},
					display: 'program'
				}
			},
			partialUpdate: !IsTargetingFull(this.engine)
		}
		return {
			fileName,
			path: joinAssetToNetworkPath(
				this.config.studio.GraphicNetworkBasePath,
				graphicFolder,
				sceneName,
				this.config.studio.GraphicFileExtension
			),
			mediaFlowIds: [this.config.studio.GraphicMediaFlowId],
			ignoreMediaObjectStatus: this.config.studio.GraphicIgnoreStatus,
			ignoreBlackFrames: true,
			ignoreFreezeFrame: true,
			timelineObjects: [
				literal<TSR.TimelineObjCCGTemplate & TimelineBlueprintExt>({
					id: '',
					enable: {
						while: '1'
					},
					priority: 100,
					layer: this.layerMappingName,
					metaData: { templateData, fileName },
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
						templateType: 'html',
						name: getHtmlTemplateName(this.config),
						data: templateData,
						useStopCommand: false,
						mixer: {
							opacity: 1
						}
					}
				}),
				...(IsTargetingFull(this.engine)
					? this.getFullPilotTimeline()
					: getDskOnAirTimelineObjects(this.context, DskRole.OVERLAYGFX))
			]
		}
	}

	protected getFullPilotTimeline(): TSR.TSRTimelineObj[] {
		const fullDsk = findDskFullGfx(this.config)
		return [
			...this.context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
				enable: {
					start: Number(this.config.studio.CasparPrerollDuration)
				},
				priority: 1,
				content: {
					input: fullDsk.Fill,
					transition: TransitionStyle.WIPE_FOR_GFX,
					transitionDuration: 20
				}
			}),
			...GetSisyfosTimelineObjForFull(this.config)
		]
	}

	private getSceneName() {
		const nameChunks = this.cue.graphic.name.split('/')
		return nameChunks[nameChunks.length - 1]
	}
}
