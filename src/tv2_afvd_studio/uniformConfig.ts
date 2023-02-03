import { UniformConfig } from 'tv2-common'
import { SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'

export const GALLERY_UNIFORM_CONFIG: UniformConfig = {
	SwitcherLLayers: {
		PrimaryMixEffect: SwitcherMixEffectLLayer.Program,
		JingleUskMixEffect: SwitcherMixEffectLLayer.CleanUSKEffect,
		ProgramAux: SwitcherAuxLLayer.AuxProgram
	}
}
