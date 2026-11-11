import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from 'blueprints-integration'
import { literal, M2LX_WIPE_EFFECTS, parseM2LXConfiguration, SwitcherInput, TV2StudioConfigBase } from 'tv2-common'
import { defaultStudioConfig } from '../tv2_afvd_showstyle/__tests__/configs'

export function m2lxStudioSettings(json: string, deviceId = 'native') {
	const config = parseM2LXConfiguration(json)
	const mappingDefaults: BlueprintMappings = {
		m2lx_me_program: literal<TSR.MappingM2LXMixer & BlueprintMapping>({
			device: TSR.DeviceType.M2LX,
			deviceId,
			mappingType: TSR.MappingM2LXType.MIXER,
			lookahead: LookaheadMode.PRELOAD,
			lookaheadDepth: 1
		})
	}
	for (const row of config.keyers) {
		mappingDefaults[`m2lx_${row.layer}`] = literal<TSR.MappingM2LXKeyer & BlueprintMapping>({
			device: TSR.DeviceType.M2LX,
			deviceId,
			mappingType: TSR.MappingM2LXType.KEYER,
			bus: row.bus,
			keyer: row.keyer,
			lookahead: LookaheadMode.NONE
		})
	}
	for (const row of config.routers) {
		mappingDefaults[`m2lx_${row.layer}`] = literal<TSR.MappingM2LXRouter & BlueprintMapping>({
			device: TSR.DeviceType.M2LX,
			deviceId,
			mappingType: TSR.MappingM2LXType.ROUTER,
			node: row.node,
			output: row.output,
			lookahead: LookaheadMode.NONE
		})
	}
	const studioConfig: Partial<TV2StudioConfigBase> = {
		SwitcherSource: {
			...defaultStudioConfig.SwitcherSource,
			Default:
				config.sources.find(row => row.input === defaultStudioConfig.SwitcherSource.Default)?.source ??
				config.sources[0]?.source ??
				'default',
			SplitBackground: config.sources[0]?.source ?? 'default',
			DSK: config.keyers
				.filter(row => row.composition)
				.map(row => ({
					...row.composition!,
					Toggle: true,
					DefaultOn: false,
					UsePreconfigured: row.preconfigured,
					SourceName: row.source?.name ?? ''
				}))
		}
	}
	const sourceName = (input: SwitcherInput) =>
		config.sources.find(row => row.input === input)?.source ?? input.toString()
	for (const table of ['SourcesCam', 'SourcesRM', 'SourcesFeed'] as const) {
		studioConfig[table] = defaultStudioConfig[table].map(row => ({
			...row,
			SwitcherSource: sourceName(row.SwitcherSource)
		}))
	}
	return {
		studioConfig,
		mappingDefaults,
		showStyleConfig: {
			DefaultWipeDirection: Object.keys(M2LX_WIPE_EFFECTS).find(key => M2LX_WIPE_EFFECTS[key] === config.wipe)
		}
	}
}
