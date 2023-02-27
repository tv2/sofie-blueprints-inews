import { TSR } from '../../../../../tv-automation-server-core/packages/blueprints-integration/src'
import { AtemToTricasterDveConverter } from '../atemToTricasterDveConverter'

describe('AtemToTricasterDveConverter', () => {
	describe('convertPosition', () => {
		it('receives x 800, x is set to 0.888', () => {
			testConvertPositionX(800, 0.888)
		})

		function testConvertPositionX(testValue: number, expectedResult: number): void {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['position'] = testee.convertPosition(testValue, 0)
			expect(result!.x).toBeCloseTo(expectedResult, 2)
		}

		it('receives x -800, x is set to -0.888', () => {
			testConvertPositionX(-800, -0.888)
		})

		it('receives x 800, x is set to 0.888', () => {
			testConvertPositionX(0, 0)
		})

		it('receives x 1055, x is set to 1.172', () => {
			testConvertPositionX(1055, 1.172)
		})

		it('receives x -1055, x is set to -1.172', () => {
			testConvertPositionX(-1055, -1.172)
		})

		it('receives x 500, x is set to 0.555', () => {
			testConvertPositionX(500, 0.555)
		})

		it('receives x -500, x is set to -0.555', () => {
			testConvertPositionX(-500, -0.555)
		})

		it('receives x 460, x is set to 0.511', () => {
			testConvertPositionX(460, 0.511)
		})

		it('receives x -460, x is set to -0.511', () => {
			testConvertPositionX(-460, -0.511)
		})

		it('receives y 100, y is set to -0.111', () => {
			testConvertPositionY(100, -0.111)
		})

		function testConvertPositionY(testValue: number, expectedResult: number): void {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['position'] = testee.convertPosition(0, testValue)
			expect(result!.y).toBeCloseTo(expectedResult, 2)
		}

		it('receives y -100, y is set to 0.111', () => {
			testConvertPositionY(-100, 0.111)
		})

		it('receives y 0, y is set to 0', () => {
			testConvertPositionY(0, 0)
		})

		it('receives y 400, y is set to -0.444', () => {
			testConvertPositionY(400, -0.444)
		})

		it('receives y -400, y is set to 0.444', () => {
			testConvertPositionY(-400, 0.444)
		})

		it('receives y 360, y is set to -0.4', () => {
			testConvertPositionY(360, -0.4)
		})

		it('receives y -360, y is set to 0.4', () => {
			testConvertPositionY(-360, 0.4)
		})

		it('receives y 250, y is set to -0.277', () => {
			testConvertPositionY(250, -0.277)
		})

		it('receives y -250, y is set to 0.277', () => {
			testConvertPositionY(-250, 0.277)
		})
	})

	describe('convertScale', () => {
		it('receives values 1000, x and y is 1', () => {
			testConvertScale(1000, 1)
		})

		function testConvertScale(testValue: number, expectedResult: number): void {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['scale'] = testee.convertScale(testValue)!
			expect(result.x).toBe(expectedResult)
			expect(result.y).toBe(expectedResult)
		}

		it('receives values 500, x and y is 0.5', () => {
			testConvertScale(500, 0.5)
		})

		it('receives values 333, x and y is 0.333', () => {
			testConvertScale(333, 0.333)
		})

		it('receives values 0, x and y is 0', () => {
			testConvertScale(0, 0)
		})
	})

	describe('convertCrop', () => {
		it('has cropped set to false, return 0 for all', () => {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['crop'] = testee.convertCrop(createCropObject(false, 12, 12, 12, 12))!
			expect(result.up).toBe(0)
			expect(result.down).toBe(0)
			expect(result.left).toBe(0)
			expect(result.right).toBe(0)
		})

		function createCropObject(
			cropped: boolean,
			cropTop: number,
			cropBottom: number,
			cropLeft: number,
			cropRight: number
		) {
			return {
				cropped,
				cropTop,
				cropBottom,
				cropLeft,
				cropRight
			}
		}

		it('has cropped set to true, but no values, return 0 for all', () => {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['crop'] = testee.convertCrop(createCropObject(true, 0, 0, 0, 0))!
			expect(result.up).toBe(0)
			expect(result.down).toBe(0)
			expect(result.left).toBe(0)
			expect(result.right).toBe(0)
		})

		it('has crop top 100, return crop up 0.555', () => {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['crop'] = testee.convertCrop(createCropObject(true, 100, 0, 0, 0))!
			expect(result.up).toBeCloseTo(0.555)
		})

		it('has crop top 8500, return crop up 47.222', () => {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['crop'] = testee.convertCrop(createCropObject(true, 8500, 0, 0, 0))!
			expect(result.up).toBeCloseTo(47.222)
		})

		it('has crop bottom 100, return crop down 0.555', () => {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['crop'] = testee.convertCrop(createCropObject(true, 0, 100, 0, 0))!
			expect(result.down).toBeCloseTo(0.555)
		})

		it('has crop bottom 8500, return crop down 47.222', () => {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['crop'] = testee.convertCrop(createCropObject(true, 0, 8500, 0, 0))!
			expect(result.down).toBeCloseTo(47.222)
		})

		it('has crop left 100, return crop left 0.312', () => {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['crop'] = testee.convertCrop(createCropObject(true, 0, 0, 100, 0))!
			expect(result.left).toBeCloseTo(0.312)
		})

		it('has crop left 6200, return crop left 19.375', () => {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['crop'] = testee.convertCrop(createCropObject(true, 0, 0, 6200, 0))!
			expect(result.left).toBeCloseTo(19.375)
		})

		it('has crop right 100, return crop right 0.312', () => {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['crop'] = testee.convertCrop(createCropObject(true, 0, 0, 0, 100))!
			expect(result.right).toBeCloseTo(0.312)
		})

		it('has crop right 6200, return crop right 19.375', () => {
			const testee = new AtemToTricasterDveConverter()
			const result: TSR.TriCasterLayer['crop'] = testee.convertCrop(createCropObject(true, 0, 0, 0, 6200))!
			expect(result.right).toBeCloseTo(19.375)
		})
	})
})
