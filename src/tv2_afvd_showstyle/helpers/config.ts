import {
	IBlueprintConfig,
	IBlueprintShowStyleVariant,
	ICommonContext,
	TableConfigItemValue
} from 'blueprints-integration'
import {
	findGfxSetup,
	TableConfigGfxSetup,
	TableConfigItemGfxDefaults,
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
	variants: IBlueprintShowStyleVariant[]
}

export interface GalleryShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	WipesConfig: TableConfigItemValue
	GfxSetups: GalleryTableConfigGfxSetup[]
	GfxShowMapping: TableConfigItemGfxShowMapping[]
	GfxDefaults: TableConfigItemGfxDefaults[]
}

export function preprocessConfig(
	context: ICommonContext,
	rawConfig: IBlueprintConfig,
	test: Array<IBlueprintShowStyleVariant>
): any {
	const showstyleConfig = rawConfig as unknown as GalleryShowStyleConfig
	context.logInfo('dddddddd' + JSON.stringify(test))
	const selectedGfxSetup = findGfxSetup(context, showstyleConfig, {
		_id: '',
		Name: '',
		VcpConcept: '',
		OvlShowName: '',
		FullShowName: '',
		HtmlPackageFolder: ''
	})
	return {
		showStyle: showstyleConfig,
		selectedGfxSetup,
		variants: test
	}
}
