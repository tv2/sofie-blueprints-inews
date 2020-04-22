import { assertUnreachable, isAdLibPiece } from '../util'

describe('util', () => {
	it('Detects AdLib piece', () => {
		expect(
			isAdLibPiece({
				_rank: 0,
				externalId: '-',
				name: 'test adlib',
				sourceLayerId: 'Cam',
				outputLayerId: 'pgm'
			})
		).toBeTruthy()

		expect(
			isAdLibPiece({
				_id: '-',
				externalId: '-',
				name: 'test non-adlib',
				sourceLayerId: 'Cam',
				outputLayerId: 'pgm',
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
