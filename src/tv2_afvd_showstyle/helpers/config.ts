import { IBlueprintConfig, ICommonContext, TableConfigItemValue } from 'blueprints-integration'
import {
	findGfxSetup,
	TableConfigGfxSetup,
	TableConfigItemGfxShowMapping,
	TV2ShowstyleBlueprintConfigBase
} from 'tv2-common'
import { GalleryStudioConfig } from '../../tv2_afvd_studio/helpers/config'

export interface GalleryTableConfigGfxSetup extends TableConfigGfxSetup {
	VcpConcept: string
	FullShowName: string
	OvlShowName: string
}

export interface GalleryBlueprintConfig extends GalleryStudioConfig {
	showStyle: GalleryShowStyleConfig
	selectedGfxSetup: GalleryTableConfigGfxSetup
}

export interface GalleryShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	WipesConfig: TableConfigItemValue
	SelectedGfxSetupName: string
	GfxSetups: GalleryTableConfigGfxSetup[]
	GfxShowMapping: TableConfigItemGfxShowMapping[]
}

export function preprocessConfig(context: ICommonContext, rawConfig: IBlueprintConfig): any {
	const showstyleConfig = (rawConfig as unknown) as GalleryShowStyleConfig
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
