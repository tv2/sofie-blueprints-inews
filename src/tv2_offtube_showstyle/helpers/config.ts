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
	GraphicsSetups: TableConfigGraphicsSetup[]
}

function findGraphicsSetup(context: ICommonContext, config: OfftubeShowStyleConfig): TableConfigGraphicsSetup {
	const foundTableConfigGraphicsSetup: TableConfigGraphicsSetup | undefined = config.GraphicsSetups.find(
		tableConfigGraphicsSetup => tableConfigGraphicsSetup.Name === config.SelectedGraphicsSetupName
	)
	if (!foundTableConfigGraphicsSetup) {
		context.logWarning(`No graphics setup found for profile: ${config.SelectedGraphicsSetupName}`)
		return {
			Name: '',
			OvlShowName: ''
		}
	}
	return foundTableConfigGraphicsSetup
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
