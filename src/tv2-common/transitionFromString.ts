import { AtemTransitionStyle } from 'timeline-state-resolver-types'

export function TransitionFromString(str: string): AtemTransitionStyle {
	if (str.match(/MIX/i)) {
		return AtemTransitionStyle.MIX
	} else if (str.match(/DIP/i)) {
		return AtemTransitionStyle.DIP
	} else if (str.match(/WIPE/i)) {
		return AtemTransitionStyle.WIPE
	} else if (str.match(/STING/i)) {
		return AtemTransitionStyle.STING
	}

	return AtemTransitionStyle.CUT
}
