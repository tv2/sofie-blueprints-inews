import { TSR } from 'blueprints-integration'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'
import { makeMockGalleryContext } from '../../../__mocks__/context'
import { prefixLayer } from '../../../tv2-common/__tests__/testUtil'
import { TV2StudioConfigBase } from '../../../tv2-common/blueprintConfig'
import { AtemSourceIndex } from '../../../types/atem'
import { AuxProps, DskProps, MixEffectProps, SpecialInput, SwitcherType, TransitionStyle } from '../types'
import { VideoSwitcherBase } from '../VideoSwitcher'

const DURATION: number = 50

function createTestee(studioConfigOverrides?: Partial<TV2StudioConfigBase>) {
	const context = makeMockGalleryContext({
		studioConfig: { SwitcherType: SwitcherType.ATEM, ...studioConfigOverrides }
	})
	return VideoSwitcherBase.getVideoSwitcher(context.core, context.config, context.uniformConfig)
}

describe('ATEM', () => {
	describe('Mix Effect', () => {
		const DEFAULT_ME: MixEffectProps = {
			layer: SwitcherMixEffectLLayer.PROGRAM,
			content: {
				input: 5
			}
		}
		test('sets timeline object defaults', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject(DEFAULT_ME)
			expect(timelineObject).toMatchObject({
				id: '',
				enable: { start: 0 },
				priority: 0,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME
				}
			})
		})

		test('sets classes', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject({
				...DEFAULT_ME,
				classes: ['classA', 'classB']
			})
			expect(timelineObject).toMatchObject({
				classes: ['classA', 'classB']
			})
		})

		test('sets metaData', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject({
				...DEFAULT_ME,
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
			expect(timelineObject).toMatchObject({
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
		})

		test('sets layer prefix', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject(DEFAULT_ME)
			expect(timelineObject).toMatchObject({
				layer: prefixLayer(SwitcherMixEffectLLayer.PROGRAM)
			})
		})

		test('sets programInput when no transition provided', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject(DEFAULT_ME)
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						programInput: 5
					}
				}
			})
		})

		test('sets programInput when CUT transition provided', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.PROGRAM,
				content: {
					input: 5,
					transition: TransitionStyle.CUT
				}
			})
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						programInput: 5
					}
				}
			})
		})

		test('sets previewInput', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.PROGRAM,
				content: {
					previewInput: 5
				}
			})
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						previewInput: 5
					}
				}
			})
		})

		test('supports MIX', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.PROGRAM,
				content: {
					input: 5,
					transition: TransitionStyle.MIX,
					transitionDuration: DURATION
				}
			})
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						input: 5,
						transition: TSR.AtemTransitionStyle.MIX,
						transitionSettings: {
							mix: {
								rate: DURATION
							}
						}
					}
				}
			})
		})

		test('supports WIPE', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.PROGRAM,
				content: {
					input: 5,
					transition: TransitionStyle.WIPE,
					transitionDuration: DURATION
				}
			})
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						input: 5,
						transition: TSR.AtemTransitionStyle.WIPE,
						transitionSettings: {
							wipe: {
								rate: DURATION
							}
						}
					}
				}
			})
		})

		test('supports WIPE for GFX', () => {
			const wipeRate = 22
			const atem = createTestee({
				HTMLGraphics: {
					GraphicURL: 'donotcare',
					TransitionSettings: { wipeRate, borderSoftness: 7500, loopOutTransitionDuration: 15 },
					KeepAliveDuration: 120
				}
			})
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.PROGRAM,
				content: {
					input: 5,
					transition: TransitionStyle.WIPE_FOR_GFX
				}
			})
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						input: 5,
						transition: TSR.AtemTransitionStyle.WIPE,
						transitionSettings: {
							wipe: {
								rate: wipeRate,
								pattern: 1,
								reverseDirection: true,
								borderSoftness: 7500
							}
						}
					}
				}
			})
		})

		test('supports DIP', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.PROGRAM,
				content: {
					input: 5,
					transition: TransitionStyle.DIP,
					transitionDuration: DURATION
				}
			})
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						input: 5,
						transition: TSR.AtemTransitionStyle.DIP,
						transitionSettings: {
							dip: {
								rate: DURATION,
								input: AtemSourceIndex.Col2
							}
						}
					}
				}
			})
		})

		test('DIP input is 100 when SwitcherSource.Dip config value is 100', () => {
			assertDipInputValueFromConfig(100)
		})

		test('DIP input is 4 when SwitcherSource.Dip config value is 4', () => {
			assertDipInputValueFromConfig(4)
		})

		function assertDipInputValueFromConfig(dipInputSource: number) {
			const atem = createTestee({
				SwitcherSource: {
					Dip: dipInputSource,
					Default: 1,
					SplitArtFill: 1,
					SplitArtKey: 1,
					DSK: []
				}
			})
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.PROGRAM,
				content: {
					input: 5,
					transition: TransitionStyle.DIP,
					transitionDuration: DURATION
				}
			})
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						input: 5,
						transition: TSR.AtemTransitionStyle.DIP,
						transitionSettings: {
							dip: {
								rate: DURATION,
								input: dipInputSource
							}
						}
					}
				}
			})
		}

		test('supports keyers', () => {
			const atem = createTestee()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.PROGRAM,
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
				content: {
					me: {
						upstreamKeyers: [
							{
								upstreamKeyerId: 0,
								onAir: true,
								mixEffectKeyType: 0,
								flyEnabled: false,
								fillSource: 5,
								cutSource: 6,
								maskEnabled: false,
								lumaSettings: {
									clip: 1250,
									gain: 10
								}
							}
						]
					}
				}
			})
		})
	})

	describe('Aux', () => {
		const DEFAULT_AUX: AuxProps = {
			layer: SwitcherAuxLLayer.CLEAN,
			content: {
				input: 5
			}
		}
		test('sets timeline object defaults', () => {
			const atem = createTestee()
			const timelineObject = atem.getAuxTimelineObject(DEFAULT_AUX)
			expect(timelineObject).toMatchObject({
				id: '',
				enable: { start: 0 },
				priority: 0,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX
				}
			})
		})

		test('sets classes', () => {
			const atem = createTestee()
			const timelineObject = atem.getAuxTimelineObject({
				...DEFAULT_AUX,
				classes: ['classA', 'classB']
			})
			expect(timelineObject).toMatchObject({
				classes: ['classA', 'classB']
			})
		})

		test('sets metaData', () => {
			const atem = createTestee()
			const timelineObject = atem.getAuxTimelineObject({
				...DEFAULT_AUX,
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
			expect(timelineObject).toMatchObject({
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
		})

		test('sets layer prefix', () => {
			const atem = createTestee()
			const timelineObject = atem.getAuxTimelineObject(DEFAULT_AUX)
			expect(timelineObject).toMatchObject({
				layer: prefixLayer(SwitcherAuxLLayer.CLEAN)
			})
		})

		test('sets aux', () => {
			const atem = createTestee()

			const timelineObject = atem.getAuxTimelineObject(DEFAULT_AUX)

			expect(timelineObject).toMatchObject({
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: 5
					}
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
			const atem = createTestee()
			const timelineObject = atem.getDskTimelineObject(DEFAULT_DSK)
			expect(timelineObject).toMatchObject({
				id: '',
				enable: { start: 0 },
				priority: 0,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.DSK
				}
			})
		})

		test('sets classes', () => {
			const atem = createTestee()
			const timelineObject = atem.getDskTimelineObject({
				...DEFAULT_DSK,
				classes: ['classA', 'classB']
			})
			expect(timelineObject).toMatchObject({
				classes: ['classA', 'classB']
			})
		})

		test('sets metaData', () => {
			const atem = createTestee()
			const timelineObject = atem.getDskTimelineObject({
				...DEFAULT_DSK,
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
			expect(timelineObject).toMatchObject({
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
		})

		test('sets layer prefix', () => {
			const atem = createTestee()
			const timelineObject = atem.getDskTimelineObject(DEFAULT_DSK)
			expect(timelineObject).toMatchObject({
				layer: prefixLayer('dsk_1')
			})
		})

		test('enables DSK', () => {
			const atem = createTestee()

			const timelineObject = atem.getDskTimelineObject(DEFAULT_DSK)

			expect(timelineObject).toMatchObject({
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.DSK,
					dsk: {
						onAir: true
					}
				}
			})
		})
	})

	describe('updateUnpopulatedDveBoxes', () => {
		it('updates only unpopulated boxes', () => {
			const testee = createTestee()
			const timelineObject: TSR.TimelineObjAtemSsrc = {
				id: '',
				enable: {},
				layer: '',
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRC,
					ssrc: {
						boxes: [
							{
								enabled: false,
								source: 5
							},
							{
								enabled: true,
								source: SpecialInput.AB_PLACEHOLDER
							},
							{
								enabled: false,
								source: SpecialInput.AB_PLACEHOLDER
							},
							{
								enabled: true,
								source: 2
							}
						]
					}
				}
			}
			const updatedTimelineObject = testee.updateUnpopulatedDveBoxes(timelineObject, 8)
			expect(updatedTimelineObject).toMatchObject({
				content: {
					ssrc: {
						boxes: [
							{
								enabled: false,
								source: 5
							},
							{
								enabled: true,
								source: 8
							},
							{
								enabled: false,
								source: 8
							},
							{
								enabled: true,
								source: 2
							}
						]
					}
				}
			})
		})
	})
})
