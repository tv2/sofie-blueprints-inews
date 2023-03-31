import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'
import _ = require('underscore')
import { SpecialInput } from './videoSwitchers'

/** This config contains hardcoded values that differ between Gallery and Qbox Blueprints */
export interface UniformConfig {
	switcherLLayers: {
		/** The layer where cuts and transitions between primary pieces are happening */
		primaryMixEffect: SwitcherMixEffectLLayer
		/** Optional layer where the same cuts and transitions as in `PrimaryMixEffect` are applied */
		primaryMixEffectClone?: SwitcherMixEffectLLayer
		/** Optional layer where lookaheads are generated as Preview timeline objects */
		nextPreviewMixEffect?: SwitcherMixEffectLLayer
		/** Optional layer where lookaheads are generated as Aux timeline objects */
		nextAux?: SwitcherAuxLLayer
		/** Optional layer to show the jingles on an USK */
		jingleUskMixEffect?: SwitcherMixEffectLLayer
		/** Optional layer to show Fullscreen graphics on an USK */
		fullUskMixEffect?: SwitcherMixEffectLLayer
		/** Optional layer to show the jingles lookahead on */
		jingleNextMixEffect?: SwitcherMixEffectLLayer
		/** Optional layer to preview servers on Aux */
		nextServerAux?: SwitcherAuxLLayer
		/** Optional mix-minus layer */
		mixMinusAux?: SwitcherAuxLLayer
	}
	/**
	 * MixEffects grouped by their roles (note Program !== Primary)
	 * Relevant mostly for baseline
	 */
	mixEffects: {
		program: MixEffect
		clean: MixEffect
	}
	/**
	 * Auxes on which certain inputs appear
	 * It allows associating TriCaster's MEs to mix outputs in order to route MEs to matrix outs
	 */
	specialInputAuxLLayers: Partial<Record<SpecialInput, SwitcherAuxLLayer>>
}

export interface MixEffect {
	input: SpecialInput
	mixEffectLayer: SwitcherMixEffectLLayer
	auxLayer?: SwitcherAuxLLayer
}

export function getSpecialLayers(
	mixEffects: UniformConfig['mixEffects']
): Partial<Record<SpecialInput, SwitcherAuxLLayer>> {
	return Object.fromEntries(
		Object.values(mixEffects)
			.filter(mixEffect => mixEffect.auxLayer)
			.map(mixEffect => [mixEffect.input, mixEffect.auxLayer])
	)
}

export function getUsedLayers(uniformConfig: UniformConfig): Array<SwitcherMixEffectLLayer | SwitcherAuxLLayer> {
	return _.uniq(
		Object.values(uniformConfig.switcherLLayers).concat(
			Object.values(uniformConfig.mixEffects).flatMap(mixeffect =>
				_.compact([mixeffect.mixEffectLayer, mixeffect.auxLayer])
			)
		)
	)
}
