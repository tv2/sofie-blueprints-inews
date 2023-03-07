import { SomeContent, TSR, WithTimeline } from 'blueprints-integration'
import { CreateHTMLRendererContent, getDskOnAirTimelineObjects, getTimelineLayerForGraphic, literal } from 'tv2-common'
import { DskRole, SharedSourceLayer } from 'tv2-constants'

import { InternalGraphic } from '../internal'

export class HtmlInternalGraphic extends InternalGraphic {
	protected getContent(): WithTimeline<SomeContent> {
		return {
			timelineObjects: this.getTimeline()
		}
	}

	protected getSubstituteLayer(sourceLayer: SharedSourceLayer): SharedSourceLayer {
		if (sourceLayer === SharedSourceLayer.PgmGraphicsHeadline) {
			return SharedSourceLayer.PgmGraphicsLower
		}
		return sourceLayer
	}

	protected getTimeline(): TSR.TSRTimelineObj[] {
		return [
			literal<TSR.TimelineObjCCGTemplate>({
				id: '',
				enable: this.getTimelineObjectEnable(),
				priority: 1,
				layer: getTimelineLayerForGraphic(this.config, this.templateName),
				content: CreateHTMLRendererContent(this.config, this.templateName, { ...this.cue.graphic.textFields })
			}),
			// Assume DSK is off by default (config table)
			...getDskOnAirTimelineObjects(this.context, DskRole.OVERLAYGFX)
		]
	}
}
