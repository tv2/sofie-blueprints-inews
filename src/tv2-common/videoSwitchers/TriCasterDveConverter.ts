import { TSR } from 'blueprints-integration'

export interface TriCasterDveConverter {
	convertPosition(x: number, y: number): TSR.TriCasterLayer['position']
	convertScale(scale: number): TSR.TriCasterLayer['scale']
	convertCrop(crop: {
		cropped: boolean
		cropTop: number
		cropBottom: number
		cropLeft: number
		cropRight: number
	}): TSR.TriCasterLayer['crop']
}
