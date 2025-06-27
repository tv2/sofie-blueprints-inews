import { GetJinglePartPropertiesFromTableValue } from 'tv2-common'

const BREAKER = {
	BreakerName: 'intro',
	ClipName: 'intro',
	LoadFirstFrame: false,
	Autonext: true,
	Duration: 200,
	StartAlpha: 50,
	EndAlpha: 100
}

describe('GetJinglePartPropertiesFromTableValue', () => {
	it('Subtracts StartAlpha from Duration', () => {
		const properties = GetJinglePartPropertiesFromTableValue({
			...BREAKER,
			Duration: 200,
			MixDurationInFrames: 0,
			StartAlpha: 50,
			EndAlpha: 100
		})
		expect(properties.expectedDuration).toBe(6000)
	})
	it('Clamps Duration when StartAlpha > Duration', () => {
		const properties = GetJinglePartPropertiesFromTableValue({
			...BREAKER,
			Duration: 50,
			MixDurationInFrames: 0,
			StartAlpha: 100,
			EndAlpha: 50
		})
		expect(properties.expectedDuration).toBe(0)
	})
	it('Calculates autoNextOverlap from EndAlpha', () => {
		const properties = GetJinglePartPropertiesFromTableValue({
			...BREAKER,
			Duration: 100,
			MixDurationInFrames: 0,
			StartAlpha: 20,
			EndAlpha: 50
		})
		expect(properties.autoNextOverlap).toBe(2000)
	})
	it('Clamps autoNextOverlap when EndAlpha > Duration - StartAlpha', () => {
		const properties = GetJinglePartPropertiesFromTableValue({
			...BREAKER,
			Duration: 100,
			MixDurationInFrames: 0,
			StartAlpha: 75,
			EndAlpha: 50
		})
		expect(properties.autoNextOverlap).toBe(1000)
	})
	it('Disables autoNext when Autonext is false', () => {
		const properties = GetJinglePartPropertiesFromTableValue({
			...BREAKER,
			MixDurationInFrames: 0,
			Autonext: false
		})
		expect(properties.autoNext).toBe(false)
	})
	it('Enables autoNext when Autonext is true', () => {
		const properties = GetJinglePartPropertiesFromTableValue({
			...BREAKER,
			MixDurationInFrames: 0,
			Autonext: true
		})
		expect(properties.autoNext).toBe(true)
	})
})
