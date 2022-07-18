import { IBlueprintPiece, PieceLifespan } from '@tv2media/blueprints-integration'
import { CueType, SourceType } from 'tv2-constants'
import { CreateTiming } from '../cueTiming'
import { SourceDefinitionEkstern } from '../inewsConversion'
import { CueDefinitionEkstern } from '../inewsConversion/converters/ParseCue'
import { literal } from '../util'

const EKSTERN_SOURCE: SourceDefinitionEkstern = {
	sourceType: SourceType.REMOTE,
	variant: 'LIVE',
	id: '1',
	raw: 'Live 1',
	name: 'LIVE 1'
}

describe('CreateTiming', () => {
	test('Start only (seconds)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			start: {
				seconds: 1
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 1000,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart
			})
		)
	})

	test('Start only (frames)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			start: {
				frames: 1
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 40,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart
			})
		)
	})

	test('Start only (seconds and frames)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			start: {
				seconds: 1,
				frames: 1
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 1040,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart
			})
		)
	})

	test('End only (seconds)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			end: {
				seconds: 1
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 0,
					duration: 1000
				},
				lifespan: PieceLifespan.WithinPart
			})
		)
	})

	test('End only (frames)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			end: {
				frames: 1
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 0,
					duration: 40
				},
				lifespan: PieceLifespan.WithinPart
			})
		)
	})

	test('End only (seconds and frames)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			end: {
				seconds: 1,
				frames: 1
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 0,
					duration: 1040
				},
				lifespan: PieceLifespan.WithinPart
			})
		)
	})

	test('End only (B)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			end: {
				infiniteMode: 'B'
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 0
				},
				lifespan: PieceLifespan.WithinPart
			})
		)
	})

	test('End only (S)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			end: {
				infiniteMode: 'S'
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 0
				},
				lifespan: PieceLifespan.OutOnSegmentEnd
			})
		)
	})

	test('End only (O)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			end: {
				infiniteMode: 'O'
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 0
				},
				lifespan: PieceLifespan.OutOnShowStyleEnd
			})
		)
	})

	test('Start and end (timing)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			start: {
				frames: 1
			},
			end: {
				seconds: 1
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 40,
					duration: 960
				},
				lifespan: PieceLifespan.WithinPart
			})
		)
	})

	test('Start and end (infinite)', () => {
		const time: CueDefinitionEkstern = {
			type: CueType.Ekstern,
			start: {
				frames: 1
			},
			end: {
				infiniteMode: 'B'
			},
			iNewsCommand: '',
			sourceDefinition: EKSTERN_SOURCE
		}
		const result = CreateTiming(time, 4000)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'lifespan'>>({
				enable: {
					start: 40
				},
				lifespan: PieceLifespan.WithinPart
			})
		)
	})
})
