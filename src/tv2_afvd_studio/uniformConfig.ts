import { getSpecialLayers, SpecialInput, UniformConfig } from 'tv2-common'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'

const MIX_EFFECTS: UniformConfig['mixEffects'] = {
	program: {
		input: SpecialInput.ME1_PROGRAM,
		mixEffectLayer: SwitcherMixEffectLLayer.PROGRAM,
		auxLayer: SwitcherAuxLLayer.PROGRAM
	},
	clean: {
		input: SpecialInput.ME4_PROGRAM,
		mixEffectLayer: SwitcherMixEffectLLayer.CLEAN,
		auxLayer: SwitcherAuxLLayer.CLEAN
	}
}

export const GALLERY_UNIFORM_CONFIG: UniformConfig = {
	switcherLLayers: {
		primaryMixEffect: SwitcherMixEffectLLayer.PROGRAM,
		primaryMixEffectClone: SwitcherMixEffectLLayer.CLEAN,
		jingleUskMixEffect: SwitcherMixEffectLLayer.CLEAN_USK_EFFECT,
		fullUskMixEffect: SwitcherMixEffectLLayer.CLEAN_USK_FULL,
		nextAux: SwitcherAuxLLayer.LOOKAHEAD,
		mixMinusAux: SwitcherAuxLLayer.VIDEO_MIX_MINUS
	},
	mixEffects: MIX_EFFECTS,
	specialInputAuxLLayers: {
		...getSpecialLayers(MIX_EFFECTS)
	}
}
