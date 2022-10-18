import {
	ConfigItemValue,
	IBlueprintShowStyleVariant,
	IBlueprintTriggeredActions,
	IOutputLayer,
	ISourceLayer,
	MigrationContextShowStyle,
	OmitId,
	ShowStyleVariantPart
} from 'blueprints-integration'

export class MockShowstyleMigrationContext implements MigrationContextShowStyle {
	public variants: IBlueprintShowStyleVariant[] = []
	public configs: Map<string, ConfigItemValue> = new Map()

	public getAllVariants(): IBlueprintShowStyleVariant[] {
		return this.variants
	}
	public getVariantId(variantId: string): string {
		return variantId
	}
	public getVariant(variantId: string): IBlueprintShowStyleVariant | undefined {
		return this.variants.find(variant => variant._id === variantId)
	}
	public insertVariant(variantId: string, variant: OmitId<ShowStyleVariantPart>): string {
		throw new Error(`Function not implemented in mock: 'insertVariant' args: '${variantId}, ${JSON.stringify(variant)}`)
	}
	public updateVariant(variantId: string, variant: Partial<ShowStyleVariantPart>) {
		throw new Error(`Function not implemented in mock: 'updateVariant' args: '${variantId}, ${JSON.stringify(variant)}`)
	}
	public removeVariant(variantId: string): void {
		throw new Error(`Function not implemented in mock: 'removeVariant' args: '${variantId}`)
	}
	public getSourceLayer(sourceLayerId: string): ISourceLayer | undefined {
		throw new Error(`Function not implemented in mock: 'getSourceLayer' args: '${sourceLayerId}`)
	}
	public insertSourceLayer(sourceLayerId: string, layer: OmitId<ISourceLayer>): string {
		throw new Error(
			`Function not implemented in mock: 'insertSourceLayer' args: '${sourceLayerId}, ${JSON.stringify(layer)}`
		)
	}
	public updateSourceLayer(sourceLayerId: string, layer: Partial<ISourceLayer>): void {
		throw new Error(
			`Function not implemented in mock: 'updateSourceLayer' args: '${sourceLayerId}, ${JSON.stringify(layer)}`
		)
	}
	public removeSourceLayer(sourceLayerId: string): void {
		throw new Error(`Function not implemented in mock: 'removeSourceLayer' args: '${sourceLayerId}`)
	}
	public getOutputLayer(outputLayerId: string): IOutputLayer | undefined {
		throw new Error(`Function not implemented in mock: 'getOutputLayer' args: '${outputLayerId}`)
	}
	public insertOutputLayer(outputLayerId: string, layer: OmitId<IOutputLayer>): string {
		throw new Error(
			`Function not implemented in mock: 'insertOutputLayer' args: '${outputLayerId}, ${JSON.stringify(layer)}`
		)
	}
	public updateOutputLayer(outputLayerId: string, layer: Partial<IOutputLayer>): void {
		throw new Error(
			`Function not implemented in mock: 'updateOutputLayer' args: '${outputLayerId}, ${JSON.stringify(layer)}`
		)
	}
	public removeOutputLayer(outputLayerId: string): void {
		throw new Error(`Function not implemented in mock: 'removeOutputLayer' args: '${outputLayerId}`)
	}
	public getBaseConfig(configId: string): ConfigItemValue | undefined {
		return this.configs.get(configId)
	}
	public setBaseConfig(configId: string, value: ConfigItemValue): void {
		this.configs.set(configId, value)
	}
	public removeBaseConfig(configId: string): void {
		this.configs.delete(configId)
	}
	public getVariantConfig(variantId: string, configId: string): ConfigItemValue | undefined {
		throw new Error(`Function not implemented in mock: 'getVariantConfig' args: ${variantId}, '${configId}`)
	}
	public setVariantConfig(variantId: string, configId: string, value: ConfigItemValue): void {
		throw new Error(
			`Function not implemented in mock: 'setVariantConfig' args: ${variantId}, '${configId}, ${JSON.stringify(value)}`
		)
	}
	public removeVariantConfig(variantId: string, configId: string): void {
		throw new Error(`Function not implemented in mock: 'removeVariantConfig' args: ${variantId}, '${configId}}`)
	}

	public getAllTriggeredActions(): IBlueprintTriggeredActions[] {
		throw new Error(`Function not implemented in mock: 'getAllTriggeredActions'`)
	}
	public getTriggeredAction(triggeredActionsId: string): IBlueprintTriggeredActions | undefined {
		throw new Error(`Function not implemented in mock: 'getTriggeredAction' args: ${triggeredActionsId}`)
	}
	public setTriggeredAction(triggeredActions: IBlueprintTriggeredActions): void {
		throw new Error(`Function not implemented in mock: 'setTriggeredAction' args: ${triggeredActions}`)
	}
	public removeTriggeredAction(triggeredActionsId: string): void {
		throw new Error(`Function not implemented in mock: 'removeTriggeredAction' args: ${triggeredActionsId}`)
	}
	public getTriggeredActionId(triggeredActionId: string): string {
		throw new Error(`Function not implemented in mock: 'getTriggeredActionId' args: ${triggeredActionId}`)
	}
}
