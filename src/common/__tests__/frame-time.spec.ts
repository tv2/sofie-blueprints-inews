import { IBlueprintPiece, PieceLifespan } from 'tv-automation-sofie-blueprints-integration'
import { CreateTiming } from '../cueTiming'
import { CueDefinitionUnknown, CueType } from '../inewsConversion/converters/ParseCue'
import { literal } from '../util'

describe('CreateTiming', () => {
	test('Start only (seconds)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			start: {
				seconds: 1
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 1000
				},
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	})

	test('Start only (frames)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			start: {
				frames: 1
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 40
				},
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	})

	test('Start only (seconds and frames)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			start: {
				seconds: 1,
				frames: 1
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 1040
				},
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	})

	test('End only (seconds)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				seconds: 1
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0,
					duration: 1000
				},
				infiniteMode: PieceLifespan.Normal
			})
		)
	})

	test('End only (frames)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				frames: 1
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0,
					duration: 40
				},
				infiniteMode: PieceLifespan.Normal
			})
		)
	})

	test('End only (seconds and frames)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				seconds: 1,
				frames: 1
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0,
					duration: 1040
				},
				infiniteMode: PieceLifespan.Normal
			})
		)
	})

	test('End only (B)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				infiniteMode: 'B'
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0
				},
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	})

	test('End only (S)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				infiniteMode: 'S'
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0
				},
				infiniteMode: PieceLifespan.OutOnNextSegment
			})
		)
	})

	test('End only (O)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				infiniteMode: 'O'
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0
				},
				infiniteMode: PieceLifespan.Infinite
			})
		)
	})

	test('Start and end (timing)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			start: {
				frames: 1
			},
			end: {
				seconds: 1
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 40,
					duration: 960
				},
				infiniteMode: PieceLifespan.Normal
			})
		)
	})

	test('Start and end (infinite)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			start: {
				frames: 1
			},
			end: {
				infiniteMode: 'B'
			},
			iNewsCommand: ''
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 40
				},
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	})
})
