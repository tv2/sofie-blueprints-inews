import { ISourceLayer, SourceLayerType } from '@tv2media/blueprints-integration'
import { ATEMModel } from '../../types/atem'
import { GetDSKCount } from '../helpers'

/**
 * Get the sourcelayer name for a given DSK.
 * @param i DSK number (starting from 0)
 */
export function SourceLayerAtemDSK(i: number): string {
	return `studio0_dsk_${i + 1}_cmd`
}

function GetSourceLayerDefaultsForDSK(i: number): ISourceLayer {
	return {
		_id: SourceLayerAtemDSK(i),
		_rank: 22,
		name: `DSK${i + 1} off`,
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,
		isSticky: false,
		isQueueable: false,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: false
	}
}

export function GetDSKSourceLayerNames(atemModel: ATEMModel): string[] {
	const names: string[] = []

	for (let i = 0; i < GetDSKCount(atemModel); i++) {
		names.push(SourceLayerAtemDSK(i))
	}

	return names
}

export function GetDSKSourceLayerDefaults(atemModel: ATEMModel): ISourceLayer[] {
	const defaults: ISourceLayer[] = []

	for (let i = 0; i < GetDSKCount(atemModel); i++) {
		defaults.push(GetSourceLayerDefaultsForDSK(i))
	}

	return defaults
}
