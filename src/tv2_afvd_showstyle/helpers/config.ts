import { IBlueprintConfig, ICommonContext, IShowStyleContext, TableConfigItemValue } from 'blueprints-integration'
import {
	TableConfigGraphicsSetup,
	TableConfigItemOverlayShowMapping,
	TV2ShowstyleBlueprintConfigBase
} from 'tv2-common'
import { BlueprintConfig as BlueprintConfigBase } from '../../tv2_afvd_studio/helpers/config'

export interface BlueprintConfig extends BlueprintConfigBase {
	showStyle: ShowStyleConfig
	selectedGraphicsSetup: TableConfigGraphicsSetup
}

export interface ShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	WipesConfig: TableConfigItemValue
	SelectedGraphicsSetupName: string
	GraphicsSetups: TableConfigGraphicsSetup[]
	OverlayShowMapping: TableConfigItemOverlayShowMapping[]
}

function findGraphicsSetup(context: ICommonContext, config: ShowStyleConfig): TableConfigGraphicsSetup {
	const foundTableConfigGraphicsSetup: TableConfigGraphicsSetup | undefined = config.GraphicsSetups.find(
		tableConfigGraphicsSetup => tableConfigGraphicsSetup.Name === config.SelectedGraphicsSetupName
	)
	if (!foundTableConfigGraphicsSetup) {
		context.logWarning(`No graphics setup found for profile: ${config.SelectedGraphicsSetupName}`)
		return {
			Name: '',
			VcpConcept: '',
			OvlShowId: '',
			FullShowId: '',
			DveLayoutFolder: ''
		}
	}
	return foundTableConfigGraphicsSetup
}

export function parseConfig(context: ICommonContext, rawConfig: IBlueprintConfig): any {
	const showstyleConfig = (rawConfig as unknown) as ShowStyleConfig
	const selectedGraphicsSetup = findGraphicsSetup(context, showstyleConfig)
	return {
		showStyle: showstyleConfig,
		selectedGraphicsSetup
	}
}

export function getConfig(context: IShowStyleContext): BlueprintConfig {
	return ({ ...(context.getStudioConfig() as any), ...(context.getShowStyleConfig() as any) } as any) as BlueprintConfig
}
