import { calculateTime, CueTime } from 'tv2-common'

describe('calculateTime', () => {
	it('receives an infinite mode - returns undefined', () => {
		const time: CueTime = {
			infiniteMode: 'B'
		}
		const result = calculateTime(time)
		expect(result).toBeUndefined()
	})

	it('receives empty time - returns 0', () => {
		const time: CueTime = {}
		const result = calculateTime(time)
		expect(result).toBe(0)
	})

	it('receives time with 1 second - returns 1000', () => {
		const time: CueTime = {
			seconds: 1
		}
		const result = calculateTime(time)
		expect(result).toBe(1000)
	})

	it('receives time with 10 seconds - returns 10000', () => {
		const time: CueTime = {
			seconds: 10
		}
		const result = calculateTime(time)
		expect(result).toBe(10000)
	})

	it('receives time with 17 second - returns 17000', () => {
		const time: CueTime = {
			seconds: 17
		}
		const result = calculateTime(time)
		expect(result).toBe(17000)
	})

	it('receives time with 1 frame - returns 40', () => {
		const time: CueTime = {
			frames: 1
		}
		const result = calculateTime(time)
		expect(result).toBe(40)
	})

	it('receives time with 10 frames - returns 400', () => {
		const time: CueTime = {
			frames: 10
		}
		const result = calculateTime(time)
		expect(result).toBe(400)
	})

	it('receives time with 17 frames - returns 680', () => {
		const time: CueTime = {
			frames: 17
		}
		const result = calculateTime(time)
		expect(result).toBe(680)
	})

	it('receives both a infinite mode and seconds - returns undefined', () => {
		const time: CueTime = {
			infiniteMode: 'B',
			seconds: 29
		}
		const result = calculateTime(time)
		expect(result).toBeUndefined()
	})

	it('receives both a infinite mode and frames - returns undefined', () => {
		const time: CueTime = {
			infiniteMode: 'B',
			frames: 29
		}
		const result = calculateTime(time)
		expect(result).toBeUndefined()
	})

	it('receives 3 seconds and 4 frames - returns 3160', () => {
		const time: CueTime = {
			seconds: 3,
			frames: 4
		}
		const result = calculateTime(time)
		expect(result).toBe(3160)
	})

	it('receives 4 seconds and 3 frames - returns 4120', () => {
		const time: CueTime = {
			seconds: 4,
			frames: 3
		}
		const result = calculateTime(time)
		expect(result).toBe(4120)
	})
})
