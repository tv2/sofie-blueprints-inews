import { IBlueprintConfig, ICommonContext, TableConfigItemValue } from 'blueprints-integration'
import {
	findGraphicsSetup,
	TableConfigGraphicsSetup,
	TableConfigItemOverlayShowMapping,
	TV2ShowstyleBlueprintConfigBase
} from 'tv2-common'
import { GalleryStudioConfig } from '../../tv2_afvd_studio/helpers/config'

export { preprocessConfig as parseConfig }
export type BlueprintConfig = GalleryBlueprintConfig
export type ShowStyleConfig = GalleryShowStyleConfig

export function getConfig(context: import('blueprints-integration').IShowStyleContext): GalleryBlueprintConfig {
	return {
		...(context.getStudioConfig() as GalleryStudioConfig),
		...(context.getShowStyleConfig() as Pick<GalleryBlueprintConfig, 'showStyle' | 'selectedGraphicsSetup'>)
	}
}

export interface GalleryTableConfigGraphicsSetup extends TableConfigGraphicsSetup {
	VcpConcept: string
	FullShowName: string
	OvlShowName: string
}

export interface GalleryBlueprintConfig extends GalleryStudioConfig {
	showStyle: GalleryShowStyleConfig
	selectedGraphicsSetup: GalleryTableConfigGraphicsSetup
}

export interface GalleryShowStyleConfig extends TV2ShowstyleBlueprintConfigBase {
	WipesConfig: TableConfigItemValue
	GraphicsSetups: GalleryTableConfigGraphicsSetup[]
	OverlayShowMapping: TableConfigItemOverlayShowMapping[]
}

export function preprocessConfig(context: ICommonContext, rawConfig: IBlueprintConfig): any {
	const showstyleConfig = (rawConfig as unknown) as GalleryShowStyleConfig
	const selectedGraphicsSetup = findGraphicsSetup(context, showstyleConfig, {
		Name: '',
		VcpConcept: '',
		OvlShowName: '',
		FullShowName: '',
		HtmlPackageFolder: ''
	})
	return {
		showStyle: showstyleConfig,
		selectedGraphicsSetup
	}
}
