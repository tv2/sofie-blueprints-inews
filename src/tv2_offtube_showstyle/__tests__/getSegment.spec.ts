import { IngestSegment, TSR } from 'blueprints-integration'
import { UnparsedCue } from 'tv2-common'
import { AdlibActionType, SharedSourceLayers } from 'tv2-constants'
import { SegmentUserContext } from '../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../tv2_afvd_showstyle/__tests__/configs'
import { parseConfig as parseStudioConfig } from '../../tv2_offtube_studio/helpers/config'
import mappingsDefaults from '../../tv2_offtube_studio/migrations/mappings-defaults'
import { getSegment } from '../getSegment'
import { parseConfig as parseShowStyleConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

function makeContext(styleColumn: string = 'n') {
	const context = new SegmentUserContext('adlib style', mappingsDefaults, parseStudioConfig, parseShowStyleConfig)
	context.studioConfig = { ...JSON.parse(JSON.stringify(defaultStudioConfig)), GraphicsType: 'HTML' }
	context.showStyleConfig = {
		...JSON.parse(JSON.stringify(defaultShowStyleConfig)),
		GfxDesignTemplates: [
			{ _id: 'news', INewsName: 'DESIGN_NEWS', INewsStyleColumn: styleColumn, VizTemplate: 'DESIGN_NEWS' }
		]
	}
	return context
}

function makeSegment(
	cues: UnparsedCue[],
	layout: string = '',
	body: string = '\r\n<p><a idref="0"></a></p>\r\n'
): IngestSegment {
	return {
		externalId: 'adlib-segment',
		name: 'Adlib story',
		rank: 0,
		parts: [],
		payload: {
			iNewsStory: {
				id: 'adlib-story',
				identifier: 'adlib-story',
				locator: '01',
				fields: {
					title: 'Adlib story',
					modifyDate: '1583748300',
					totalTime: '10',
					tapeTime: '10',
					videoId: 'TEST_VIDEO',
					layout
				},
				meta: {},
				cues,
				body
			}
		}
	}
}

describe('QBox ADLIBPIX style-column selection', () => {
	it.each([
		{ variant: 'server', count: 1, actionId: AdlibActionType.SELECT_SERVER_CLIP },
		{ variant: 'server', count: 2, actionId: AdlibActionType.SELECT_SERVER_CLIP },
		{ variant: 'MORBARN', count: 1, actionId: AdlibActionType.SELECT_DVE },
		{ variant: 'MORBARN', count: 2, actionId: AdlibActionType.SELECT_DVE }
	])('keeps $count $variant adlibs shelf-only with a style selected', async ({ variant, count, actionId }) => {
		const cues = Array.from({ length: count }, () => [`ADLIBPIX=${variant}`, 'INP1=LIVE 1', 'INP2=KAM 1'])
		const body = cues.map((_, index) => `<p><a idref="${index}"></a></p>`).join('\r\n')
		const unstyled = await getSegment(makeContext('unselected'), makeSegment(cues, 'n', body))
		const noStyle = await getSegment(makeContext(), makeSegment(cues, '', body))
		const context = makeContext()
		const styled = await getSegment(context, makeSegment(cues, 'n', body))

		expect(unstyled.segment.isHidden).toBe(true)
		expect(unstyled.segment.showShelf).toBe(true)
		expect(styled).toEqual(unstyled)
		expect(styled.segment).toEqual(noStyle.segment)
		expect(noStyle.parts[0].pieces).toEqual([])
		expect(noStyle.parts[0].actions?.map(action => action.actionId)).toEqual(Array(count).fill(actionId))
		expect(styled.parts).toHaveLength(1)
		expect(styled.parts[0].pieces).toEqual([])
		expect(styled.parts[0].adLibPieces).toEqual([])
		expect(styled.parts[0].actions?.map(action => action.actionId)).toEqual(Array(count).fill(actionId))
		expect(context.getNotes()).toEqual([])
	})

	it('keeps an unmapped style from changing an adlib-only story', async () => {
		const cues = [['ADLIBPIX=MORBARN', 'INP1=LIVE 1', 'INP2=KAM 1']]
		const unstyled = await getSegment(makeContext(), makeSegment(cues))
		const styled = await getSegment(makeContext(), makeSegment(cues, 'unmapped'))

		expect(styled).toEqual(unstyled)
	})

	it.each(['server', 'MORBARN'])('keeps %s shelf-only when ingest appends layout cues', async variant => {
		const context = makeContext()
		const result = await getSegment(
			context,
			makeSegment(
				[[`ADLIBPIX=${variant}`, 'INP1=LIVE 1', 'INP2=KAM 1'], ['DESIGN_LAYOUT=N'], ['DESIGN_BG=N']],
				'n',
				'\r\n<p><cc>Story notes</cc></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p><p><a idref="2"></a></p>'
			)
		)

		expect(result.segment.isHidden).toBe(true)
		expect(result.segment.showShelf).toBe(true)
		expect(result.parts).toHaveLength(1)
		expect(result.parts[0].pieces).toEqual([])
		expect(result.parts[0].actions).toHaveLength(1)
		expect(context.getNotes()).toEqual([])
	})

	it('keeps a layout-derived background from turning an adlib into an on-air part', async () => {
		const context = makeContext()
		context.showStyleConfig.SchemaConfig = [
			{
				_id: 'news',
				schemaName: 'NEWS',
				designIdentifier: 'N',
				vizTemplateName: 'BG_NEWS',
				casparCgDveBgScene: 'BG_NEWS'
			}
		]
		const result = await getSegment(
			context,
			makeSegment(
				[['ADLIBPIX=server'], ['DESIGN_LAYOUT=N'], ['DESIGN_BG=N']],
				'n',
				'<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p><p><a idref="2"></a></p>'
			)
		)

		expect(result.segment.isHidden).toBe(true)
		expect(result.segment.showShelf).toBe(true)
		expect(result.parts[0].pieces).toEqual([])
		expect(result.parts[0].actions).toHaveLength(1)
		expect(context.getNotes()).toEqual([])
	})

	it('puts the style on the camera part rather than the preceding adlib-only part', async () => {
		const cues = [['ADLIBPIX=MORBARN', 'INP1=LIVE 1', 'INP2=KAM 1']]
		const body = '\r\n<p><a idref="0"></a></p>\r\n<p><pi>KAM 1</pi></p>\r\n'
		const unstyled = await getSegment(makeContext(), makeSegment(cues, '', body))
		const context = makeContext()
		const styled = await getSegment(context, makeSegment(cues, 'n', body))

		expect(styled.segment.isHidden).toBe(false)
		expect(styled.segment.showShelf).toBe(true)
		expect(styled.parts).toHaveLength(2)
		expect(styled.parts[0]).toEqual(unstyled.parts[0])
		expect(styled.parts[0].pieces).toEqual([])
		expect(styled.parts[0].actions).toHaveLength(1)
		expect(styled.parts[1].pieces.map(piece => piece.sourceLayerId)).toEqual([
			SharedSourceLayers.PgmCam,
			SharedSourceLayers.PgmDesign
		])
		expect(styled.parts[1].pieces[1].content.timelineObjects[0].content.deviceType).toBe(TSR.DeviceType.CASPARCG)
		expect(context.getNotes()).toEqual([])
	})

	it('moves ingest layout cues from an adlib-only part to the camera part', async () => {
		const context = makeContext()
		context.showStyleConfig.SchemaConfig = [
			{
				_id: 'news',
				schemaName: 'NEWS',
				designIdentifier: 'N',
				vizTemplateName: 'BG_NEWS',
				casparCgDveBgScene: 'BG_NEWS'
			}
		]
		const result = await getSegment(
			context,
			makeSegment(
				[['ADLIBPIX=server'], ['DESIGN_LAYOUT=N'], ['DESIGN_BG=N']],
				'n',
				'<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p><p><a idref="2"></a></p>\r\n<p><pi>KAM 1</pi></p>'
			)
		)

		expect(result.parts).toHaveLength(2)
		expect(result.parts[0].pieces).toEqual([])
		expect(result.parts[0].actions).toHaveLength(1)
		expect(result.parts[1].pieces.some(piece => piece.sourceLayerId === SharedSourceLayers.PgmDesign)).toBe(true)
		expect(result.parts[1].pieces.some(piece => piece.sourceLayerId === OfftubeSourceLayer.PgmDVEBackground)).toBe(true)
		expect(context.getNotes()).toEqual([])
	})

	it('preserves the style and timed background on a camera part containing an adlib', async () => {
		const context = makeContext()
		const result = await getSegment(
			context,
			makeSegment(
				[
					['ADLIBPIX=MORBARN', 'INP1=LIVE 1', 'INP2=KAM 1'],
					['VIZ=dve-triopage', 'GRAFIK=BG_LOADER_NEWS', ';0.00.02']
				],
				'n',
				'\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n'
			)
		)

		expect(result.segment.isHidden).toBe(false)
		expect(result.segment.showShelf).toBe(true)
		expect(result.parts).toHaveLength(1)
		expect(result.parts[0].actions?.map(action => action.actionId)).toEqual([AdlibActionType.SELECT_DVE])
		expect(result.parts[0].pieces.map(piece => piece.sourceLayerId)).toEqual([
			SharedSourceLayers.PgmCam,
			OfftubeSourceLayer.PgmDVEBackground,
			SharedSourceLayers.PgmDesign
		])
		expect(result.parts[0].pieces[1].enable.start).toBe(80)
		expect(context.getNotes()).toEqual([])
	})

	it('preserves style selection on a scripted part containing an adlib', async () => {
		const context = makeContext()
		const result = await getSegment(
			context,
			makeSegment(
				[['ADLIBPIX=MORBARN', 'INP1=LIVE 1', 'INP2=KAM 1']],
				'n',
				'\r\n<p><a idref="0"></a></p>\r\n<p>Some script</p>\r\n'
			)
		)

		expect(result.segment.isHidden).toBe(false)
		expect(result.segment.showShelf).toBe(true)
		expect(result.parts).toHaveLength(1)
		expect(result.parts[0].actions).toHaveLength(1)
		expect(result.parts[0].pieces.map(piece => piece.sourceLayerId)).toEqual([
			SharedSourceLayers.PgmDesign,
			SharedSourceLayers.PgmScript
		])
		expect(context.getNotes()).toEqual([])
	})

	it('preserves an explicit design cue alongside an adlib', async () => {
		const context = makeContext()
		const result = await getSegment(
			context,
			makeSegment(
				[
					['ADLIBPIX=MORBARN', 'INP1=LIVE 1', 'INP2=KAM 1'],
					['KG=DESIGN_NEWS', ';0.00.02']
				],
				'n',
				'\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n'
			)
		)

		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(1)
		expect(result.parts[0].actions).toHaveLength(1)
		expect(result.parts[0].pieces.map(piece => piece.sourceLayerId)).toEqual([SharedSourceLayers.PgmDesign])
		expect(context.getNotes()).toEqual([])
	})
})
