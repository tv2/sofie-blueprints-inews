import { SomeContent, TSR, WithTimeline } from 'blueprints-integration'
import { CreateHTMLRendererContent, EnableDSK, GetTimelineLayerForGraphic, literal } from 'tv2-common'

import { InternalGraphic } from '../internal'

export class HtmlInternalGraphic extends InternalGraphic {
	protected getContent(): WithTimeline<SomeContent> {
		return {
			timelineObjects: this.getTimeline()
		}
	}

	protected getTimeline(): TSR.TSRTimelineObj[] {
		return [
			literal<TSR.TimelineObjCCGTemplate>({
				id: '',
				enable: this.GetEnableForGraphic(),
				priority: 1,
				layer: GetTimelineLayerForGraphic(this.config, this.templateName),
				content: CreateHTMLRendererContent(this.config, this.templateName, { ...this.cue.graphic.textFields })
			}),
			// Assume DSK is off by default (config table)
			...EnableDSK(this.context, 'OVL')
		]
	}
}
