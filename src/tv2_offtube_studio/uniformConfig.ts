import { UniformConfig } from 'tv2-common'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'

export const QBOX_UNIFORM_CONFIG: UniformConfig = {
	SwitcherLLayers: {
		PrimaryMixEffect: SwitcherMixEffectLLayer.Clean,
		NextServerAux: SwitcherAuxLLayer.AuxServerLookahead,
		NextPreviewMixEffect: SwitcherMixEffectLLayer.Next,
		JingleNextMixEffect: SwitcherMixEffectLLayer.NextJingle
	}
}
