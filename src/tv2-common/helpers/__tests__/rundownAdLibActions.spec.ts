import {
	ActionTakeWithTransitionVariantDip,
	GetTransitionAdLibActions,
	ParseTransitionString,
	SwitcherType
} from 'tv2-common'
import { makeMockCoreGalleryContext } from '../../../__mocks__/context'
import { m2lxStudioSettings } from '../../../__mocks__/m2lx'
import { QBOX_UNIFORM_CONFIG } from '../../../tv2_offtube_studio/uniformConfig'
import { SegmentContextImpl } from '../../segment/context'

describe('rundownAdLibActions', () => {
	it('uses show-style wipe defaults and per-shortcut directions without treating native wipes as clips', () => {
		const settings = m2lxStudioSettings(JSON.stringify({ sources: [], keyers: [], routers: [] }))
		const core = makeMockCoreGalleryContext({
			...settings,
			studioConfig: { ...settings.studioConfig, SwitcherType: SwitcherType.M2LX },
			showStyleConfig: {
				ShowstyleTransition: 'WIPE 25',
				DefaultWipeDirection: 'Left',
				Transitions: [{ Transition: 'WIPE 10', WipeDirection: 'Right' }, { Transition: 'WIPE 12' }]
			}
		})
		const actions = GetTransitionAdLibActions(new SegmentContextImpl(core, QBOX_UNIFORM_CONFIG).config, 800)
		expect(actions.map(action => action.userData)).toEqual([
			expect.objectContaining({ variant: { type: 'wipe', frames: 25 }, takeNow: true }),
			expect.objectContaining({ variant: { type: 'wipe', frames: 25 }, takeNow: false }),
			expect.objectContaining({ variant: { type: 'wipe', frames: 10, wipeDirection: 'Right' }, takeNow: true }),
			expect.objectContaining({ variant: { type: 'wipe', frames: 10, wipeDirection: 'Right' }, takeNow: false }),
			expect.objectContaining({ variant: { type: 'wipe', frames: 12 }, takeNow: true }),
			expect.objectContaining({ variant: { type: 'wipe', frames: 12 }, takeNow: false })
		])
		expect(
			actions.every(action => 'content' in action.display && JSON.stringify(action.display.content) === '{}')
		).toBe(true)
		expect(ParseTransitionString('WIPE 25')).toEqual({ type: 'breaker', breaker: 'WIPE 25' })
		expect(ParseTransitionString('/ NBA WIPE', 'Left')).toEqual({ type: 'breaker', breaker: '/ NBA WIPE' })
	})

	describe('ParseTransitionString', () => {
		it('should parses Mix 12', () => {
			const result = ParseTransitionString('MIX 12')
			expect(result).toEqual({
				type: 'mix',
				frames: 12
			})
		})

		it('should parse Mix 9', () => {
			const result = ParseTransitionString('mix9')
			expect(result).toEqual({
				type: 'mix',
				frames: 9
			})
		})

		it('should parse EFFEKT 1', () => {
			const result = ParseTransitionString('EFFEKT 1')
			expect(result).toEqual({
				type: 'breaker',
				breaker: '1'
			})
		})

		it('should parse effekt2', () => {
			const result = ParseTransitionString('effekt2')
			expect(result).toEqual({
				type: 'breaker',
				breaker: '2'
			})
		})

		it('should parse 13 as breaker', () => {
			const result = ParseTransitionString('13')
			expect(result).toEqual({
				type: 'breaker',
				breaker: '13'
			})
		})

		it('should parse INTRO_19', () => {
			const result = ParseTransitionString('INTRO_19')
			expect(result).toEqual({
				type: 'breaker',
				breaker: 'INTRO_19'
			})
		})

		it('should parse / Branded Transition', () => {
			const result = ParseTransitionString('/ Branded Transition')
			expect(result).toEqual({
				type: 'breaker',
				breaker: '/ Branded Transition'
			})
		})

		it('should return Dip when transitionSetting is Dip', () => {
			const result = ParseTransitionString('dip 1')
			expect(result.type).toEqual('dip')
		})

		it('should return a dip with 4 frames when transitionSetting is dip 4', () => {
			const result = ParseTransitionString('dip 4')
			expect((result as ActionTakeWithTransitionVariantDip).frames).toEqual(4)
		})

		it('should return a dip with 15 frames when transitionSetting is dip 15', () => {
			const result = ParseTransitionString('dip 15')
			expect((result as ActionTakeWithTransitionVariantDip).frames).toEqual(15)
		})
	})
})
