import { IBlueprintConfig, ShowStyleContext, TableConfigItemValue } from 'tv-automation-sofie-blueprints-integration'
import { TV2ShowstyleBlueprintConfigBase } from 'tv2-common'
import * as _ from 'underscore'
import { OfftubeStudioBlueprintConfig } from '../../tv2_offtube_studio/helpers/config'

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

/*
export function defaultConfig(context: NotesContext): OfftubeShowstyleBlueprintConfig {
	return extendWithShowStyleConfig(context, defaultStudioConfig(context), {})
}
*/

export function parseConfig(config: IBlueprintConfig): any {
	return { showStyle: config }
}

export function getConfig(context: ShowStyleContext): OfftubeShowstyleBlueprintConfig {
	return ({ ...context.getStudioConfig(), ...context.getShowStyleConfig() } as any) as OfftubeShowstyleBlueprintConfig
}
