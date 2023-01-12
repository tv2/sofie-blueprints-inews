import { IBlueprintRundownDB, PieceLifespan, PlaylistTimingType, TSR } from 'blueprints-integration'
import { CueDefinitionGraphic, GraphicPilot, HtmlPilotGraphicGenerator, literal } from 'tv2-common'
import { CueType, SharedGraphicLLayer } from 'tv2-constants'
import { SegmentUserContext } from '../../../../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../../../../tv2_afvd_showstyle/__tests__/configs'
import { getConfig, parseConfig as parseShowStyleConfig } from '../../../../../tv2_afvd_showstyle/helpers/config'
import { parseConfig as parseStudioConfig } from '../../../../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { pilotGeneratorSettingsOfftube } from '../../../../../tv2_offtube_showstyle/cues/OfftubeGraphics'

const RUNDOWN_EXTERNAL_ID = 'TEST.SOFIE.JEST'
function makeMockContext() {
	const rundown = literal<IBlueprintRundownDB>({
		externalId: RUNDOWN_EXTERNAL_ID,
		name: RUNDOWN_EXTERNAL_ID,
		_id: '',
		showStyleVariantId: '',
		timing: {
			type: PlaylistTimingType.None
		}
	})
	const mockContext = new SegmentUserContext(
		'test',
		mappingsDefaults,
		parseStudioConfig,
		parseShowStyleConfig,
		rundown._id
	)
	mockContext.studioConfig = defaultStudioConfig as any
	mockContext.showStyleConfig = defaultShowStyleConfig as any
	return mockContext
}

function makeGenerator(cue: CueDefinitionGraphic<GraphicPilot>) {
	const context = makeMockContext()
	const config = getConfig(context)
	const generator = new HtmlPilotGraphicGenerator({
		config,
		context,
		partId: 'part01',
		parsedCue: cue,
		segmentExternalId: '',
		settings: pilotGeneratorSettingsOfftube
	})
	return generator
}

function makeGeneratorForOvl() {
	return makeGenerator({
		type: CueType.Graphic,
		target: 'OVL',
		graphic: {
			type: 'pilot',
			name: 'SomeString/MY_PILOT_NAME',
			vcpid: 654321,
			continueCount: -1
		},
		iNewsCommand: ''
	})
}

function makeGeneratorForFull() {
	return makeGenerator({
		type: CueType.Graphic,
		target: 'FULL',
		graphic: {
			type: 'pilot',
			name: 'MY_PILOT_NAME',
			vcpid: 654321,
			continueCount: -1
		},
		iNewsCommand: ''
	})
}

describe('HtmlPilotGraphicGenerator', () => {
	describe('OVL target', () => {
		it('Uses folder and scene name as fileName', () => {
			const generator = makeGeneratorForOvl()
			const pilotContent = generator.getContent()
			expect(pilotContent.fileName).toBe('pilot-images/MY_PILOT_NAME')
		})
		it('Makes a path including share, fileName and extension', () => {
			const generator = makeGeneratorForOvl()
			const pilotContent = generator.getContent()
			expect(pilotContent.path).toBe('networkshare\\somefolder\\pilot-images\\MY_PILOT_NAME.png')
		})
		it('Makes a template timeline object', () => {
			const generator = makeGeneratorForOvl()
			const pilotContent = generator.getContent()
			const timelineObjects = pilotContent.timelineObjects.filter(
				tlObject =>
					tlObject.content.deviceType === TSR.DeviceType.CASPARCG &&
					(tlObject as TSR.TSRTimelineObj<TSR.TimelineContentCCGTemplate>).content.type ===
						TSR.TimelineContentTypeCasparCg.TEMPLATE
			)
			expect(timelineObjects.length).toBe(1)
			expect(timelineObjects[0].layer).toBe(SharedGraphicLLayer.GraphicLLayerOverlayPilot)
			expect(timelineObjects[0].content).toMatchObject(
				literal<Partial<TSR.TimelineContentCCGTemplate>>({
					templateType: 'html',
					name: 'html-package-folder/index',
					data: {
						display: 'program',
						slots: {
							'260_overlay': {
								payload: {
									type: 'overlay',
									url: encodeURI('E:\\\\somepath\\\\pilot-images\\\\MY_PILOT_NAME.png'),
									noAnimation: false
								},
								display: 'program'
							}
						}
					},
					useStopCommand: false,
					mixer: {
						opacity: 100
					}
				})
			)
		})
		it('Enables a DSK', () => {
			const generator = makeGeneratorForOvl()
			const pilotContent = generator.getContent()
			const timelineObjects = pilotContent.timelineObjects.filter(
				tlObject =>
					tlObject.content.deviceType === TSR.DeviceType.ATEM &&
					(tlObject as TSR.TSRTimelineObj<TSR.TimelineContentAtemDSK>).content.type === TSR.TimelineContentTypeAtem.DSK
			)
			expect(timelineObjects.length).toBe(1)
			expect((timelineObjects[0] as TSR.TSRTimelineObj<TSR.TimelineContentAtemDSK>).content.dsk.onAir).toBe(true)
		})
		it('Applies cue timing', () => {
			const generator = makeGenerator({
				type: CueType.Graphic,
				target: 'OVL',
				graphic: {
					type: 'pilot',
					name: 'SomeString/MY_PILOT_NAME',
					vcpid: 654321,
					continueCount: -1
				},
				start: { seconds: 10 },
				end: { infiniteMode: 'S' },
				iNewsCommand: ''
			})
			const pilotPiece = generator.createPiece()
			expect(pilotPiece.enable).toEqual({ start: 10000 })
			expect(pilotPiece.lifespan).toBe(PieceLifespan.OutOnSegmentEnd)
		})
	})
	describe('FULL target', () => {
		it('Makes a path including  share, fileName and extension', () => {
			const generator = makeGeneratorForFull()
			const pilotContent = generator.getContent()
			expect(pilotContent.path).toBe('networkshare\\somefolder\\pilot-images\\MY_PILOT_NAME.png')
		})
		it('Makes a template timeline object', () => {
			const generator = makeGeneratorForFull()
			const pilotContent = generator.getContent()
			const timelineObjects = pilotContent.timelineObjects.filter(
				tlObject =>
					tlObject.content.deviceType === TSR.DeviceType.CASPARCG &&
					(tlObject as TSR.TSRTimelineObj<TSR.TimelineContentCCGTemplate>).content.type ===
						TSR.TimelineContentTypeCasparCg.TEMPLATE
			)
			expect(timelineObjects.length).toBe(1)
			expect(timelineObjects[0].layer).toBe(SharedGraphicLLayer.GraphicLLayerPilot)
			expect(timelineObjects[0].content).toMatchObject(
				literal<Partial<TSR.TimelineContentCCGTemplate>>({
					templateType: 'html',
					name: 'html-package-folder/index',
					data: {
						display: 'program',
						slots: {
							'250_full': {
								payload: {
									type: 'still',
									url: encodeURI('E:\\\\somepath\\\\pilot-images\\\\MY_PILOT_NAME.png'),
									noAnimation: false
								},
								display: 'program'
							}
						}
					},
					useStopCommand: false,
					mixer: {
						opacity: 100
					}
				})
			)
		})
	})
})
