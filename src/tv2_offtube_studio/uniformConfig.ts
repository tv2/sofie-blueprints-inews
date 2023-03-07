import { getSpecialLayers, SpecialInput, UniformConfig } from 'tv2-common'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'

const MIX_EFFECTS: UniformConfig['mixEffects'] = {
	program: { input: SpecialInput.ME1_PROGRAM, mixEffectLayer: SwitcherMixEffectLLayer.Program },
	clean: {
		input: SpecialInput.ME4_PROGRAM,
		mixEffectLayer: SwitcherMixEffectLLayer.Clean,
		auxLayer: SwitcherAuxLLayer.AuxClean
	}
}

export const QBOX_UNIFORM_CONFIG: UniformConfig = {
	switcherLLayers: {
		primaryMixEffect: SwitcherMixEffectLLayer.Clean,
		nextServerAux: SwitcherAuxLLayer.AuxServerLookahead,
		nextPreviewMixEffect: SwitcherMixEffectLLayer.Next,
		jingleNextMixEffect: SwitcherMixEffectLLayer.NextJingle
	},
	mixEffects: MIX_EFFECTS,
	specialInputAuxLLayers: {
		...getSpecialLayers(MIX_EFFECTS)
	}
}
