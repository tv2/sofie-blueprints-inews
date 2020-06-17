import {
	ConfigItemValue,
	NotesContext,
	ShowStyleContext,
	TableConfigItemValue
} from 'tv-automation-sofie-blueprints-integration'
import { literal, TV2ShowstyleBlueprintConfigBase } from 'tv2-common'
import * as _ from 'underscore'
import {
	applyToConfig,
	defaultStudioConfig,
	OfftubeStudioBlueprintConfig,
	parseStudioConfig
} from '../../tv2_offtube_studio/helpers/config'
import { showStyleConfigManifest } from '../config-manifests'

export interface TableConfigItemGFXTemplates {
	VizTemplate: string
	SourceLayer: string
	LayerMapping: string
	INewsCode: string
	INewsName: string
	VizDestination: string
	OutType: string
	Argument1: string
	Argument2: string
	IsDesign: boolean
}

export interface OfftubeShowstyleBlueprintConfig extends OfftubeStudioBlueprintConfig {
	showStyle: OfftubeShowStyleConfig
}

export interface DVEConfigInput {
	// _id: string
	DVEName: string
	DVEJSON: string
	DVEGraphicsTemplate: string
	DVEGraphicsTemplateJSON: string
	DVEInputs: string
	DVEGraphicsKey: string
	DVEGraphicsFrame: string
	// [key: string]: BasicConfigItemValue
}

export interface OfftubeShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	GFXTemplates: TableConfigItemGFXTemplates[]
	WipesConfig: TableConfigItemValue
	LYDConfig: TableConfigItemValue
}

function extendWithShowStyleConfig(
	context: NotesContext,
	baseConfig: OfftubeStudioBlueprintConfig,
	values: { [key: string]: ConfigItemValue }
): OfftubeShowstyleBlueprintConfig {
	const config = literal<OfftubeShowstyleBlueprintConfig>({
		...baseConfig,
		showStyle: {} as any
	})

	applyToConfig(context, config.showStyle, showStyleConfigManifest, 'ShowStyle', values)

	return config
}

export function defaultConfig(context: NotesContext): OfftubeShowstyleBlueprintConfig {
	return extendWithShowStyleConfig(context, defaultStudioConfig(context), {})
}

export function parseConfig(context: ShowStyleContext): OfftubeShowstyleBlueprintConfig {
	return extendWithShowStyleConfig(context, parseStudioConfig(context), context.getShowStyleConfig())
}
