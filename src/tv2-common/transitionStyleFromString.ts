import { TransitionStyle } from 'tv2-common'

export function TransitionStyleFromString(str: string): TransitionStyle {
	if (/MIX/i.test(str)) {
		return TransitionStyle.MIX
	} else if (/DIP/i.test(str)) {
		return TransitionStyle.DIP
	} else if (/WIPE/i.test(str)) {
		return TransitionStyle.WIPE
	} else if (/STING/i.test(str)) {
		return TransitionStyle.STING
	}
	return TransitionStyle.CUT
}
