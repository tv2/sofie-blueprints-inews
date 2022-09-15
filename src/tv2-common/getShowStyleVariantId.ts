import { IBlueprintShowStyleVariant, IngestRundown, IStudioUserContext } from '@tv2media/blueprints-integration'

const DEFAULT_VARIANT_NAME = 'default'

export function getShowStyleVariantId(
	_context: IStudioUserContext,
	showStyleVariants: IBlueprintShowStyleVariant[],
	ingestRundown: IngestRundown
): string | null {
	const ingestVariantName = ingestRundown.payload?.showstyleVariant?.trim().toLowerCase()
	const showStyleVariant =
		showStyleVariants.find(variant => variant.name?.trim().toLowerCase() === ingestVariantName) ??
		showStyleVariants.find(variant => variant.name?.trim().toLowerCase() === DEFAULT_VARIANT_NAME)

	return showStyleVariant?._id ?? null
}
