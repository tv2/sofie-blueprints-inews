import { CueDefinition, CueDefinitionBase, CueTime } from './inewsConversion/converters/ParseCue'

import { IBlueprintAdLibPiece, IBlueprintPiece, PieceLifespan } from '@tv2media/blueprints-integration'
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

export function CreateTiming(
	cue: CueDefinition,
	defaultOut: number
): Pick<IBlueprintPiece, 'enable' | 'lifespan'> | Pick<IBlueprintAdLibPiece, 'lifespan' | 'expectedDuration'> {
	if (cue.adlib) {
		return CreateTimingAdLib(cue)
	} else {
		return CreateTimingEnable(cue, defaultOut)
	}
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
			result.lifespan = LifeSpan(cue.end.infiniteMode, PieceLifespan.WithinPart)
		} else {
			const end = CalculateTime(cue.end)
			result.enable.duration = end ? end - result.enable.start : undefined
		}
	} else if (defaultOut !== undefined) {
		result.enable.duration = defaultOut
	}

	return result
}

export function CreateTimingAdLib(cue: CueDefinitionBase): Pick<IBlueprintAdLibPiece, 'lifespan' | 'expectedDuration'> {
	const result: Pick<IBlueprintAdLibPiece, 'lifespan' | 'expectedDuration'> = {
		lifespan: PieceLifespan.WithinPart,
		expectedDuration: 0
	}

	if (cue.end) {
		if (cue.end.infiniteMode) {
			result.lifespan = LifeSpan(cue.end.infiniteMode, PieceLifespan.WithinPart)
		} else {
			result.expectedDuration = CalculateTime(cue.end)
		}
	}

	return result
}

export function LifeSpan(mode: 'B' | 'S' | 'O', defaultLifespan: PieceLifespan): PieceLifespan {
	switch (mode) {
		case 'B':
			return PieceLifespan.WithinPart
		case 'S':
			return PieceLifespan.OutOnSegmentEnd
		case 'O':
			return PieceLifespan.OutOnShowStyleEnd
	}

	return defaultLifespan
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
