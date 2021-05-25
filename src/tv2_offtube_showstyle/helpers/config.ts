import {
	IBlueprintConfig,
	ICommonContext,
	IShowStyleContext,
	IStudioContext,
	TableConfigItemValue
} from '@sofie-automation/blueprints-integration'
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
	IsDesign: boolean
}

export interface OfftubeShowstyleBlueprintConfig extends OfftubeStudioBlueprintConfig {
	showStyle: OfftubeShowStyleConfig
}

export interface DVEConfigInput {
	DVEName: string
	DVEJSON: string
	DVEGraphicsTemplateJSON: string
	DVEInputs: string
	DVEGraphicsKey: string
	DVEGraphicsFrame: string
}

export interface OfftubeShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	WipesConfig: TableConfigItemValue
}

export function parseConfig(_context: ICommonContext, config: IBlueprintConfig): any {
	return { showStyle: config }
}

export function getConfig(context: IShowStyleContext): OfftubeShowstyleBlueprintConfig {
	return ({
		...(context.getStudioConfig() as any),
		...(context.getShowStyleConfig() as any)
	} as any) as OfftubeShowstyleBlueprintConfig
}

export function getStudioConfig(context: IStudioContext): OfftubeShowstyleBlueprintConfig {
	return context.getStudioConfig() as OfftubeShowstyleBlueprintConfig
}
