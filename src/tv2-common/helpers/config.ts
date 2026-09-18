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
	const selectedGraphicsSetup = config.SelectedGraphicsSetupName
	const selectedValue = typeof selectedGraphicsSetup === 'string' ? selectedGraphicsSetup : selectedGraphicsSetup.value
	const selectedLabel = typeof selectedGraphicsSetup === 'string' ? selectedGraphicsSetup : selectedGraphicsSetup.label
	const foundTableConfigGraphicsSetup: TableConfigGraphicsSetup | undefined =
		typeof selectedGraphicsSetup === 'string'
			? config.GraphicsSetups.find(tableConfigGraphicsSetup => tableConfigGraphicsSetup.Name === selectedValue)
			: config.GraphicsSetups.find(tableConfigGraphicsSetup => tableConfigGraphicsSetup._id === selectedValue) ||
			  config.GraphicsSetups.find(tableConfigGraphicsSetup => tableConfigGraphicsSetup.Name === selectedLabel)
	if (!foundTableConfigGraphicsSetup) {
		context.logWarning(`No graphics setup found for profile: ${selectedLabel || selectedValue}`)
		return fallbackGraphicsSetup
	}
	return foundTableConfigGraphicsSetup
}
