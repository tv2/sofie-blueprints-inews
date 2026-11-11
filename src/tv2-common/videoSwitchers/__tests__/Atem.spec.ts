import { TSR } from 'blueprints-integration'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'
import { makeMockGalleryContext } from '../../../__mocks__/context'
import { prefixLayer } from '../../../tv2-common/__tests__/testUtil'
import { TV2StudioConfigBase } from '../../../tv2-common/blueprintConfig'
import { AtemSourceIndex } from '../../../types/atem'
import { AuxProps, DskProps, MixEffectProps, SpecialInput, SwitcherType, TransitionStyle } from '../types'
import { VideoSwitcherBase } from '../VideoSwitcher'

const DURATION: number = 50

function setupAtem(studioConfigOverrides?: Partial<TV2StudioConfigBase>) {
	const context = makeMockGalleryContext({
		studioConfig: { SwitcherType: SwitcherType.ATEM, ...studioConfigOverrides }
	})
	return VideoSwitcherBase.getVideoSwitcher(context.core, context.config, context.uniformConfig)
}

describe('ATEM', () => {
	test('preserves fractional DVE geometry without applying M2L-X pixel validation', () => {
		const box = { source: 4, enabled: true, x: -800.5, y: 60.25, size: 500.5 }
		const object = setupAtem().getDveTimelineObjects({
			content: { boxes: [box], template: {}, artFillSource: 9, artCutSource: 10 }
		})[0]
		expect(object.content).toMatchObject({ ssrc: { boxes: [box] } })
	})

	test('normalizes numeric input text and rejects native source names instead of selecting black', () => {
		const atem = setupAtem()
		const object = atem.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { input: '5', previewInput: '0' }
		})
		expect(object).toMatchObject({ content: { me: { programInput: 5, previewInput: 0 } } })
		expect(() => atem.updateInput(object, 'camera_name')).toThrow('integer input numbers')
	})

	test.each([TransitionStyle.MIX, TransitionStyle.DIP, TransitionStyle.WIPE])(
		'does not invent a transition rate for %s without a configured frame duration',
		transition => {
			const object = setupAtem().getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
				content: { input: 5, transition }
			})
			expect((object.content as TSR.TimelineObjAtemME['content']).me.transitionSettings).toBeUndefined()
		}
	)

	test('defaults legacy studio configurations to ATEM', () => {
		const context = makeMockGalleryContext()
		const { SwitcherType: _switcherType, ...studio } = context.config.studio
		const legacyConfig = { ...context.config, studio }
		const atem = VideoSwitcherBase.getVideoSwitcher(
			context.core,
			legacyConfig as typeof context.config,
			context.uniformConfig
		)
		expect(
			atem.getMixEffectTimelineObject({ layer: SwitcherMixEffectLLayer.Program, content: { input: 0 } })
		).toMatchObject({
			content: { deviceType: TSR.DeviceType.ATEM, me: { programInput: 0 } }
		})
	})

	test('preserves every custom ATEM wipe setting when updating an underlying transition', () => {
		const atem = setupAtem()
		const object = atem.getMixEffectTimelineObject({ layer: SwitcherMixEffectLLayer.Program, content: { input: 0 } })
		const settings: TSR.AtemTransitionSettings = {
			wipe: {
				rate: 6,
				pattern: 11,
				xPosition: 1234,
				yPosition: 5678,
				symmetry: 4000,
				borderWidth: 200,
				borderInput: 9,
				borderSoftness: 300,
				reverseDirection: true,
				flipFlop: true
			}
		}
		atem.updateTransition(object, TransitionStyle.WIPE, 6, settings)
		expect(object).toMatchObject({
			content: { me: { input: 0, transition: TSR.AtemTransitionStyle.WIPE, transitionSettings: settings } }
		})
		expect((object.content as TSR.TimelineObjAtemME['content']).me).not.toHaveProperty('programInput')
	})

	test('replaces only AB DVE placeholders, keeping black and configured sources intact', () => {
		const atem = setupAtem()
		const object = atem.getDveTimelineObjects({
			content: {
				boxes: [{ source: SpecialInput.AB_PLACEHOLDER }, { source: SpecialInput.BLACK }, { source: 4 }],
				template: {},
				artFillSource: 9,
				artCutSource: 10
			}
		})[0]
		atem.updateUnpopulatedDveBoxes(object, 7)
		expect(object.content).toMatchObject({ ssrc: { boxes: [{ source: 7 }, { source: 0 }, { source: 4 }] } })
	})

	test('schedules deterministic preview restoration relative to the actual transition start', () => {
		const atem = setupAtem()
		const properties = {
			id: 'transition',
			enable: { start: 200 },
			content: { input: 0, transition: TransitionStyle.MIX, transitionDuration: 6 }
		}
		const first = atem.getOnAirTimelineObjects(properties)
		expect(atem.getOnAirTimelineObjects(properties)).toEqual(first)
		expect(first[1]).toMatchObject({
			id: 'transition_after_transition',
			enable: { start: '#transition.start + 540' },
			content: { me: { programInput: 0 } }
		})
	})

	test('generates black-source lookahead even though its input number is zero', () => {
		const context = makeMockGalleryContext({
			uniformConfig: {
				switcherLLayers: {
					primaryMixEffect: SwitcherMixEffectLLayer.Program,
					nextPreviewMixEffect: SwitcherMixEffectLLayer.Next
				}
			}
		})
		const atem = VideoSwitcherBase.getVideoSwitcher(context.core, context.config, context.uniformConfig)
		const objects = atem.getOnAirTimelineObjectsWithLookahead({ content: { input: SpecialInput.BLACK } })
		expect(objects).toHaveLength(2)
		expect(objects[1]).toMatchObject({ content: { me: { previewInput: 0 } } })
	})

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
