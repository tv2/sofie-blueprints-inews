import { CueDefinition, CueTime } from './inewsConversion/converters/ParseCue'

import { IBlueprintPiece, PieceLifespan } from 'blueprints-integration'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from 'tv2-common'

const FRAME_TIME = 1000 / 25 // TODO: This should be pulled from config.

export function GetDefaultOut<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(config: ShowStyleConfig): number {
	if (config.showStyle.DefaultTemplateDuration !== undefined) {
		return Number(config.showStyle.DefaultTemplateDuration) * 1000
	}

	return 4 * 1000
}

export function CreateTimingEnable(
	cue: CueDefinition,
	defaultOut?: number
): Pick<IBlueprintPiece, 'enable' | 'lifespan'> {
	const result: Pick<IBlueprintPiece, 'enable' | 'lifespan'> = {
		enable: {
			start: 0
		},
		lifespan: PieceLifespan.WithinPart
	}

	result.enable.start = (cue.start && CalculateTime(cue.start)) ?? 0

	if (cue.end) {
		if (cue.end.infiniteMode) {
			result.lifespan = LifeSpan(cue.end.infiniteMode)
		} else {
			const end = CalculateTime(cue.end)
			result.enable.duration = end ? end - result.enable.start : undefined
		}
	} else if (defaultOut !== undefined) {
		result.enable.duration = defaultOut
	}

	return result
}

export function LifeSpan(mode: 'B' | 'S' | 'O'): PieceLifespan {
	switch (mode) {
		case 'B':
			return PieceLifespan.WithinPart
		case 'S':
			return PieceLifespan.OutOnSegmentEnd
		case 'O':
			return PieceLifespan.OutOnShowStyleEnd
	}
}

export function CalculateTime(time: CueTime): number | undefined {
	if (time.infiniteMode) {
		return
	}

	let result = 0
	if (time.seconds) {
		result += time.seconds * 1000
	}

	if (time.frames) {
		result += time.frames * FRAME_TIME
	}

	return result
}
