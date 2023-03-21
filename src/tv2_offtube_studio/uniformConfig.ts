import { getSpecialLayers, SpecialInput, UniformConfig } from 'tv2-common'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'

const MIX_EFFECTS: UniformConfig['mixEffects'] = {
	program: { input: SpecialInput.ME1_PROGRAM, mixEffectLayer: SwitcherMixEffectLLayer.PROGRAM },
	clean: {
		input: SpecialInput.ME4_PROGRAM,
		mixEffectLayer: SwitcherMixEffectLLayer.CLEAN,
		auxLayer: SwitcherAuxLLayer.CLEAN
	}
}

export const QBOX_UNIFORM_CONFIG: UniformConfig = {
	switcherLLayers: {
		primaryMixEffect: SwitcherMixEffectLLayer.CLEAN,
		nextServerAux: SwitcherAuxLLayer.SERVER_LOOKAHEAD,
		nextPreviewMixEffect: SwitcherMixEffectLLayer.NEXT,
		jingleNextMixEffect: SwitcherMixEffectLLayer.NEXT_JINGLE
	},
	mixEffects: MIX_EFFECTS,
	specialInputAuxLLayers: {
		...getSpecialLayers(MIX_EFFECTS)
	}
}
