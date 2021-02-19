import { DSKConfig, TV2StudioConfigBase } from '../blueprintConfig'
import { TableConfigItemDSK } from '../types'

export function parseDSK(studioConfig: TV2StudioConfigBase, defaultDSK: TableConfigItemDSK): DSKConfig {
	const dsk: DSKConfig = { 1: studioConfig.AtemSource.DSK.find(d => d.Number === 1) || defaultDSK }
	studioConfig.AtemSource.DSK.forEach(d => (dsk[d.Number] = d))
	return dsk
}
