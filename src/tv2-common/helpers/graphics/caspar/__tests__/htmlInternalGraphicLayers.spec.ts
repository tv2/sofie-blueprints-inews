import { TSR } from 'blueprints-integration'
import {
	CreateHTMLRendererContent,
	getHtmlGraphicBaseline,
	GetSourceLayerForGraphic,
	GetTimelineLayerForGraphic,
	literal
} from 'tv2-common'
import { SharedGraphicLLayer, SharedSourceLayers } from 'tv2-constants'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../../../../tv2_afvd_showstyle/__tests__/configs'
import { getConfig, parseConfig as parseShowStyleConfig } from '../../../../../tv2_afvd_showstyle/helpers/config'
import { parseConfig as parseStudioConfig } from '../../../../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { SegmentUserContext } from '../../../../../__mocks__/context'

function makeHtmlConfig() {
	const context = new SegmentUserContext('test', mappingsDefaults, parseStudioConfig, parseShowStyleConfig, 'rundown0')
	context.studioConfig = {
		...defaultStudioConfig,
		GraphicsType: 'HTML'
	} as any
	context.showStyleConfig = defaultShowStyleConfig as any

	return getConfig(context)
}

describe('HTML internal graphics layering', () => {
	it('keeps headline and bundt on separate source and timeline layers', () => {
		const config = makeHtmlConfig()

		expect(GetSourceLayerForGraphic(config, 'vo')).toBe(SharedSourceLayers.PgmGraphicsHeadline)
		expect(GetSourceLayerForGraphic(config, 'bund_right')).toBe(SharedSourceLayers.PgmGraphicsLower)
		expect(GetTimelineLayerForGraphic(config, 'vo')).toBe(SharedGraphicLLayer.GraphicLLayerOverlayHeadline)
		expect(GetTimelineLayerForGraphic(config, 'bund_right')).toBe(SharedGraphicLLayer.GraphicLLayerOverlayLower)
	})

	it('maps headline and bundt to separate HTML slots with bundt above headline', () => {
		const config = makeHtmlConfig()
		const headlineContent = CreateHTMLRendererContent(config, 'vo', literal({ text: 'Headline' }))
		const bundtContent = CreateHTMLRendererContent(config, 'bund_right', literal({ line1: 'Line 1', line2: 'Line 2' }))

		expect(headlineContent.data).toMatchObject({
			display: 'program',
			slots: {
				'440_headline': {
					display: 'program',
					payload: {
						type: 'vo',
						text: 'Headline'
					}
				}
			}
		})
		expect(bundtContent.data).toMatchObject({
			display: 'program',
			slots: {
				'450_lowerThird': {
					display: 'program',
					payload: {
						type: 'bund_right',
						line1: 'Line 1',
						line2: 'Line 2'
					}
				}
			}
		})
	})

	it('includes headline in the HTML baseline reset slots', () => {
		const config = makeHtmlConfig()
		const baseline = getHtmlGraphicBaseline(config)
		const headlineBaseline = baseline.find(
			obj => obj.layer === SharedGraphicLLayer.GraphicLLayerOverlayHeadline
		) as TSR.TimelineObjCCGTemplate | undefined
		const compoundBaseline = baseline.find(
			obj => obj.layer === SharedGraphicLLayer.GraphicLLayerOverlay
		) as TSR.TimelineObjCCGTemplate | undefined

		expect(headlineBaseline?.content.data).toMatchObject({
			slots: {
				'440_headline': {
					display: 'hidden',
					payload: {}
				}
			},
			partialUpdate: true
		})
		expect(compoundBaseline?.content.data).toMatchObject({
			slots: {
				'440_headline': {
					display: 'hidden',
					payload: {}
				},
				'450_lowerThird': {
					display: 'hidden',
					payload: {}
				}
			},
			partialUpdate: true
		})
	})
})
