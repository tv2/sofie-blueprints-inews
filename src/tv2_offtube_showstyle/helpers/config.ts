import {
	IBlueprintConfig,
	ICommonContext,
	IShowStyleContext,
	IStudioContext,
	TableConfigItemValue
} from 'blueprints-integration'
import { findGfxSetup, TableConfigGfxSetup, TV2ShowstyleBlueprintConfigBase } from 'tv2-common'
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
	selectedGfxSetup: TableConfigGfxSetup
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
	GfxSetups: TableConfigGfxSetup[]
}

export function parseConfig(context: ICommonContext, rawConfig: IBlueprintConfig): any {
	const showstyleConfig = (rawConfig as unknown) as OfftubeShowStyleConfig
	const selectedGfxSetup = findGfxSetup(context, showstyleConfig, {
		Name: '',
		HtmlPackageFolder: ''
	})
	return {
		showStyle: showstyleConfig,
		selectedGfxSetup
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
