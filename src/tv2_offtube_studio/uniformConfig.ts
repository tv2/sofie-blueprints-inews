import { SpecialInput, UniformConfig } from 'tv2-common'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'

const MIX_EFFECTS: UniformConfig['MixEffects'] = {
	Program: { input: SpecialInput.ME1_PROGRAM, mixEffectLayer: SwitcherMixEffectLLayer.Program },
	Clean: {
		input: SpecialInput.ME4_PROGRAM,
		mixEffectLayer: SwitcherMixEffectLLayer.Clean,
		auxLayer: SwitcherAuxLLayer.AuxClean
	}
}

export const QBOX_UNIFORM_CONFIG: UniformConfig = {
	SwitcherLLayers: {
		PrimaryMixEffect: SwitcherMixEffectLLayer.Clean,
		NextServerAux: SwitcherAuxLLayer.AuxServerLookahead,
		NextPreviewMixEffect: SwitcherMixEffectLLayer.Next,
		JingleNextMixEffect: SwitcherMixEffectLLayer.NextJingle
	},
	MixEffects: MIX_EFFECTS,
	SpecialInputAuxLLayers: {
		...Object.fromEntries(
			Object.values(MIX_EFFECTS)
				.filter(mixEffect => mixEffect.auxLayer)
				.map(mixEffect => [mixEffect.input, mixEffect.auxLayer])
		)
	}
}
