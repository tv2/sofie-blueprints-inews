import { GetJinglePartPropertiesFromTableValue } from 'tv2-common'

describe('GetJinglePartPropertiesFromTableValue', () => {
	it('Calculates values correctly', () => {
		const properties = GetJinglePartPropertiesFromTableValue({
			BreakerName: 'intro',
			ClipName: 'intro',
			Duration: 200,
			StartAlpha: 50,
			EndAlpha: 100,
			Autonext: true,
			LoadFirstFrame: false
		})
		expect(properties).toEqual({
			expectedDuration: 6000,
			autoNextOverlap: 4000,
			autoNext: true,
			disableNextInTransition: false
		})
	})
})
