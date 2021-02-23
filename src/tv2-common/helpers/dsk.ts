import { DSKConfig, TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { TableConfigItemDSK } from '../types'

export function parseDSK(studioConfig: TV2StudioConfigBase, defaultDSK: TableConfigItemDSK): DSKConfig {
	const dsk: DSKConfig = { 1: studioConfig.AtemSource.DSK.find(d => d.Number === 1) || defaultDSK }
	studioConfig.AtemSource.DSK.forEach(d => (dsk[d.Number] = d))
	return dsk
}

export function FindFullSourceDSK(config: TV2BlueprintConfigBase<TV2StudioConfigBase>): TableConfigItemDSK {
	return Object.values(config.dsk).find(dsk => dsk.FullSource) || config.dsk[1]
}
