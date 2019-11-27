import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { CueDefinitionJingle, CueType } from '../inewsConversion/converters/ParseCue'
import { CreatePartInvalid } from './invalid'
import { TimeFromFrames } from './time/frameTime'
import { PartTime } from './time/partTime'

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
		let realBreaker: any
		if (cue) {
			realBreaker = config.showStyle.BreakerConfig.find(conf => {
				return conf.BreakerName && typeof conf.BreakerName === 'string'
					? conf.BreakerName.toString()
							.trim()
							.toUpperCase() === cue.clip.toUpperCase()
					: false
			})
		} else {
			if (part.effekt !== undefined) {
				realBreaker = config.showStyle.BreakerConfig.find(conf => {
					return conf.BreakerName && part.effekt !== undefined
						? conf.BreakerName.toString()
								.trim()
								.toUpperCase() === part.effekt.toString().toUpperCase()
						: false
				})
			}
		}

		if (realBreaker) {
			return {
				expectedDuration:
					TimeFromFrames(Number(realBreaker.Duration)) -
					TimeFromFrames(Number(realBreaker.StartAlpha)) -
					TimeFromFrames(Number(realBreaker.EndAlpha)),
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
					TimeFromFrames(Number(realBreaker.EndAlpha)) + config.studio.CasparPrerollDuration + config.studio.ATEMDelay,
				autoNext: true
			}
		}
	}
	return {}
}

export function CreatePartEffekt(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(partDefinition, totalWords)

	if (partDefinition.effekt === undefined) {
		context.warning('Effekt is not defined')
		return CreatePartInvalid(partDefinition)
	}

	if (!config.showStyle.BreakerConfig) {
		context.warning(`Jingles have not been configured`)
		return CreatePartInvalid(partDefinition)
	}

	const jingle = config.showStyle.BreakerConfig.find(jngl =>
		jngl.BreakerName && partDefinition.effekt !== undefined
			? jngl.BreakerName.toString().toUpperCase() === partDefinition.effekt.toString().toUpperCase()
			: false
	)
	if (!jingle) {
		context.warning(`Jingle ${partDefinition.effekt} is not configured`)
		return CreatePartInvalid(partDefinition)
	}

	const overlapFrames = jingle.EndAlpha

	if (overlapFrames === undefined) {
		context.warning(`Jingle ${partDefinition.effekt} does not have an out-duration set.`)
		return CreatePartInvalid(partDefinition)
	}

	let part = literal<IBlueprintPart>({
		externalId: `${partDefinition.externalId}-EFFEKT-${partDefinition.effekt}`,
		title: PartType[partDefinition.type] + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: ''
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)
	AddScript(partDefinition, pieces, partTime)
	part = { ...part, ...GetBreakerEffekt(context, config, partDefinition) }

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
