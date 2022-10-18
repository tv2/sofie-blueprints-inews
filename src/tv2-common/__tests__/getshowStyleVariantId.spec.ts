import { IBlueprintShowStyleVariant, IngestRundown, IStudioUserContext } from 'blueprints-integration'
import { makeMockAFVDContext } from '../../__mocks__/context'
import { getShowStyleVariantId } from '../getShowStyleVariantId'

describe('getShowStyleVariantId', () => {
	it('returns the id of the ingestedShowStyleVariant', () => {
		const variantName = 'randomVariantName'
		const ingestRundown: IngestRundown = getIngestRundown(variantName)

		const result = getShowStyleVariantId(getMockContext(), getShowStyleVariants([variantName]), ingestRundown)

		expect(result).toBe(variantName)
	})

	function getIngestRundown(showStyleVariant?: string): IngestRundown {
		return {
			externalId: '',
			name: '',
			type: '',
			segments: [],
			payload: {
				showstyleVariant: showStyleVariant ?? ''
			}
		}
	}

	function getMockContext(): IStudioUserContext {
		return makeMockAFVDContext()
	}

	function getShowStyleVariants(variantNames?: string[]): IBlueprintShowStyleVariant[] {
		const variants: IBlueprintShowStyleVariant[] = [
			{
				_id: 'default',
				name: 'default',
				blueprintConfig: {}
			}
		]
		if (variantNames) {
			variants.push(
				...variantNames.map(variantName => {
					return {
						_id: variantName,
						name: variantName,
						blueprintConfig: {}
					}
				})
			)
		}

		return variants
	}

	it('does not have variant, returns default', () => {
		const variantName = 'randomVariantName'
		const ingestRundown: IngestRundown = getIngestRundown('nonExistentVariantName')

		const result = getShowStyleVariantId(getMockContext(), getShowStyleVariants([variantName]), ingestRundown)

		expect(result).toBe('default')
	})

	it('does not have variant, no default configured, returns null', () => {
		const ingestRundown: IngestRundown = getIngestRundown('nonExistentVariantName')

		const result = getShowStyleVariantId(getMockContext(), [], ingestRundown)

		expect(result).toBeNull()
	})

	it('does not have variant, default is not first in variant array, selects default', () => {
		const variantName = 'randomVariantName'
		const ingestRundown: IngestRundown = getIngestRundown('nonExistentVariantName')

		const showStyleVariants: IBlueprintShowStyleVariant[] = [
			{
				_id: 'someVariant',
				name: 'someVariant',
				blueprintConfig: {}
			},
			...getShowStyleVariants([variantName])
		]

		expect(showStyleVariants[0]._id).not.toBe('default')
		const result = getShowStyleVariantId(getMockContext(), showStyleVariants, ingestRundown)

		expect(result).toBe('default')
	})
})
