import { calculateTime, findVariant, PartDefinition, SegmentContext, ShowStyleContext } from 'tv2-common'
import { CueType } from 'tv2-constants'
import _ = require('underscore')
import { TableConfigItemGfxDefaults, TV2ShowStyleConfig } from '../blueprintConfig'
import {
	CueDefinition,
	CueDefinitionGfxSchema,
	CueDefinitionGraphicDesign,
	CueDefinitionVariant
} from '../inewsConversion'

type GetDefaultGfxCue = (
	context: ShowStyleContext<TV2ShowStyleConfig>,
	gfxDefaults: TableConfigItemGfxDefaults,
	variantCue: CueDefinitionVariant
) => CueDefinition | undefined

export function handleSchemaAndDesignCues(
	context: ShowStyleContext<TV2ShowStyleConfig>,
	parsedParts: PartDefinition[]
): PartDefinition[] {
	return handleVariantDependentCues(
		context,
		handleVariantDependentCues(context, parsedParts, CueType.GraphicDesign, getDefaultDesignCue),
		CueType.GraphicSchema,
		getDefaultSchemaCue
	)
}

function handleVariantDependentCues(
	context: ShowStyleContext<TV2ShowStyleConfig>,
	parsedParts: PartDefinition[],
	cueType: CueType.GraphicDesign | CueType.GraphicSchema,
	getDefaultCue: GetDefaultGfxCue
): PartDefinition[] {
	let cueFromField: CueDefinition | undefined
	for (const partDefinition of parsedParts) {
		cueFromField =
			cueFromField ??
			partDefinition.cues.find((cueDefinition) => cueDefinition.type === cueType && cueDefinition.isFromField)
		if (cueFromField) {
			partDefinition.cues = partDefinition.cues.filter(
				(cueDefinition) => cueDefinition.type !== cueType || cueDefinition.isFromField
			)
		} else {
			insertDefaultCues(partDefinition, cueType, context, getDefaultCue)
		}
	}
	return parsedParts
}

function insertDefaultCues(
	partDefinition: PartDefinition,
	cueType: CueType,
	context: ShowStyleContext<TV2ShowStyleConfig>,
	getDefaultCue: GetDefaultGfxCue
) {
	const variantCuesByTime = _.groupBy(
		partDefinition.cues.filter((cueDefinition) => cueDefinition.type === CueType.Variant),
		calculateStartTimeWithFallback
	) as _.Dictionary<CueDefinitionVariant[]>
	const matchingCuesByTime = _.groupBy(
		partDefinition.cues.filter((cueDefinition) => cueDefinition.type === cueType),
		calculateStartTimeWithFallback
	)
	for (const [time, variantCues] of Object.entries(variantCuesByTime)) {
		if (matchingCuesByTime[time]) {
			continue
		}
		const variantCue = variantCues[variantCues.length - 1]
		const blueprintVariant = findVariant(context.config.variants, variantCue.name)
		const gfxDefaults = (blueprintVariant?.blueprintConfig.GfxDefaults ?? context.config.showStyle.GfxDefaults)[0]
		const defaultCue = getDefaultCue(context, gfxDefaults, variantCue)
		if (defaultCue) {
			partDefinition.cues.push(defaultCue)
		}
	}
}

function calculateStartTimeWithFallback(cueDefinition: CueDefinition) {
	return (cueDefinition.start && calculateTime(cueDefinition.start)) ?? 0
}

function getDefaultDesignCue(
	context: SegmentContext<TV2ShowStyleConfig>,
	gfxDefaults: TableConfigItemGfxDefaults,
	variantCue: CueDefinitionVariant
): CueDefinitionGraphicDesign | undefined {
	const defaultDesign = context.config.showStyle.GfxDesignTemplates.find(
		(designTemplate) => designTemplate._id === gfxDefaults.DefaultDesign.value
	)
	if (!defaultDesign) {
		context.core.notifyUserError(`Unable to find default Gfx Design for Variant "${variantCue.name}"`)
		return undefined
	}
	return {
		type: CueType.GraphicDesign,
		iNewsCommand: '',
		design: defaultDesign.VizTemplate,
		start: variantCue.start
	}
}

function getDefaultSchemaCue(
	context: SegmentContext<TV2ShowStyleConfig>,
	gfxDefaults: TableConfigItemGfxDefaults,
	variantCue: CueDefinitionVariant
): CueDefinitionGfxSchema | undefined {
	const defaultSchema = context.config.showStyle.GfxSchemaTemplates.find(
		(designTemplate) => designTemplate._id === gfxDefaults.DefaultSchema.value
	)
	if (!defaultSchema) {
		context.core.notifyUserError(`Unable to find default Gfx Schema for Variant "${variantCue.name}"`)
		return undefined
	}
	return {
		type: CueType.GraphicSchema,
		iNewsCommand: '',
		schema: defaultSchema.VizTemplate,
		start: variantCue.start,
		CasparCgDesignValues: defaultSchema.CasparCgDesignValues ? JSON.parse(defaultSchema.CasparCgDesignValues) : []
	}
}
