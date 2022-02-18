import {
	IBlueprintConfig,
	ICommonContext,
	IShowStyleContext,
	TableConfigItemValue
} from '@tv2media/blueprints-integration'
import { TV2ShowstyleBlueprintConfigBase } from 'tv2-common'
import { BlueprintConfig as BlueprintConfigBase } from '../../tv2_afvd_studio/helpers/config'

export interface BlueprintConfig extends BlueprintConfigBase {
	showStyle: ShowStyleConfig
}

export interface ShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	WipesConfig: TableConfigItemValue
	GraphicINewsCode: string
	GraphicSetups: TableConfigGraphicSetup[]
}

export function parseConfig(_context: ICommonContext, config: IBlueprintConfig): any {
	return { showStyle: config }
}

export function getConfig(context: IShowStyleContext): BlueprintConfig {
	return ({ ...(context.getStudioConfig() as any), ...(context.getShowStyleConfig() as any) } as any) as BlueprintConfig
}

export interface TableConfigGraphicSetup {
	INewsCode: string
	Concept: string
}
