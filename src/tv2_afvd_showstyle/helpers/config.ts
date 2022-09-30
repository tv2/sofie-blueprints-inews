import {
	IBlueprintConfig,
	ICommonContext,
	IShowStyleContext,
	TableConfigItemValue
} from '@tv2media/blueprints-integration'
import { TableConfigGraphicsSetup, TV2ShowstyleBlueprintConfigBase } from 'tv2-common'
import { BlueprintConfig as BlueprintConfigBase } from '../../tv2_afvd_studio/helpers/config'

export interface GalleryTableConfigGraphicsSetup extends TableConfigGraphicsSetup {
	VcpConcept: string
	FullShowName: string
}

export interface BlueprintConfig extends BlueprintConfigBase {
	showStyle: ShowStyleConfig
	selectedGraphicsSetup: GalleryTableConfigGraphicsSetup
}

export interface ShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	WipesConfig: TableConfigItemValue
	GraphicsSetups: GalleryTableConfigGraphicsSetup[]
}

function findGraphicsSetup(context: ICommonContext, config: ShowStyleConfig): GalleryTableConfigGraphicsSetup {
	const foundTableConfigGraphicsSetup: GalleryTableConfigGraphicsSetup | undefined = config.GraphicsSetups.find(
		tableConfigGraphicsSetup => tableConfigGraphicsSetup.Name === config.SelectedGraphicsSetupName
	)
	if (!foundTableConfigGraphicsSetup) {
		context.logWarning(`No graphics setup found for profile: ${config.SelectedGraphicsSetupName}`)
		return {
			Name: '',
			VcpConcept: '',
			OvlShowName: '',
			FullShowName: ''
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
