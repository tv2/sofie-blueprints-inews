import { BlueprintMapping, LookaheadMode, TSR } from 'blueprints-integration'
import { SwitcherAuxLLayer, SwitcherDveLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'
import { makeMockGalleryContext } from '../../../__mocks__/context'
import { TRICASTER_LAYER_PREFIX } from '../../layers'
import { AtemToTriCasterDveConverter } from '../atemToTriCasterDveConverter'
import { TriCaster } from '../TriCaster'
import { SpecialInput, SwitcherType, TemporalPriority, TransitionStyle } from '../types'

function setup() {
	const context = makeMockGalleryContext({ studioConfig: { SwitcherType: SwitcherType.TRICASTER } })
	const switcher = new TriCaster(context.core, context.config, context.uniformConfig, new AtemToTriCasterDveConverter())
	return { context, switcher }
}

describe('TriCaster', () => {
	test.each([
		[TransitionStyle.CUT, 'cut'],
		[TransitionStyle.MIX, 'fade'],
		[TransitionStyle.DIP, 2],
		[TransitionStyle.WIPE, 3]
	])('converts %s and frame duration to the native transition', (transition, effect) => {
		const { switcher } = setup()
		const object = switcher.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { input: 5, transition: transition as TransitionStyle, transitionDuration: 50 }
		})
		expect(object.content.me).toMatchObject({ programInput: 'input5', transitionEffect: effect, transitionDuration: 2 })
	})

	test.each([
		[SpecialInput.BLACK, 'black'],
		[SpecialInput.ME1_PROGRAM, 'v1'],
		[SpecialInput.DVE, 'v2'],
		[SpecialInput.COLOR_GENERATOR1, 'bfr1']
	])('maps special source %s to lowercase native source %s', (input, name) => {
		const { switcher } = setup()
		const object = switcher.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { input: input as SpecialInput }
		})
		expect(object.content.me).toMatchObject({ programInput: name })
	})

	test('updates Program and Preview, but never changes Preview during a transition', () => {
		const { switcher } = setup()
		const object = switcher.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { input: 5, previewInput: 0, transition: TransitionStyle.MIX }
		})
		expect(object.content.me).not.toHaveProperty('previewInput')
		switcher.updateInput(object, SpecialInput.BLACK)
		switcher.updateTransition(object, TransitionStyle.CUT)
		switcher.updatePreviewInput(object, 3)
		expect(object.content.me).toMatchObject({ programInput: 'black', previewInput: 'input3', transitionEffect: 'cut' })
	})

	test('uses a separate DVE overlay object and only replaces AB placeholders', () => {
		const { switcher } = setup()
		const box = {
			enabled: true,
			x: 0,
			y: 0,
			size: 1000,
			cropped: false,
			cropTop: 0,
			cropBottom: 0,
			cropLeft: 0,
			cropRight: 0
		}
		const objects = switcher.getDveTimelineObjects({
			metaData: { mediaPlayerSession: 'server' },
			content: {
				boxes: [
					{ ...box, source: SpecialInput.AB_PLACEHOLDER },
					{ ...box, source: 4 }
				],
				template: {},
				artFillSource: 9,
				artCutSource: 10
			}
		})
		expect(objects).toHaveLength(2)
		expect(objects[0]).toMatchObject({
			layer: TRICASTER_LAYER_PREFIX + SwitcherDveLLayer.DveBoxes,
			content: {
				temporalPriority: TemporalPriority.DVE,
				me: { transitionEffect: 7, layers: { a: { input: 'input-1' }, b: { input: 'input4' }, c: { input: 'black' } } }
			}
		})
		expect(objects[0].content.me).not.toHaveProperty('keyers')
		expect(objects[1]).toMatchObject({
			layer: TRICASTER_LAYER_PREFIX + SwitcherDveLLayer.Dve,
			content: {
				temporalPriority: TemporalPriority.DVE,
				me: { transitionEffect: 7, keyers: { dsk1: { input: 'input9', onAir: true } } }
			}
		})
		expect(objects[1].content.me).not.toHaveProperty('layers')
		switcher.updateUnpopulatedDveBoxes(objects[0], 7)
		expect(objects[0].content.me).toMatchObject({ layers: { a: { input: 'input7' }, b: { input: 'input4' } } })
	})

	test('routes and updates matrix outputs through mapped Mix Outputs, including black', () => {
		const { switcher, context } = setup()
		const common = { device: TSR.DeviceType.TRICASTER, deviceId: 'custom-tricaster', lookahead: LookaheadMode.NONE }
		const matrix: BlueprintMapping & TSR.MappingTriCasterMatrixOutput = {
			...common,
			device: TSR.DeviceType.TRICASTER,
			mappingType: TSR.MappingTriCasterType.MATRIX_OUTPUT,
			name: 'out2'
		}
		const mix: BlueprintMapping & TSR.MappingTriCasterMixOutput = {
			...common,
			device: TSR.DeviceType.TRICASTER,
			mappingType: TSR.MappingTriCasterType.MIX_OUTPUT,
			name: 'mix5'
		}
		jest.spyOn(context.core, 'getStudioMappings').mockReturnValue({
			[TRICASTER_LAYER_PREFIX + SwitcherAuxLLayer.AuxVideoMixMinus]: matrix,
			[TRICASTER_LAYER_PREFIX + SwitcherAuxLLayer.AuxClean]: mix
		})
		const object = switcher.getAuxTimelineObject({
			layer: SwitcherAuxLLayer.AuxVideoMixMinus,
			content: { input: SpecialInput.BLACK }
		})
		expect(object.content).toMatchObject({ type: TSR.TimelineContentTypeTriCaster.MATRIX_OUTPUT, source: 'black' })
		switcher.updateAuxInput(object, SpecialInput.ME4_PROGRAM)
		expect(object.content.source).toBe('mix5')
	})

	test('reports ATEM-only wipe controls rather than silently pretending to support them', () => {
		const { switcher, context } = setup()
		const warning = jest.spyOn(context.core, 'logWarning')
		const object = switcher.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { input: 1 }
		})
		switcher.updateTransition(object, TransitionStyle.WIPE, 6, { wipe: { pattern: 11, xPosition: 1234 } })
		expect(object.content.me).toMatchObject({ transitionEffect: 3, transitionDuration: 0.24 })
		expect(warning).toHaveBeenCalledWith('Custom ATEM wipe controls are not supported by TriCaster')
	})
})
