import { PieceLifespan } from '@sofie-automation/blueprints-integration'
import { SharedOutputLayers } from 'tv2-constants'
import { assertUnreachable, isAdLibPiece } from '../util'

describe('util', () => {
	it('Detects AdLib piece', () => {
		expect(
			isAdLibPiece({
				_rank: 0,
				externalId: '-',
				name: 'test adlib',
				sourceLayerId: 'Cam',
				outputLayerId: SharedOutputLayers.PGM,
				lifespan: PieceLifespan.WithinPart
			})
		).toBeTruthy()

		expect(
			isAdLibPiece({
				externalId: '-',
				name: 'test non-adlib',
				sourceLayerId: 'Cam',
				outputLayerId: SharedOutputLayers.PGM,
				lifespan: PieceLifespan.WithinPart,
				enable: {
					start: 0
				}
			})
		).toBeFalsy()
	})

	it('Asserts Unreachable', () => {
		expect(() => {
			// @ts-ignore
			assertUnreachable({})
		}).toThrowError()
	})
})
