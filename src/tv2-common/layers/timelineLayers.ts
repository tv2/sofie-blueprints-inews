import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from '@sofie-automation/blueprints-integration'
import { literal } from 'tv2-common'
import { ATEMModel } from '../../types/atem'
import { GetDSKCount } from '../helpers'

export function SisyfosEVSSource(i: number | string) {
	return `sisyfos_source_evs_${i}`
}

export function AbstractLLayerServerEnable(i: number) {
	return `server_enable_${i}`
}

export function CasparPlayerClip(i: number | string) {
	return `casparcg_player_clip_${i}`
}

export function CasparPlayerClipLoadingLoop(i: number | string) {
	return `casparcg_player_clip_${i}_loading_loop`
}

export function SisyfosPlayerClip(i: number | string) {
	return `sisyfos_player_clip_${i}`
}

/**
 * Created layer mapping name for a DSK
 * @param i DSK number starting from 0
 */
export function AtemLLayerDSK(i: number) {
	return `atem_dsk_${i + 1}`
}

export function GetDSKMappingNames(atemModel: ATEMModel): string[] {
	const names: string[] = []

	for (let i = 0; i < GetDSKCount(atemModel); i++) {
		names.push(AtemLLayerDSK(i))
	}

	return names
}

export function GetDSKMappings(atemModel: ATEMModel): BlueprintMappings {
	const base: BlueprintMappings = {}
	return GetDSKMappingNames(atemModel).reduce((prev, name) => {
		prev[name] = literal<TSR.MappingAtem & BlueprintMapping>({
			device: TSR.DeviceType.ATEM,
			deviceId: 'atem0',
			lookahead: LookaheadMode.NONE,
			mappingType: TSR.MappingAtemType.DownStreamKeyer,
			index: 0 // 0 = DSK1
		})
		return prev
	}, base)
}
