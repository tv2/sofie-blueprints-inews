import { ICommonContext } from 'blueprints-integration'
import { TableConfigGraphicsSetup, TV2ShowstyleBlueprintConfigBase } from 'tv2-common'

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

export function findGraphicsSetup<ShowStyleConfig extends TV2ShowstyleBlueprintConfigBase>(
	context: ICommonContext,
	config: ShowStyleConfig,
	fallbackGraphicsSetup: ShowStyleConfig['GraphicsSetups'][0]
): ShowStyleConfig['GraphicsSetups'][0] {
	const foundTableConfigGraphicsSetup: TableConfigGraphicsSetup | undefined = config.GraphicsSetups.find(
		tableConfigGraphicsSetup => tableConfigGraphicsSetup.Name === config.SelectedGraphicsSetupName
	)
	if (!foundTableConfigGraphicsSetup) {
		context.logWarning(`No graphics setup found for profile: ${config.SelectedGraphicsSetupName}`)
		return fallbackGraphicsSetup
	}
	return foundTableConfigGraphicsSetup
}
