import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'
import { SpecialInput } from './videoSwitchers'

/** This config contains hardcoded values that differ between Gallery and Qbox Blueprints */
export interface UniformConfig {
	SwitcherLLayers: {
		/** The layer where cuts and transitions between primary pieces are happening */
		PrimaryMixEffect: SwitcherMixEffectLLayer
		/** Optional layer where the same cuts and transitions as in `PrimaryMixEffect` are applied */
		PrimaryMixEffectClone?: SwitcherMixEffectLLayer
		/** Optional layer where lookaheads are generated as Preview timeline objects */
		NextPreviewMixEffect?: SwitcherMixEffectLLayer
		/** Optional layer where lookaheads are generated as Aux timeline objects */
		NextAux?: SwitcherAuxLLayer
		/** Optional layer to show the jingles on an USK */
		JingleUskMixEffect?: SwitcherMixEffectLLayer
		/** Optional layer to show the jingles lookahead on */
		JingleNextMixEffect?: SwitcherMixEffectLLayer
		/** Optional layer to preview servers on Aux */
		NextServerAux?: SwitcherAuxLLayer
		/** Optional mix-minus layer */
		MixMinusAux?: SwitcherAuxLLayer
	}
	/**
	 * MixEffects grouped by their roles (note Program !== Primary)
	 * Relevant mostly for baseline
	 */
	MixEffects: {
		Program: MixEffect
		Clean: MixEffect
	}
	/**
	 * Auxes on which certain inputs appear
	 * It allows associating TriCaster's MEs to mix outputs in order to route MEs to matrix outs
	 */
	SpecialInputAuxLLayers: Partial<Record<SpecialInput, SwitcherAuxLLayer>>
}

export interface MixEffect {
	input: SpecialInput
	mixEffectLayer: SwitcherMixEffectLLayer
	auxLayer?: SwitcherAuxLLayer
}
