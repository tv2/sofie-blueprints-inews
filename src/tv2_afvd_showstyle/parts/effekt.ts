import { IBlueprintPart, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { BlueprintConfig } from '../helpers/config'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'
import { CueDefinitionJingle, CueType } from '../inewsConversion/converters/ParseCue'
import { TimeFromFrames } from './time/frameTime'

export function GetBreakerEffekt(
	_context: PartContext,
	config: BlueprintConfig,
	part: PartDefinition
):
	| Pick<
			IBlueprintPart,
			| 'expectedDuration'
			| 'autoNext'
			| 'transitionKeepaliveDuration'
			| 'transitionPrerollDuration'
			| 'autoNextOverlap'
			| 'transitionDuration'
	  >
	| {} {
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
					expectedDuration:
						TimeFromFrames(Number(realBreaker.Duration)) -
						TimeFromFrames(Number(realBreaker.StartAlpha)) -
						TimeFromFrames(Number(realBreaker.EndAlpha)) +
						TimeFromFrames(config.studio.ATEMDelay * 2),
					transitionKeepaliveDuration:
						TimeFromFrames(Number(realBreaker.StartAlpha)) +
						config.studio.CasparPrerollDuration +
						config.studio.ATEMDelay,
					transitionPrerollDuration: config.studio.CasparPrerollDuration,
					transitionDuration:
						TimeFromFrames(Number(realBreaker.Duration)) -
						TimeFromFrames(Number(realBreaker.StartAlpha)) -
						TimeFromFrames(Number(realBreaker.EndAlpha)),
					autoNextOverlap:
						TimeFromFrames(Number(realBreaker.EndAlpha)) +
						config.studio.CasparPrerollDuration +
						config.studio.ATEMDelay,
					autoNext: true
				}
			}
		}
	}
	return {}
}
