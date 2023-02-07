import { PieceLifespan, TSR } from 'blueprints-integration'
import { CueDefinitionGraphic, GraphicPilot, HtmlPilotGraphicGenerator, literal } from 'tv2-common'
import { CueType, SharedGraphicLLayer } from 'tv2-constants'
import { makeMockGalleryContext } from '../../../../../__mocks__/context'

function makeMockContext() {
	// @todo: perhaps make the tests run with two contexts
	return makeMockGalleryContext()
}

function makeGenerator(cue: CueDefinitionGraphic<GraphicPilot>) {
	const context = makeMockContext()
	const generator = new HtmlPilotGraphicGenerator({
		context,
		partId: 'part01',
		parsedCue: cue,
		segmentExternalId: ''
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
					(tlObject as TSR.TimelineObjCCGTemplate).content.type === TSR.TimelineContentTypeCasparCg.TEMPLATE
			)
			expect(timelineObjects.length).toBe(1)
			expect(timelineObjects[0].layer).toBe(SharedGraphicLLayer.GraphicLLayerOverlayPilot)
			expect(timelineObjects[0].content).toMatchObject(
				literal<Partial<TSR.TimelineObjCCGTemplate['content']>>({
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
					(tlObject as TSR.TimelineObjAtemDSK).content.type === TSR.TimelineContentTypeAtem.DSK
			)
			expect(timelineObjects.length).toBe(1)
			expect((timelineObjects[0] as TSR.TimelineObjAtemDSK).content.dsk.onAir).toBe(true)
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
					(tlObject as TSR.TimelineObjCCGTemplate).content.type === TSR.TimelineContentTypeCasparCg.TEMPLATE
			)
			expect(timelineObjects.length).toBe(1)
			expect(timelineObjects[0].layer).toBe(SharedGraphicLLayer.GraphicLLayerPilot)
			expect(timelineObjects[0].content).toMatchObject(
				literal<Partial<TSR.TimelineObjCCGTemplate['content']>>({
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
