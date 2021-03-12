import { IBlueprintConfig, ShowStyleContext, TableConfigItemValue } from '@sofie-automation/blueprints-integration'
import { TV2ShowstyleBlueprintConfigBase } from 'tv2-common'
import * as _ from 'underscore'
import { BlueprintConfig as BlueprintConfigBase } from '../../tv2_afvd_studio/helpers/config'

export interface BlueprintConfig extends BlueprintConfigBase {
	showStyle: ShowStyleConfig
}

export interface ShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	WipesConfig: TableConfigItemValue
}

/*
export function defaultConfig(context: NotesContext): BlueprintConfig {
	return extendWithShowStyleConfig(context, defaultStudioConfig(context), {})
}
*/

export function parseConfig(config: IBlueprintConfig): any {
	return { showStyle: config }
}

export function getConfig(context: ShowStyleContext): BlueprintConfig {
	return ({ ...(context.getStudioConfig() as any), ...(context.getShowStyleConfig() as any) } as any) as BlueprintConfig
}
