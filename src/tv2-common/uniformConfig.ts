import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from "tv2-constants"

/** This config contains hardcoded values that differ between Gallery and Qbox Blueprints */
export interface UniformConfig {
    SwitcherLLayers: {
        /** The layer where cuts and transitions between primary pieces are happening */
        PrimaryMixEffect: SwitcherMixEffectLLayer
        /** Optional layer to show the jingles on an USK */
        JingleUskMixEffect?: SwitcherMixEffectLLayer
        /** Optional layer to show the jingles lookahead on */
        JingleNextMixEffect?: SwitcherMixEffectLLayer
        /** Optional layer to preview servers on Aux */
        ServerLookaheadAux?: SwitcherAuxLLayer
    }
}