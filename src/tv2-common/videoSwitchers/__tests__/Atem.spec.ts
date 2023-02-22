import { TSR } from 'blueprints-integration'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'
import { makeMockGalleryContext } from '../../../__mocks__/context'
import { prefixLayer } from '../../../tv2-common/__tests__/testUtil'
import { TV2StudioConfigBase } from '../../../tv2-common/blueprintConfig'
import { AtemSourceIndex } from '../../../types/atem'
import { AuxProps, DskProps, MixEffectProps, SwitcherType, TransitionStyle } from '../types'
import { VideoSwitcherImpl } from '../VideoSwitcher'

const DURATION: number = 50

function setupAtem(studioConfigOverrides?: Partial<TV2StudioConfigBase>) {
	// @todo: is this the correct way?
	const context = makeMockGalleryContext({
		studioConfig: { SwitcherType: SwitcherType.ATEM, ...studioConfigOverrides }
	})
	return VideoSwitcherImpl.getVideoSwitcher(context.core, context.config, context.uniformConfig)
}

describe('ATEM', () => {
	describe('Mix Effect', () => {
		const DEFAULT_ME: MixEffectProps = {
			layer: SwitcherMixEffectLLayer.Program,
			content: {
				input: 5
			}
		}
		test('sets timeline object defaults', () => {
			const atem = setupAtem()
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
			const atem = setupAtem()
			const timelineObject = atem.getMixEffectTimelineObject({
				...DEFAULT_ME,
				classes: ['classA', 'classB']
			})
			expect(timelineObject).toMatchObject({
				classes: ['classA', 'classB']
			})
		})

		test('sets metaData', () => {
			const atem = setupAtem()
			const timelineObject = atem.getMixEffectTimelineObject({
				...DEFAULT_ME,
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
			expect(timelineObject).toMatchObject({
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
		})

		test('sets layer prefix', () => {
			const atem = setupAtem()
			const timelineObject = atem.getMixEffectTimelineObject(DEFAULT_ME)
			expect(timelineObject).toMatchObject({
				layer: prefixLayer(SwitcherMixEffectLLayer.Program)
			})
		})

		test('sets programInput when no transition provided', () => {
			const atem = setupAtem()
			const timelineObject = atem.getMixEffectTimelineObject(DEFAULT_ME)
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						programInput: 5
					}
				}
			})
		})

		test('sets input when CUT transition provided', () => {
			const atem = setupAtem()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
				content: {
					input: 5,
					transition: TransitionStyle.CUT
				}
			})
			expect(timelineObject).toMatchObject({
				content: {
					me: {
						input: 5,
						transition: TSR.AtemTransitionStyle.CUT
					}
				}
			})
		})

		test('sets previewInput', () => {
			const atem = setupAtem()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
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
			const atem = setupAtem()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
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
			const atem = setupAtem()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
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
			const atem = setupAtem({
				HTMLGraphics: {
					GraphicURL: 'donotcare',
					TransitionSettings: { wipeRate, borderSoftness: 7500, loopOutTransitionDuration: 15 },
					KeepAliveDuration: 120
				}
			})
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
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
			const atem = setupAtem()
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
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
			const atem = setupAtem({
				SwitcherSource: {
					Dip: dipInputSource,
					Default: 1,
					SplitArtFill: 1,
					SplitArtKey: 1,
					DSK: []
				}
			})
			const timelineObject = atem.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
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
			const atem = setupAtem()
			const timelineObject = atem.getMixEffectTimelineObject({
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
			layer: SwitcherAuxLLayer.AuxClean,
			content: {
				input: 5
			}
		}
		test('sets timeline object defaults', () => {
			const atem = setupAtem()
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
			const atem = setupAtem()
			const timelineObject = atem.getAuxTimelineObject({
				...DEFAULT_AUX,
				classes: ['classA', 'classB']
			})
			expect(timelineObject).toMatchObject({
				classes: ['classA', 'classB']
			})
		})

		test('sets metaData', () => {
			const atem = setupAtem()
			const timelineObject = atem.getAuxTimelineObject({
				...DEFAULT_AUX,
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
			expect(timelineObject).toMatchObject({
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
		})

		test('sets layer prefix', () => {
			const atem = setupAtem()
			const timelineObject = atem.getAuxTimelineObject(DEFAULT_AUX)
			expect(timelineObject).toMatchObject({
				layer: prefixLayer(SwitcherAuxLLayer.AuxClean)
			})
		})

		test('sets aux', () => {
			const atem = setupAtem()

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
			const atem = setupAtem()
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
			const atem = setupAtem()
			const timelineObject = atem.getDskTimelineObject({
				...DEFAULT_DSK,
				classes: ['classA', 'classB']
			})
			expect(timelineObject).toMatchObject({
				classes: ['classA', 'classB']
			})
		})

		test('sets metaData', () => {
			const atem = setupAtem()
			const timelineObject = atem.getDskTimelineObject({
				...DEFAULT_DSK,
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
			expect(timelineObject).toMatchObject({
				metaData: { context: 'Some Context', mediaPlayerSession: 'mySession' }
			})
		})

		test('sets layer prefix', () => {
			const atem = setupAtem()
			const timelineObject = atem.getDskTimelineObject(DEFAULT_DSK)
			expect(timelineObject).toMatchObject({
				layer: prefixLayer('dsk_1')
			})
		})

		test('enables DSK', () => {
			const atem = setupAtem()

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
})
