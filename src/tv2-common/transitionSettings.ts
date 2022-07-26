import { TSR } from '@tv2media/blueprints-integration'
import { PartDefinition, TV2BlueprintConfig } from 'tv2-common'
import { AtemSourceIndex } from '../types/atem'

export function TransitionSettings(config: TV2BlueprintConfig, part: PartDefinition): TSR.AtemTransitionSettings {
	if (!part.transition || !part.transition.duration) {
		return {}
	}

	if (part.transition.style.match(/WIPE/i)) {
		return WipeTransitionSettings(part.transition.duration)
	}
	if (part.transition.style.match(/DIP/i)) {
		return DipTransitionSettings(config, part.transition.duration)
	}
	return MixTransitionSettings(part.transition.duration)
}

function WipeTransitionSettings(rate: number): TSR.AtemTransitionSettings {
	return {
		wipe: {
			rate
		}
	}
}

export function DipTransitionSettings(config: TV2BlueprintConfig, rate: number): TSR.AtemTransitionSettings {
	return {
		dip: {
			rate,
			input: config.studio?.AtemSource?.Dip ?? AtemSourceIndex.Col2
		}
	}
}

export function MixTransitionSettings(rate: number): TSR.AtemTransitionSettings {
	return {
		mix: {
			rate
		}
	}
}
