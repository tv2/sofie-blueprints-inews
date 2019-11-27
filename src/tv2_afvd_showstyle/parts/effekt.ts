import { IBlueprintPart, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { BlueprintConfig } from '../helpers/config'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'
import { CueDefinitionJingle, CueType } from '../inewsConversion/converters/ParseCue'
import { TimeFromFrames } from './time/frameTime'

export function GetBreakerEffekt(
	_context: PartContext,
	config: BlueprintConfig,
	part: PartDefinition
): Pick<IBlueprintPart, 'expectedDuration' | 'autoNext' | 'transitionKeepaliveDuration'> | {} {
	if (part.cues) {
		const cue = part.cues.find(c => c.type === CueType.Jingle) as CueDefinitionJingle
		if (cue) {
			const realBreaker = config.showStyle.BreakerConfig.find(conf => {
				return conf.BreakerName && typeof conf.BreakerName === 'string'
					? conf.BreakerName.toString()
							.trim()
							.toUpperCase() === cue.clip.toUpperCase()
					: false
			})
			if (realBreaker) {
				return {
					expectedDuration: TimeFromFrames(Number(realBreaker.Duration)),
					transitionKeepaliveDuration: TimeFromFrames(Number(realBreaker.StartAlpha)),
					autoNext: true
				}
			}
		}
	}
	return {}
}
