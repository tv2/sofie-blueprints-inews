import { ICommonContext } from 'blueprints-integration'
import { TableConfigGfxSetup, TV2ShowstyleBlueprintConfigBase } from 'tv2-common'

export interface DVEConfigInput {
	// _id: string
	DVEName: string
	DVEJSON: string
	DVEGraphicsTemplateJSON: string
	DVEInputs: string
	DVEGraphicsKey: string
	DVEGraphicsFrame: string
	// [key: string]: BasicConfigItemValue
}

export function findGfxSetup<ShowStyleConfig extends TV2ShowstyleBlueprintConfigBase>(
	context: ICommonContext,
	config: ShowStyleConfig,
	fallbackGfxSetup: ShowStyleConfig['GfxSetups'][0]
): ShowStyleConfig['GfxSetups'][0] {
	const foundTableConfigGfxSetup: TableConfigGfxSetup | undefined = config.GfxSetups.find(
		tableConfigGfxSetup => tableConfigGfxSetup.Name === config.SelectedGfxSetupName
	)
	if (!foundTableConfigGfxSetup) {
		context.logWarning(`No GFX setup found for profile: ${config.SelectedGfxSetupName}`)
		return fallbackGfxSetup
	}
	return foundTableConfigGfxSetup
}
