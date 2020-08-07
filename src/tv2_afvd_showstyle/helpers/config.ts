import {
	ConfigItemValue,
	NotesContext,
	ShowStyleContext,
	TableConfigItemValue
} from 'tv-automation-sofie-blueprints-integration'
import { literal, TableConfigItemGFXTemplates, TV2ShowstyleBlueprintConfigBase } from 'tv2-common'
import * as _ from 'underscore'
import {
	applyToConfig,
	BlueprintConfig as BlueprintConfigBase,
	defaultStudioConfig,
	parseStudioConfig
} from '../../tv2_afvd_studio/helpers/config'
import { showStyleConfigManifest } from '../config-manifests'

export interface BlueprintConfig extends BlueprintConfigBase {
	showStyle: ShowStyleConfig
}

export interface ShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	MakeAdlibsForFulls: boolean
	GFXTemplates: TableConfigItemGFXTemplates[]
	WipesConfig: TableConfigItemValue
	LYDConfig: TableConfigItemValue
}

function extendWithShowStyleConfig(
	context: NotesContext,
	baseConfig: BlueprintConfigBase,
	values: { [key: string]: ConfigItemValue }
): BlueprintConfig {
	const config = literal<BlueprintConfig>({
		...baseConfig,
		showStyle: {} as any
	})

	applyToConfig(context, config.showStyle, showStyleConfigManifest, 'ShowStyle', values)

	return config
}

export function defaultConfig(context: NotesContext): BlueprintConfig {
	return extendWithShowStyleConfig(context, defaultStudioConfig(context), {})
}

export function parseConfig(context: ShowStyleContext): BlueprintConfig {
	return extendWithShowStyleConfig(context, parseStudioConfig(context), context.getShowStyleConfig())
}
