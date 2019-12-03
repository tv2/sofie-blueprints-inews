import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateJingle } from '../helpers/pieces/jingle'
import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { CueDefinitionJingle, CueType } from '../inewsConversion/converters/ParseCue'
import { CreatePartInvalid } from './invalid'
import { TimeFromFrames } from './time/frameTime'

export function GetBreakerEffekt(
	_context: PartContext,
	config: BlueprintConfig,
	part: PartDefinition
): Pick<IBlueprintPart, 'autoNext' | 'expectedDuration' | 'prerollDuration' | 'autoNextOverlap'> | {} {
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
						TimeFromFrames(Number(realBreaker.EndAlpha)) +
						2 * TimeFromFrames(config.studio.ATEMDelay),
					autoNextOverlap: TimeFromFrames(Number(realBreaker.EndAlpha)) + config.studio.ATEMDelay,
					prerollDuration:
						TimeFromFrames(Number(realBreaker.StartAlpha)) +
						config.studio.CasparPrerollDuration +
						TimeFromFrames(config.studio.ATEMDelay),
					autoNext: realBreaker.Autonext === true
				}
			}
		}
	}
	return {}
}

export function CreatePartEffekt(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition
): BlueprintResultPart {
	if (partDefinition.effekt === undefined) {
		context.warning('Effekt is not defined')
		return CreatePartInvalid(partDefinition, 'effekt')
	}

	if (!config.showStyle.BreakerConfig) {
		context.warning(`Jingles have not been configured`)
		return CreatePartInvalid(partDefinition, 'effekt')
	}

	const jingle = config.showStyle.BreakerConfig.find(jngl =>
		jngl.BreakerName && partDefinition.effekt !== undefined
			? jngl.BreakerName.toString().toUpperCase() === partDefinition.effekt.toString().toUpperCase()
			: false
	)
	if (!jingle) {
		context.warning(`Jingle ${partDefinition.effekt} is not configured`)
		return CreatePartInvalid(partDefinition, 'effekt')
	}

	const overlapFrames = jingle.EndAlpha

	if (overlapFrames === undefined) {
		context.warning(`Jingle ${partDefinition.effekt} does not have an out-duration set.`)
		return CreatePartInvalid(partDefinition, 'effekt')
	}

	let part = literal<IBlueprintPart>({
		externalId: `${partDefinition.externalId}-EFFEKT-${partDefinition.effekt}`,
		title: PartType[partDefinition.type] + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: ''
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	const jingleCue: CueDefinitionJingle = {
		type: CueType.Jingle,
		clip: partDefinition.effekt.toString()
	}

	EvaluateJingle(context, config, pieces, adLibPieces, jingleCue, partDefinition, false, 0, true)

	const fakePart = JSON.parse(JSON.stringify(partDefinition))
	fakePart.cues = [jingleCue]

	part = { ...part, ...GetBreakerEffekt(context, config, fakePart) }

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
