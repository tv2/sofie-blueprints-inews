import { SpecialInput, UniformConfig } from 'tv2-common'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'

const MIX_EFFECTS: UniformConfig['MixEffects'] = {
	Program: {
		input: SpecialInput.ME1_PROGRAM,
		mixEffectLayer: SwitcherMixEffectLLayer.Program,
		auxLayer: SwitcherAuxLLayer.AuxProgram
	},
	Clean: {
		input: SpecialInput.ME4_PROGRAM,
		mixEffectLayer: SwitcherMixEffectLLayer.Clean,
		auxLayer: SwitcherAuxLLayer.AuxClean
	}
}

export const GALLERY_UNIFORM_CONFIG: UniformConfig = {
	SwitcherLLayers: {
		PrimaryMixEffect: SwitcherMixEffectLLayer.Program,
		PrimaryMixEffectClone: SwitcherMixEffectLLayer.Clean,
		JingleUskMixEffect: SwitcherMixEffectLLayer.CleanUSKEffect,
		NextAux: SwitcherAuxLLayer.AuxLookahead,
		MixMinusAux: SwitcherAuxLLayer.AuxVideoMixMinus
	},
	MixEffects: MIX_EFFECTS,
	SpecialInputAuxLLayers: {
		...Object.fromEntries(
			Object.values(MIX_EFFECTS)
				.filter(mixEffect => mixEffect.auxLayer)
				.map(mixEffect => [mixEffect.input, mixEffect.auxLayer])
		),
		[SpecialInput.DVE]: SwitcherAuxLLayer.AuxDve
	}
}
