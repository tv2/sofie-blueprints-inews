import { IBlueprintPart, NotesContext } from 'tv-automation-sofie-blueprints-integration'
import { CueType } from 'tv2-constants'
import { TableConfigItemBreakers, TV2BlueprintConfigBase, TV2StudioConfigBase } from './blueprintConfig'
import { TimeFromFrames } from './frameTime'
import { CueDefinitionJingle, PartDefinition } from './inewsConversion'

export function GetJinglePartProperties<StudioConfig extends TV2StudioConfigBase>(
	_context: NotesContext,
	config: TV2BlueprintConfigBase<StudioConfig>,
	part: PartDefinition
):
	| Pick<
			IBlueprintPart,
			'autoNext' | 'expectedDuration' | 'prerollDuration' | 'autoNextOverlap' | 'disableOutTransition'
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
				return GetJinglePartPropertiesFromTableValue(config, realBreaker)
			}
		}
	}
	return {}
}

export function GetJinglePartPropertiesFromTableValue<StudioConfig extends TV2StudioConfigBase>(
	config: TV2BlueprintConfigBase<StudioConfig>,
	realBreaker: TableConfigItemBreakers
): Pick<
	IBlueprintPart,
	'autoNext' | 'expectedDuration' | 'prerollDuration' | 'autoNextOverlap' | 'disableOutTransition'
> {
	return {
		expectedDuration:
			TimeFromFrames(Number(realBreaker.Duration)) -
			TimeFromFrames(Number(realBreaker.EndAlpha)) -
			TimeFromFrames(Number(realBreaker.StartAlpha)),
		prerollDuration: config.studio.CasparPrerollDuration + TimeFromFrames(Number(realBreaker.StartAlpha)),
		autoNextOverlap: TimeFromFrames(Number(realBreaker.EndAlpha)),
		disableOutTransition: false,
		autoNext: realBreaker.Autonext === true
	}
}
