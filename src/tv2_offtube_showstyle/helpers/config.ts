import {
	IBlueprintConfig,
	ICommonContext,
	IShowStyleContext,
	IStudioContext,
	TableConfigItemValue
} from '@tv2media/blueprints-integration'
import { TableConfigGraphicsSetup, TV2ShowstyleBlueprintConfigBase } from 'tv2-common'
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
}

function findGraphicsSetup(
	_context: ICommonContext,
	_config: TV2ShowstyleBlueprintConfigBase
): TableConfigGraphicsSetup {
	// just for type compatibility, not really supported in offtube
	return {
		Name: '',
		VcpConcept: '',
		OvlShowId: '',
		FullShowId: '',
		DveLayoutFolder: ''
	}
}

export function parseConfig(context: ICommonContext, rawConfig: IBlueprintConfig): any {
	const showstyleConfig = (rawConfig as unknown) as OfftubeShowStyleConfig
	const selectedGraphicsSetup = findGraphicsSetup(context, showstyleConfig)
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
