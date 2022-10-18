import { TSR } from 'blueprints-integration'

export function AtemTransitionStyleFromString(str: string): TSR.AtemTransitionStyle {
	if (str.match(/MIX/i)) {
		return TSR.AtemTransitionStyle.MIX
	} else if (str.match(/DIP/i)) {
		return TSR.AtemTransitionStyle.DIP
	} else if (str.match(/WIPE/i)) {
		return TSR.AtemTransitionStyle.WIPE
	} else if (str.match(/STING/i)) {
		return TSR.AtemTransitionStyle.STING
	}

	return TSR.AtemTransitionStyle.CUT
}
