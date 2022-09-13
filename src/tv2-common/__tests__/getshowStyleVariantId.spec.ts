import { IBlueprintShowStyleVariant, IngestRundown, IStudioUserContext } from '@tv2media/blueprints-integration'
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
})
