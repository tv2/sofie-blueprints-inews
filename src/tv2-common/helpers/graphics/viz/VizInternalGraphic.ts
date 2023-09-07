import { ExpectedPlayoutItemGeneric, SomeContent, TSR, WithTimeline } from 'blueprints-integration'
import { getDskOnAirTimelineObjects, getTimelineLayerForGraphic, literal } from 'tv2-common'
import { DskRole, SharedGraphicLLayer } from 'tv2-constants'

import { InternalGraphic } from '../internal'

export const OVL_SHOW_PLACEHOLDER = 'ovl_show_placeholder'
export const FULL_SHOW_PLACEHOLDER = 'full_show_placeholder'

export class VizInternalGraphic extends InternalGraphic {
	protected getContent(): WithTimeline<SomeContent> {
		return {
			fileName: this.cue.graphic.template,
			path: this.cue.graphic.template,
			ignoreMediaObjectStatus: true,
			timelineObjects: literal<TSR.TSRTimelineObj[]>([
				literal<TSR.TimelineObjVIZMSEElementInternal>({
					id: '',
					enable: this.getTimelineObjectEnable(),
					priority: 1,
					layer: getTimelineLayerForGraphic(this.config, this.templateName),
					content: {
						deviceType: TSR.DeviceType.VIZMSE,
						type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
						templateName: this.templateName,
						templateData: this.cue.graphic.textFields,
						channelName: this.getChannelName(),
						showName: this.getShowName()
					},
					keyframes: this.getShowKeyframes()
				}),
				// Assume DSK is off by default (config table)
				...getDskOnAirTimelineObjects(this.context, DskRole.OVERLAYGFX)
			])
		}
	}

	protected getExpectedPlayoutItems(): ExpectedPlayoutItemGeneric[] {
		return [
			{
				deviceSubType: TSR.DeviceType.VIZMSE,
				content: {
					templateName: this.templateName,
					templateData: this.getTemplateData(),
					channel: this.getChannelName(),
					showLayer: this.getShowLayer()
				}
			}
		]
	}

	private getShowLayer(): string {
		switch (this.engine) {
			case 'FULL':
			case 'WALL':
				return SharedGraphicLLayer.GraphicLLayerInitFull
			case 'TLF':
			case 'OVL':
				return SharedGraphicLLayer.GraphicLLayerInitOverlay
		}
	}

	private getShowName(): string {
		switch (this.engine) {
			case 'FULL':
			case 'WALL':
				return FULL_SHOW_PLACEHOLDER
			case 'TLF':
			case 'OVL':
				return OVL_SHOW_PLACEHOLDER
		}
	}

	private getShowKeyframes(): TSR.TimelineObjVIZMSEElementInternal['keyframes'] {
		switch (this.engine) {
			case 'FULL':
			case 'WALL':
				return this.config.vizShowKeyframes.full
			case 'TLF':
			case 'OVL':
				return this.config.vizShowKeyframes.overlay
		}
	}

	private getChannelName(): string {
		return this.engine === 'WALL' ? 'WALL1' : 'OVL1'
	}
}
