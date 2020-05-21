import { TSR } from 'tv-automation-sofie-blueprints-integration'
import { PartDefinition } from 'tv2-common'

export function TransitionSettings(part: PartDefinition): TSR.AtemTransitionSettings {
	if (part.transition && part.transition.duration) {
		if (part.transition.style === 'WIPE') {
			return {
				wipe: {
					rate: part.transition.duration
				}
			}
		}
		return {
			mix: {
				rate: part.transition.duration
			}
		}
	}
	return {}
}
