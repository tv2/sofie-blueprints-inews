import {
	ConfigManifestEntryTable,
	ConfigManifestEntryType,
	IBlueprintAdLibPiece,
	PieceLifespan,
	TableConfigItemValue,
	TSR
} from '@sofie-automation/blueprints-integration'
import { AtemLLayerDSK, literal, SourceLayerAtemDSK } from 'tv2-common'
import { AdlibTags, DSKRoles, SharedOutputLayers } from 'tv2-constants'
import { ATEMModel } from '../../types/atem'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { TableConfigItemDSK } from '../types'

export function FindDSKFullGFX(config: TV2BlueprintConfigBase<TV2StudioConfigBase>): TableConfigItemDSK {
	return FindDSKWithRoles(config, [DSKRoles.FULLGFX])
}

export function FindDSKOverlayGFX(config: TV2BlueprintConfigBase<TV2StudioConfigBase>): TableConfigItemDSK {
	return FindDSKWithRoles(config, [DSKRoles.OVERLAYGFX])
}

export function FindDSKJingle(config: TV2BlueprintConfigBase<TV2StudioConfigBase>): TableConfigItemDSK {
	return FindDSKWithRoles(config, [DSKRoles.JINGLE])
}

function FindDSKWithRoles(config: TV2BlueprintConfigBase<TV2StudioConfigBase>, roles: DSKRoles[]): TableConfigItemDSK {
	return config.dsk.find(dsk => dsk.Roles?.some(role => roles.includes(role))) ?? config.dsk[0]
}

export function GetDSKCount(atemModel: ATEMModel) {
	switch (atemModel) {
		case ATEMModel.CONSTELLATION_8K_8K_MODE:
			return 2
		case ATEMModel.CONSTELLATION_8K_UHD_MODE:
			return 4
		case ATEMModel.PRODUCTION_STUDIO_4K_2ME:
			return 2
		default:
			return 0
	}
}

export function EnableDSK(
	config: TV2BlueprintConfigBase<TV2StudioConfigBase>,
	dsk: 'FULL' | 'OVL' | 'JINGLE',
	enable?: TSR.TSRTimelineObj['enable']
): TSR.TSRTimelineObj[] {
	const dskConf =
		dsk === 'FULL' ? FindDSKFullGFX(config) : dsk === 'OVL' ? FindDSKOverlayGFX(config) : FindDSKJingle(config)

	return [
		literal<TSR.TimelineObjAtemDSK>({
			id: '',
			enable: enable ?? {
				start: 0
			},
			priority: 1,
			layer: AtemLLayerDSK(dskConf.Number),
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.DSK,
				dsk: {
					onAir: true,
					sources: {
						fillSource: dskConf.Fill,
						cutSource: dskConf.Key
					},
					properties: {
						clip: Number(dskConf.Clip) * 10,
						gain: Number(dskConf.Gain) * 10
					}
				}
			}
		})
	]
}

export function CreateDSKBaselineAdlibs(
	config: TV2BlueprintConfigBase<TV2StudioConfigBase>,
	baseRank: number
): IBlueprintAdLibPiece[] {
	const adlibItems: IBlueprintAdLibPiece[] = []
	for (const dsk of config.dsk) {
		if (dsk.Toggle) {
			if (dsk.DefaultOn) {
				adlibItems.push({
					externalId: `dskoff${dsk.Number}`,
					name: `DSK ${dsk.Number + 1} OFF`,
					_rank: baseRank + dsk.Number,
					sourceLayerId: SourceLayerAtemDSK(dsk.Number),
					outputLayerId: SharedOutputLayers.SEC,
					lifespan: PieceLifespan.OutOnRundownEnd,
					tags: [AdlibTags.ADLIB_STATIC_BUTTON],
					content: {
						timelineObjects: [
							literal<TSR.TimelineObjAtemDSK>({
								id: '',
								enable: { while: '1' },
								priority: 10,
								layer: AtemLLayerDSK(dsk.Number),
								content: {
									deviceType: TSR.DeviceType.ATEM,
									type: TSR.TimelineContentTypeAtem.DSK,
									dsk: {
										onAir: false
									}
								}
							})
						]
					}
				})
			} else {
				adlibItems.push({
					externalId: `dskon${dsk.Number}`,
					name: `DSK ${dsk.Number + 1} ON`,
					_rank: baseRank + dsk.Number,
					sourceLayerId: SourceLayerAtemDSK(dsk.Number),
					outputLayerId: SharedOutputLayers.SEC,
					lifespan: PieceLifespan.OutOnRundownEnd,
					tags: [AdlibTags.ADLIB_STATIC_BUTTON],
					content: {
						timelineObjects: [
							literal<TSR.TimelineObjAtemDSK>({
								id: '',
								enable: { while: '1' },
								priority: 10,
								layer: AtemLLayerDSK(dsk.Number),
								content: {
									deviceType: TSR.DeviceType.ATEM,
									type: TSR.TimelineContentTypeAtem.DSK,
									dsk: {
										onAir: true,
										sources: {
											fillSource: dsk.Fill,
											cutSource: dsk.Key
										},
										properties: {
											tie: false,
											preMultiply: false,
											clip: Number(dsk.Clip) * 10, // input is percents (0-100), atem uses 1-000,
											gain: Number(dsk.Gain) * 10, // input is percents (0-100), atem uses 1-000,
											mask: {
												enabled: false
											}
										}
									}
								}
							})
						]
					}
				})
			}
		}
	}
	return adlibItems
}

export function CreateDSKBaseline(config: TV2BlueprintConfigBase<TV2StudioConfigBase>): TSR.TSRTimelineObj[] {
	return config.dsk.map(dsk => {
		return literal<TSR.TimelineObjAtemDSK>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayerDSK(dsk.Number),
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.DSK,
				dsk: {
					onAir: dsk.DefaultOn,
					sources: {
						fillSource: dsk.Fill,
						cutSource: dsk.Key
					},
					properties: {
						tie: false,
						preMultiply: false,
						clip: Number(dsk.Clip) * 10, // input is percents (0-100), atem uses 1-000,
						gain: Number(dsk.Gain) * 10, // input is percents (0-100), atem uses 1-000,
						mask: {
							enabled: false
						}
					}
				}
			}
		})
	})
}

export function DSKConfigManifest(defaultVal: TableConfigItemDSK[]) {
	return literal<ConfigManifestEntryTable>({
		id: 'AtemSource.DSK',
		name: 'ATEM DSK',
		description: 'ATEM Downstream Keyers Fill and Key',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: literal<Array<TableConfigItemDSK & TableConfigItemValue[0]>>(
			defaultVal.map(dsk => ({ _id: '', ...dsk, Roles: dsk.Roles ?? [] }))
		),
		columns: [
			{
				id: 'Number',
				name: 'Number',
				description: 'DSK number, starting from 1',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 1,
				rank: 0,
				zeroBased: true
			},
			{
				id: 'Fill',
				name: 'ATEM Fill',
				description: 'ATEM vision mixer input for DSK Fill',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 21,
				rank: 1
			},
			{
				id: 'Key',
				name: 'ATEM Key',
				description: 'ATEM vision mixer input for DSK Key',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 34,
				rank: 2
			},
			{
				id: 'Toggle',
				name: 'AdLib Toggle',
				description: 'Make AdLib that toggles the DSK',
				type: ConfigManifestEntryType.BOOLEAN,
				required: true,
				defaultVal: false,
				rank: 3
			},
			{
				id: 'DefaultOn',
				name: 'On by default',
				description: 'Enable the DSK in the baseline',
				type: ConfigManifestEntryType.BOOLEAN,
				required: true,
				defaultVal: false,
				rank: 4
			},
			{
				id: 'Roles',
				name: 'DSK Roles',
				description: 'Which roles this DSK configuration performs',
				type: ConfigManifestEntryType.SELECT,
				required: true,
				multiple: true,
				options: [DSKRoles.FULLGFX, DSKRoles.OVERLAYGFX, DSKRoles.JINGLE],
				defaultVal: [],
				rank: 5
			},
			{
				id: 'Clip',
				name: 'ATEM Clip',
				description: 'DSK Clip (0-100)',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '50',
				rank: 6
			},
			{
				id: 'Gain',
				name: 'ATEM Gain',
				description: 'DSK Gain (0-100)',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '12.5',
				rank: 7
			}
		]
	})
}
