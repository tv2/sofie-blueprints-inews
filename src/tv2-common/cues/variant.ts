import { PieceLifespan, TSR } from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionVariant,
	EvaluateCueResult,
	EvaluateDesignBase,
	GFX_SETUP_CLASS_PREFIX,
	literal,
	ShowStyleContext,
	TableConfigItemGfxDefaults,
	TV2ShowStyleVariant
} from 'tv2-common'
import { AbstractLLayer, CueType, SharedOutputLayer, SharedSourceLayer } from 'tv2-constants'
import { GfxSchemaGeneratorFacade } from './gfx-schema-generator-facade'

export function EvaluateCueVariant(context: ShowStyleContext, partId: string, variantCue: CueDefinitionVariant) {
	const result = new EvaluateCueResult()
	const start = (variantCue.start ? calculateTime(variantCue.start) : 0) ?? 0
	const blueprintVariant = findVariant(context.config.variants, variantCue.name)

	if (!blueprintVariant) {
		context.core.notifyUserError(`Unable to find variant "${variantCue.name}"`)
		return result
	}

	const gfxDefaults = (blueprintVariant.blueprintConfig.GfxDefaults ?? context.config.showStyle.GfxDefaults)[0]

	result.pieces.push({
		name: variantCue.name,
		lifespan: PieceLifespan.OutOnRundownChange,
		externalId: partId,
		enable: {
			start
		},
		outputLayerId: SharedOutputLayer.SEC,
		sourceLayerId: SharedSourceLayer.PgmVariant,
		tags: [getVariantTag(blueprintVariant._id)],
		content: {
			timelineObjects: [
				// @todo: this probably needs objects for SOF-1498, and maybe some classes
				literal<TSR.TimelineObjAbstractAny>({
					id: '',
					enable: {
						start: 0
					},
					priority: 0,
					layer: AbstractLLayer.GFX_SETUP,
					content: {
						deviceType: TSR.DeviceType.ABSTRACT
					},
					classes: [`${GFX_SETUP_CLASS_PREFIX}${gfxDefaults.DefaultSetupName.value}`]
				})
			]
		}
	})

	// those default pieces might be immediately superseded by pieces created from cues/fields
	insertDefaultDesign(context, gfxDefaults, variantCue, result, partId)
	insertDefaultSchema(context, gfxDefaults, variantCue, result, partId)

	return result
}

function insertDefaultSchema(
	context: ShowStyleContext,
	gfxDefaults: TableConfigItemGfxDefaults,
	variantCue: CueDefinitionVariant,
	result: EvaluateCueResult,
	partId: string
) {
	const defaultSchema = context.config.showStyle.GfxSchemaTemplates.find(
		(designTemplate) => designTemplate._id === gfxDefaults.DefaultSchema.value
	)

	if (!defaultSchema) {
		context.core.notifyUserError(`Unable to find default Gfx Schema for Variant "${variantCue.name}"`)
	} else {
		result.push(
			GfxSchemaGeneratorFacade.create().createBlueprintPieceFromGfxSchemaCue(context, partId, {
				type: CueType.GraphicSchema,
				schema: defaultSchema.VizTemplate,
				iNewsCommand: '',
				start: variantCue.start,
				CasparCgDesignValues: defaultSchema.CasparCgDesignValues ? JSON.parse(defaultSchema.CasparCgDesignValues) : []
			})
		)
	}
}

function insertDefaultDesign(
	context: ShowStyleContext,
	gfxDefaults: TableConfigItemGfxDefaults,
	variantCue: CueDefinitionVariant,
	result: EvaluateCueResult,
	partId: string
) {
	const defaultDesign = context.config.showStyle.GfxDesignTemplates.find(
		(designTemplate) => designTemplate._id === gfxDefaults.DefaultDesign.value
	)

	if (!defaultDesign) {
		context.core.notifyUserError(`Unable to find default Gfx Design for Variant "${variantCue.name}"`)
	} else {
		result.push(
			EvaluateDesignBase(context, partId, {
				type: CueType.GraphicDesign,
				design: defaultDesign.VizTemplate,
				iNewsCommand: '',
				start: variantCue.start
			})
		)
	}
}

export function getVariantTag(variantId: string) {
	return `VARIANT_${variantId}`
}

export function findVariant(variants: TV2ShowStyleVariant[], variantName: string) {
	return variants.find((variant) => variant.name.toLocaleUpperCase() === variantName)
}
