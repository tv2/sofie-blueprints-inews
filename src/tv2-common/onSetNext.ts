import { ISetNextContext } from 'blueprints-integration'
import { SharedSourceLayer } from 'tv2-constants'
import { TV2ShowStyleConfig } from './blueprintConfig'
import { ShowStyleContextSimple, ShowStyleContextSimpleImpl } from './showstyle/ShowStyleContextSimple'

export function onSetNext(context: ISetNextContext) {
	const wrapedContext = new ShowStyleContextSimpleImpl(context)
	validateSchemaAndDesign(wrapedContext)
}

function validateSchemaAndDesign(context: ShowStyleContextSimple<TV2ShowStyleConfig, ISetNextContext>) {
	const resolvedPieceInstances = context.core.getResolvedPieceInstances()
	const variantPieceInstances = resolvedPieceInstances.filter(
		(pieceInstance) => pieceInstance.piece.sourceLayerId === SharedSourceLayer.PgmVariant
	)
	const schemaPieceInstances = resolvedPieceInstances.filter(
		(pieceInstance) => pieceInstance.piece.sourceLayerId === SharedSourceLayer.PgmSchema
	)
	const designPieceInstances = resolvedPieceInstances.filter(
		(pieceInstance) => pieceInstance.piece.sourceLayerId === SharedSourceLayer.PgmDesign
	)

	for (const variantPieceInstance of variantPieceInstances) {
		const variant = context.config.variants.find((v) => v.name === variantPieceInstance.piece.name)
		if (!variant) {
			return
		}
		const setupId = variant.blueprintConfig.GfxDefaults && variant.blueprintConfig.GfxDefaults[0].DefaultSetupName.value
		if (!setupId) {
			return
		}
		const setups = context.config.showStyle.GfxShowMapping.filter((mapping) =>
			mapping.GfxSetup.find((x) => x.value === setupId)
		)

		const variantResolvedEnd = variantPieceInstance.resolvedStart + (variantPieceInstance.resolvedDuration ?? Infinity)
		const schemasInCurrentVariant = spliceUntil(
			schemaPieceInstances,
			(pieceInstance) => pieceInstance.resolvedStart >= variantResolvedEnd
		)
		const designsInCurrentVariant = spliceUntil(
			designPieceInstances,
			(pieceInstance) => pieceInstance.resolvedStart >= variantResolvedEnd
		)
		for (const schema of schemasInCurrentVariant) {
			const matchingSetup = setups.find((setup) => setup.Schema.find((x) => x.label === schema.piece.name))
			if (!matchingSetup) {
				context.core.disablePieceInstance(schema._id)
				context.core.notifyUserWarning(`Schema "${schema.piece.name}" is incompatible with Variant "${variant.name}"`)
			}
		}
		for (const design of designsInCurrentVariant) {
			const matchingSetup = setups.find((setup) => setup.Design.label === design.piece.name)
			if (!matchingSetup) {
				context.core.disablePieceInstance(design._id)
				context.core.notifyUserWarning(`Design "${design.piece.name}" is incompatible with Variant "${variant.name}"`)
			}
		}
	}
}

function spliceUntil<T>(array: T[], predicate: (element: T) => boolean) {
	const index = array.findIndex(predicate)
	return array.splice(0, index === -1 ? array.length : index + 1)
}
