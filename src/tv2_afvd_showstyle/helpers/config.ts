import {
	IBlueprintConfig,
	ICommonContext,
	IShowStyleContext,
	TableConfigItemValue
} from '@tv2media/blueprints-integration'
import { TableConfigGraphicSetup, TV2ShowstyleBlueprintConfigBase } from 'tv2-common'
import { BlueprintConfig as BlueprintConfigBase } from '../../tv2_afvd_studio/helpers/config'

export interface BlueprintConfig extends BlueprintConfigBase {
	showStyle: ShowStyleConfig
	selectedGraphicsSetup: TableConfigGraphicSetup
}

export interface ShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	WipesConfig: TableConfigItemValue
	GraphicINewsCode: string
	GraphicSetups: TableConfigGraphicSetup[]
}

export function findGraphicSetup(context: ICommonContext, config: ShowStyleConfig): TableConfigGraphicSetup {
	const foundTableConfigGraphicSetup: TableConfigGraphicSetup | undefined = config.GraphicSetups.find(
		tableConfigGraphicSetup => tableConfigGraphicSetup.INewsCode === config.GraphicINewsCode
	)
	if (!foundTableConfigGraphicSetup) {
		context.logWarning(`No graphics setup found for profile ${config.GraphicINewsCode})`)
		return {
			INewsCode: '',
			Concept: '',
			OvlShowId: '',
			FullShowId: ''
		}
	}
	return foundTableConfigGraphicSetup
}

export function parseConfig(context: ICommonContext, rawConfig: IBlueprintConfig): any {
	const showstyleConfig = (rawConfig as unknown) as ShowStyleConfig
	const selectedGraphicsSetup = findGraphicSetup(context, showstyleConfig)
	return {
		showStyle: showstyleConfig,
		selectedGraphicsSetup
	}
}

export function getConfig(context: IShowStyleContext): BlueprintConfig {
	return ({ ...(context.getStudioConfig() as any), ...(context.getShowStyleConfig() as any) } as any) as BlueprintConfig
}
