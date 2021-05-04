import { ISourceLayer, SourceLayerType } from '@sofie-automation/blueprints-integration'
import { ATEMModel } from '../../types/atem'
import { GetDSKCount } from '../helpers'
import { literal } from '../util'

/**
 * Get the sourcelayer name for a given DSK.
 * @param i DSK number (starting from 0)
 */
export function SourceLayerAtemDSK(i: number): string {
	return `studio0_dsk_${i + 1}_cmd`
}

function GetSourceLayerDefaultsForDSK(i: number): ISourceLayer {
	return literal<ISourceLayer>({
		_id: SourceLayerAtemDSK(i),
		_rank: 22,
		name: `DSK${i + 1} off`,
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: ',',
		assignHotkeysToGlobalAdlibs: true,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: false
	})
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
