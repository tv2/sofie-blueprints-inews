import {
	ConfigItemValue,
	NotesContext,
	ShowStyleContext,
	TableConfigItemValue
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import {
	applyToConfig,
	defaultStudioConfig,
	OfftubeStudioBlueprintConfig as OffTubeBlueprintConfigBase,
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

export interface OffTubeShowstyleBlueprintConfig extends OffTubeBlueprintConfigBase {
	showStyle: ShowStyleConfig
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

export interface ShowStyleConfig {
	CasparCGLoadingClip: string
	DVEStyles: DVEConfigInput[]
	GFXTemplates: TableConfigItemGFXTemplates[]
	WipesConfig: TableConfigItemValue
	BreakerConfig: TableConfigItemValue
	DefaultTemplateDuration: number
	LYDConfig: TableConfigItemValue
}

function extendWithShowStyleConfig(
	context: NotesContext,
	baseConfig: OffTubeBlueprintConfigBase,
	values: { [key: string]: ConfigItemValue }
): OffTubeShowstyleBlueprintConfig {
	const config = literal<OffTubeShowstyleBlueprintConfig>({
		...baseConfig,
		showStyle: {} as any
	})

	applyToConfig(context, config.showStyle, showStyleConfigManifest, 'ShowStyle', values)

	return config
}

export function defaultConfig(context: NotesContext): OffTubeShowstyleBlueprintConfig {
	return extendWithShowStyleConfig(context, defaultStudioConfig(context), {})
}

export function parseConfig(context: ShowStyleContext): OffTubeShowstyleBlueprintConfig {
	return extendWithShowStyleConfig(context, parseStudioConfig(context), context.getShowStyleConfig())
}
