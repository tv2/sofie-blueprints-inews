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
	const defaultSetupName = config.GfxDefaults[0].DefaultSetupName
	const foundTableConfigGfxSetup: TableConfigGfxSetup | undefined = config.GfxSetups.find(
		(tableConfigGfxSetup) => tableConfigGfxSetup._id === defaultSetupName?.value
	)
	if (!foundTableConfigGfxSetup) {
		context.logWarning(`No GFX setup found for profile: ${JSON.stringify(defaultSetupName)}`)
		return fallbackGfxSetup
	}
	return foundTableConfigGfxSetup
}
