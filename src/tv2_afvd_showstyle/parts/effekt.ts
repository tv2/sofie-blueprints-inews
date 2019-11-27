import {
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjAtemDSK,
	TimelineObjCCGMedia,
	TimelineObjSisyfosAny
} from 'timeline-state-resolver-types'
import {
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TransitionContent,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'
import { CueDefinitionJingle, CueType } from '../inewsConversion/converters/ParseCue'
import { SourceLayer } from '../layers'
import { TimeFromFrames } from './time/frameTime'

export function GetBreakerEffekt(
	_context: PartContext,
	config: BlueprintConfig,
	part: PartDefinition
): Pick<IBlueprintPart, 'expectedDuration' | 'autoNext'> | {} {
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
					autoNext: true
				}
			}
		}
	}
	return {}
}
