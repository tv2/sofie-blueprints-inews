import { getSpecialLayers, SpecialInput, UniformConfig } from 'tv2-common'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'

const MIX_EFFECTS: UniformConfig['mixEffects'] = {
	program: {
		input: SpecialInput.ME1_PROGRAM,
		mixEffectLayer: SwitcherMixEffectLLayer.Program,
		auxLayer: SwitcherAuxLLayer.AuxProgram
	},
	clean: {
		input: SpecialInput.ME4_PROGRAM,
		mixEffectLayer: SwitcherMixEffectLLayer.Clean,
		auxLayer: SwitcherAuxLLayer.AuxClean
	}
}

export const GALLERY_UNIFORM_CONFIG: UniformConfig = {
	switcherLLayers: {
		primaryMixEffect: SwitcherMixEffectLLayer.Program,
		primaryMixEffectClone: SwitcherMixEffectLLayer.Clean,
		jingleUskMixEffect: SwitcherMixEffectLLayer.CleanUskEffect,
		fullUskMixEffect: SwitcherMixEffectLLayer.CleanUskFull,
		nextAux: SwitcherAuxLLayer.AuxLookahead,
		mixMinusAux: SwitcherAuxLLayer.AuxVideoMixMinus
	},
	mixEffects: MIX_EFFECTS,
	specialInputAuxLLayers: {
		...getSpecialLayers(MIX_EFFECTS)
	}
}
