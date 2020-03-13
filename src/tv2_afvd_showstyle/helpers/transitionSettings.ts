import { AtemTransitionSettings } from 'timeline-state-resolver-types'
import { PartDefinition } from '../../common/inewsConversion/converters/ParseBody'

export function TransitionSettings(part: PartDefinition): AtemTransitionSettings {
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
