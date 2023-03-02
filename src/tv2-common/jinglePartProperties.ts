import { IBlueprintPart } from 'blueprints-integration'
import { CueType } from 'tv2-constants'
import { TableConfigItemBreakers } from './blueprintConfig'
import { getTimeFromFrames } from './frameTime'
import { CueDefinitionJingle, PartDefinition } from './inewsConversion'
import { ShowStyleContext } from './showstyle'

export function GetJinglePartProperties(
	context: ShowStyleContext,
	part: PartDefinition
): Pick<IBlueprintPart, 'autoNext' | 'expectedDuration' | 'autoNextOverlap' | 'disableNextInTransition'> | {} {
	if (part.cues) {
		const cue = part.cues.find((c) => c.type === CueType.Jingle) as CueDefinitionJingle
		if (cue) {
			const realBreaker = context.config.showStyle.BreakerConfig.find((conf) => {
				return conf.BreakerName && typeof conf.BreakerName === 'string'
					? conf.BreakerName.toString().trim().toUpperCase() === cue.clip.toUpperCase()
					: false
			})

			if (realBreaker) {
				return GetJinglePartPropertiesFromTableValue(realBreaker)
			}
		}
	}
	return {}
}

export function GetJinglePartPropertiesFromTableValue(
	realBreaker: TableConfigItemBreakers
): Pick<IBlueprintPart, 'autoNext' | 'expectedDuration' | 'autoNextOverlap' | 'disableNextInTransition'> {
	const expectedDuration = Math.max(0, getTimeFromFrames(Number(realBreaker.Duration) - Number(realBreaker.StartAlpha)))
	const autoNextOverlap = Math.min(expectedDuration, getTimeFromFrames(Number(realBreaker.EndAlpha)))
	return {
		expectedDuration,
		autoNextOverlap,
		autoNext: realBreaker.Autonext === true,
		disableNextInTransition: false
	}
}
