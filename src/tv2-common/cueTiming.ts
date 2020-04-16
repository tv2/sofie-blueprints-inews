import { CueDefinition, CueDefinitionBase, CueTime } from './inewsConversion/converters/ParseCue'

import { IBlueprintAdLibPiece, IBlueprintPiece, PieceLifespan } from 'tv-automation-sofie-blueprints-integration'

const FRAME_TIME = 1000 / 25 // TODO: This should be pulled from config.

export function CreateTiming(
	cue: CueDefinition
): Pick<IBlueprintPiece, 'enable' | 'infiniteMode'> | Pick<IBlueprintAdLibPiece, 'infiniteMode' | 'expectedDuration'> {
	if (cue.adlib) {
		return CreateTimingAdLib(cue)
	} else {
		return CreateTimingEnable(cue)
	}
}

export function CreateTimingEnable(cue: CueDefinition): Pick<IBlueprintPiece, 'enable' | 'infiniteMode'> {
	const result: Pick<IBlueprintPiece, 'enable' | 'infiniteMode'> = {
		enable: {},
		infiniteMode: PieceLifespan.Normal
	}

	if (cue.start) {
		;(result.enable as any).start = CalculateTime(cue.start)
	} else {
		;(result.enable as any).start = 0
	}

	if (cue.end) {
		if (cue.end.infiniteMode) {
			result.infiniteMode = InfiniteMode(cue.end.infiniteMode, PieceLifespan.Normal)
		} else {
			const end = CalculateTime(cue.end)
			;(result.enable as any).duration = end
				? result.enable.start
					? end - Number(result.enable.start)
					: end
				: undefined
		}
	} else {
		result.infiniteMode = PieceLifespan.OutOnNextPart
	}

	return result
}

export function CreateTimingAdLib(
	cue: CueDefinitionBase
): Pick<IBlueprintAdLibPiece, 'infiniteMode' | 'expectedDuration'> {
	const result: Pick<IBlueprintAdLibPiece, 'infiniteMode' | 'expectedDuration'> = {
		infiniteMode: PieceLifespan.OutOnNextPart,
		expectedDuration: 0
	}

	if (cue.end) {
		if (cue.end.infiniteMode) {
			result.infiniteMode = InfiniteMode(cue.end.infiniteMode, PieceLifespan.OutOnNextPart)
		} else {
			result.expectedDuration = CalculateTime(cue.end)
		}
	}

	return result
}

export function InfiniteMode(mode: 'B' | 'S' | 'O', defaultLifespan: PieceLifespan): PieceLifespan {
	switch (mode) {
		case 'B':
			return PieceLifespan.OutOnNextPart
		case 'S':
			return PieceLifespan.OutOnNextSegment
		case 'O':
			return PieceLifespan.Infinite
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
