import { TSR } from 'blueprints-integration'
import { literal } from 'tv2-common'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'
import { makeMockGalleryContext } from '../../../__mocks__/context'
import { TV2StudioConfigBase } from '../../../tv2-common/blueprintConfig'
import { AuxProps, DskProps, MixEffectProps, SwitcherType, TransitionStyle } from '../types'
import { VideoSwitcherImpl } from '../VideoSwitcher'

const DURATION_FRAMES: number = 50
const DURATION_SECONDS: number = DURATION_FRAMES / 25

function setupTriCaster(studioConfigOverrides?: Partial<TV2StudioConfigBase>) {
	// @todo: is this the correct way?
	const context = makeMockGalleryContext({
		studioConfig: { SwitcherType: SwitcherType.TRICASTER, ...studioConfigOverrides }
	})
	return VideoSwitcherImpl.getVideoSwitcher(context.core, context.config, context.uniformConfig)
}

describe('TriCaster', () => {
	describe('Mix Effect', () => {
		const DEFAULT_ME: MixEffectProps = {
			layer: SwitcherMixEffectLLayer.Program,
			content: {
				input: 5
			}
		}
		test('sets timeline object defaults', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getMixEffectTimelineObject(DEFAULT_ME)
			expect(timelineObject).toMatchObject({
				id: '',
				enable: { start: 0 },
				priority: 0,
				content: {
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.ME
				}
			})
		})

		test('sets classes', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getMixEffectTimelineObject({
				...DEFAULT_ME,
				classes: ['classA', 'classB']
			})
			expect(timelineObject).toMatchObject({
				classes: ['classA', 'classB']
			})
		})

		test('sets metaData', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getMixEffectTimelineObject({
				...DEFAULT_ME,
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
			expect(timelineObject).toMatchObject({
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
		})

		test('sets layer prefix', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getMixEffectTimelineObject(DEFAULT_ME)
			expect(timelineObject).toMatchObject({
				layer: prefixLayer(SwitcherMixEffectLLayer.Program)
			})
		})

		test('sets programInput', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getMixEffectTimelineObject(DEFAULT_ME)
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						programInput: 'input5'
					}
				}
			})
		})

		test('sets previewInput', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
				content: {
					previewInput: 5
				}
			})
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						previewInput: 'input5'
					}
				}
			})
		})

		test('supports MIX', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
				content: {
					input: 5,
					transition: TransitionStyle.MIX,
					transitionDuration: DURATION_FRAMES
				}
			})
			expect(timelineObject).toMatchObject({
				content: literal<TSR.TimelineObjTriCasterME['content']>({
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.ME,
					me: {
						programInput: 'input5',
						transitionEffect: 'fade',
						transitionDuration: DURATION_SECONDS
					}
				})
			})
		})

		test('supports WIPE', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
				content: {
					input: 3,
					transition: TransitionStyle.WIPE,
					transitionDuration: DURATION_FRAMES
				}
			})
			expect(timelineObject).toMatchObject({
				content: literal<TSR.TimelineObjTriCasterME['content']>({
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.ME,
					me: {
						programInput: 'input3',
						transitionEffect: 3,
						transitionDuration: DURATION_SECONDS
					}
				})
			})
		})

		test('supports WIPE for GFX', () => {
			const wipeRate = 22
			const triCaster = setupTriCaster({
				HTMLGraphics: {
					GraphicURL: 'donotcare',
					TransitionSettings: { wipeRate, borderSoftness: 20, loopOutTransitionDuration: 15 },
					KeepAliveDuration: 120
				}
			})
			const timelineObject = triCaster.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
				content: {
					input: 5,
					transition: TransitionStyle.WIPE_FOR_GFX
				}
			})
			expect(timelineObject).toMatchObject({
				content: literal<TSR.TimelineObjTriCasterME['content']>({
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.ME,
					me: {
						programInput: 'input5',
						transitionEffect: 4,
						transitionDuration: wipeRate / 25
					}
				})
			})
		})

		test('supports DIP', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
				content: {
					input: 5,
					transition: TransitionStyle.DIP,
					transitionDuration: DURATION_FRAMES
				}
			})
			expect(timelineObject).toMatchObject({
				content: literal<TSR.TimelineObjTriCasterME['content']>({
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.ME,
					me: {
						programInput: 'input5',
						transitionEffect: 2,
						transitionDuration: DURATION_SECONDS
					}
				})
			})
		})

		test('supports keyers', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
				content: {
					keyers: [
						{
							onAir: true,
							config: {
								Number: 0,
								Fill: 5,
								Key: 6,
								Clip: 125,
								Gain: 1
							}
						}
					]
				}
			})
			expect(timelineObject).toMatchObject({
				content: literal<TSR.TimelineObjTriCasterME['content']>({
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.ME,
					me: {
						keyers: {
							dsk1: {
								onAir: true,
								input: 'input5'
							}
						}
					}
				})
			})
		})
	})

	describe('Aux', () => {
		const DEFAULT_AUX: AuxProps = {
			layer: SwitcherAuxLLayer.AuxClean,
			content: {
				input: 5
			}
		}
		test('sets timeline object defaults', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getAuxTimelineObject(DEFAULT_AUX)
			expect(timelineObject).toMatchObject({
				id: '',
				enable: { start: 0 },
				priority: 0,
				content: {
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.MIX_OUTPUT
				}
			})
		})

		test('sets classes', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getAuxTimelineObject({
				...DEFAULT_AUX,
				classes: ['classA', 'classB']
			})
			expect(timelineObject).toMatchObject({
				classes: ['classA', 'classB']
			})
		})

		test('sets metaData', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getAuxTimelineObject({
				...DEFAULT_AUX,
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
			expect(timelineObject).toMatchObject({
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
		})

		test('sets layer prefix', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getAuxTimelineObject(DEFAULT_AUX)
			expect(timelineObject).toMatchObject({
				layer: prefixLayer(SwitcherAuxLLayer.AuxClean)
			})
		})

		test('sets aux source', () => {
			const triCaster = setupTriCaster()

			const timelineObject = triCaster.getAuxTimelineObject(DEFAULT_AUX)

			expect(timelineObject).toMatchObject({
				content: {
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.MIX_OUTPUT,
					source: 'input5'
				}
			})
		})
	})

	describe('DSK', () => {
		const DEFAULT_DSK: DskProps = {
			layer: 'dsk_1',
			content: {
				onAir: true,
				config: {
					Number: 0,
					Fill: 5,
					Key: 6,
					Clip: 125,
					Gain: 1
				}
			}
		}
		test('sets timeline object defaults', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getDskTimelineObject(DEFAULT_DSK)
			expect(timelineObject).toMatchObject({
				id: '',
				enable: { start: 0 },
				priority: 0,
				content: {
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.ME
				}
			})
		})

		test('sets classes', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getDskTimelineObject({
				...DEFAULT_DSK,
				classes: ['classA', 'classB']
			})
			expect(timelineObject).toMatchObject({
				classes: ['classA', 'classB']
			})
		})

		test('sets metaData', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getDskTimelineObject({
				...DEFAULT_DSK,
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
			expect(timelineObject).toMatchObject({
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
		})

		test('sets layer prefix', () => {
			const triCaster = setupTriCaster()
			const timelineObject = triCaster.getDskTimelineObject(DEFAULT_DSK)
			expect(timelineObject).toMatchObject({
				layer: prefixLayer('dsk_1')
			})
		})

		test('enables DSK', () => {
			const triCaster = setupTriCaster()

			const timelineObject = triCaster.getDskTimelineObject(DEFAULT_DSK)

			expect(timelineObject).toMatchObject({
				content: literal<TSR.TimelineObjTriCasterME['content']>({
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.ME,
					me: {
						keyers: {
							dsk1: {
								onAir: true
							}
						}
					}
				})
			})
		})
	})
})

export function prefixLayer(layerName: string) {
	return 'tricaster_' + layerName
}
