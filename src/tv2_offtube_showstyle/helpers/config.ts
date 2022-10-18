import {
	IBlueprintConfig,
	ICommonContext,
	IShowStyleContext,
	IStudioContext,
	TableConfigItemValue
} from 'blueprints-integration'
import { findGraphicsSetup, TableConfigGraphicsSetup, TV2ShowstyleBlueprintConfigBase } from 'tv2-common'
import * as _ from 'underscore'
import { OfftubeStudioBlueprintConfig } from '../../tv2_offtube_studio/helpers/config'

export interface TableConfigItemGfxTemplates {
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
	selectedGraphicsSetup: TableConfigGraphicsSetup
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
	GraphicsSetups: TableConfigGraphicsSetup[]
}

export function parseConfig(context: ICommonContext, rawConfig: IBlueprintConfig): any {
	const showstyleConfig = (rawConfig as unknown) as OfftubeShowStyleConfig
	const selectedGraphicsSetup = findGraphicsSetup(context, showstyleConfig, {
		Name: '',
		OvlShowName: ''
	})
	return {
		showStyle: showstyleConfig,
		selectedGraphicsSetup
	}
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
