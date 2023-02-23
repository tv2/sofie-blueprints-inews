import {
	ConfigManifestEntryTable,
	ConfigManifestEntryType,
	IBlueprintAdLibPiece,
	PieceLifespan,
	TableConfigItemValue,
	TSR
} from 'blueprints-integration'
import { ExtendedShowStyleContext, getDskLLayerName, literal, SourceLayerAtemDSK, VideoSwitcher } from 'tv2-common'
import { AdlibTags, DSKRoles, SharedOutputLayers } from 'tv2-constants'
import { ATEMModel } from '../../types/atem'
import { TV2BlueprintConfigBase, TV2ShowStyleConfig, TV2StudioConfigBase } from '../blueprintConfig'
import { TableConfigItemDSK } from '../types'

export function FindDSKFullGFX(config: TV2ShowStyleConfig): TableConfigItemDSK {
	return FindDSKWithRoles(config, [DSKRoles.FULLGFX])
}

export function FindDSKOverlayGFX(config: TV2ShowStyleConfig): TableConfigItemDSK {
	return FindDSKWithRoles(config, [DSKRoles.OVERLAYGFX])
}

export function FindDSKJingle(config: TV2ShowStyleConfig): TableConfigItemDSK {
	return FindDSKWithRoles(config, [DSKRoles.JINGLE])
}

function FindDSKWithRoles(config: TV2ShowStyleConfig, roles: DSKRoles[]): TableConfigItemDSK {
	return config.dsk.find((dsk) => dsk.Roles?.some((role) => roles.includes(role))) ?? config.dsk[0]
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

export function getDskOnAirTimelineObjects(
	context: ExtendedShowStyleContext<TV2ShowStyleConfig>,
	dskRole: DSKRoles,
	enable?: TSR.TSRTimelineObj['enable']
): TSR.TSRTimelineObj[] {
	const dskConf = FindDSKWithRoles(context.config, [dskRole])
	return [
		context.videoSwitcher.getDskTimelineObject({
			enable: enable ?? {
				start: 0
			},
			priority: 1,
			layer: getDskLLayerName(dskConf.Number),
			content: {
				onAir: true,
				config: dskConf
			}
		}),
		...(dskRole === DSKRoles.JINGLE && context.uniformConfig.switcherLLayers.jingleUskMixEffect
			? [
					context.videoSwitcher.getMixEffectTimelineObject({
						enable: enable ?? {
							start: 0
						},
						priority: 1,
						layer: context.uniformConfig.switcherLLayers.jingleUskMixEffect,
						content: {
							keyers: [
								{
									onAir: true,
									config: dskConf
								}
							]
						}
					})
			  ]
			: [])
	]
}

export function CreateDSKBaselineAdlibs(
	config: TV2BlueprintConfigBase<TV2StudioConfigBase>,
	baseRank: number,
	videoSwitcher: VideoSwitcher
): IBlueprintAdLibPiece[] {
	const adlibItems: IBlueprintAdLibPiece[] = []
	for (const dsk of config.dsk) {
		if (dsk.Toggle) {
			if (dsk.DefaultOn) {
				adlibItems.push({
					externalId: `dskoff${dsk.Number}`,
					name: `DSK ${dsk.Number + 1} ON`,
					_rank: baseRank + dsk.Number,
					sourceLayerId: SourceLayerAtemDSK(dsk.Number),
					outputLayerId: SharedOutputLayers.SEC,
					lifespan: PieceLifespan.OutOnRundownChange,
					tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_NO_NEXT_HIGHLIGHT, AdlibTags.ADLIB_DSK_OFF],
					invertOnAirState: true,
					content: {
						timelineObjects: [
							videoSwitcher.getDskTimelineObject({
								enable: { while: '1' },
								priority: 10,
								layer: getDskLLayerName(dsk.Number),
								content: {
									onAir: false,
									config: dsk
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
					lifespan: PieceLifespan.OutOnRundownChange,
					tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_NO_NEXT_HIGHLIGHT, AdlibTags.ADLIB_DSK_ON],
					content: {
						timelineObjects: [
							videoSwitcher.getDskTimelineObject({
								id: '',
								enable: { while: '1' },
								priority: 10,
								layer: getDskLLayerName(dsk.Number),
								content: {
									onAir: true,
									config: dsk
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

export function createDskBaseline(
	config: TV2BlueprintConfigBase<TV2StudioConfigBase>,
	videoSwitcher: VideoSwitcher
): TSR.TSRTimelineObj[] {
	return config.dsk.map((dsk) => {
		return videoSwitcher.getDskTimelineObject({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: getDskLLayerName(dsk.Number),
			content: {
				onAir: dsk.DefaultOn,
				config: dsk
			}
		})
	})
}

export function DSKConfigManifest(defaultVal: TableConfigItemDSK[]) {
	return literal<ConfigManifestEntryTable>({
		id: 'SwitcherSource.DSK',
		name: 'Switcher DSK',
		description: 'Video Switcher Downstream Keyers Fill and Key',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: literal<Array<TableConfigItemDSK & TableConfigItemValue[0]>>(
			defaultVal.map((dsk) => ({ _id: '', ...dsk, Roles: dsk.Roles ?? [] }))
		),
		columns: [
			{
				id: 'Number',
				name: 'Number',
				description: 'DSK number, starting from 1',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 1,
				rank: 0,
				zeroBased: true
			},
			{
				id: 'Fill',
				name: 'Switcher Fill',
				description: 'Video Switcher input for DSK Fill',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 21,
				rank: 1
			},
			{
				id: 'Key',
				name: 'Switcher Key',
				description: 'Video Switcher input for DSK Key',
				type: ConfigManifestEntryType.INT,
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
				description: 'DSK Clip (0-100), only used in the ATEM',
				type: ConfigManifestEntryType.FLOAT,
				required: true,
				defaultVal: 50,
				rank: 6
			},
			{
				id: 'Gain',
				name: 'ATEM Gain',
				description: 'DSK Gain (0-100), only used in the ATEM',
				type: ConfigManifestEntryType.FLOAT,
				required: true,
				defaultVal: 12.5,
				rank: 7
			}
		]
	})
}
