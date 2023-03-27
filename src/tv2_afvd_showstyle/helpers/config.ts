import { IBlueprintConfig, ICommonContext, IShowStyleContext, TableConfigItemValue } from 'blueprints-integration'
import {
	findGfxSetup,
	TableConfigGfxSetup,
	TableConfigItemGfxDefaults,
	TableConfigItemGfxShowMapping,
	TV2ShowstyleBlueprintConfigBase
} from 'tv2-common'
import { BlueprintConfig as BlueprintConfigBase } from '../../tv2_afvd_studio/helpers/config'

export interface GalleryTableConfigGfxSetup extends TableConfigGfxSetup {
	VcpConcept: string
	FullShowName: string
	OvlShowName: string
}

export interface BlueprintConfig extends BlueprintConfigBase {
	showStyle: ShowStyleConfig
	selectedGfxSetup: GalleryTableConfigGfxSetup
}

export interface ShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	WipesConfig: TableConfigItemValue
	GfxSetups: GalleryTableConfigGfxSetup[]
	GfxShowMapping: TableConfigItemGfxShowMapping[]
	GfxDefaults: TableConfigItemGfxDefaults[]
}

export function parseConfig(context: ICommonContext, rawConfig: IBlueprintConfig): any {
	const showstyleConfig = (rawConfig as unknown) as ShowStyleConfig
	const selectedGfxSetup = findGfxSetup(context, showstyleConfig, {
		Name: '',
		VcpConcept: '',
		OvlShowName: '',
		FullShowName: '',
		HtmlPackageFolder: ''
	})
	return {
		showStyle: showstyleConfig,
		selectedGfxSetup
	}
}

export function getConfig(context: IShowStyleContext): BlueprintConfig {
	return ({ ...(context.getStudioConfig() as any), ...(context.getShowStyleConfig() as any) } as any) as BlueprintConfig
}
