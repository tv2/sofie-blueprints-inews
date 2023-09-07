import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
	ShowStyleContext,
	TableConfigGfxSchema,
	TableConfigGfxSetup,
	TableConfigItemGfxDefaults,
	TableConfigItemGfxDesignTemplate,
	TV2ShowStyleVariant
} from 'tv2-common'

/**
 * A builder class to create mocks for ShowStyleContext.
 * To make this useful to as many as possible all defaults should be empty or as close to empty as possible.
 * Feel free to add more setters methods as needed.
 */
export class MockContextBuilder {
	private gfxDefaults: Array<Partial<TableConfigItemGfxDefaults>> = []
	private gfxSchemaTemplates: TableConfigGfxSchema[] = []
	private gfxDesignTemplates: TableConfigItemGfxDesignTemplate[] = []
	private selectedGfxSetup: TableConfigGfxSetup = {
		_id: '',
		Name: '',
		HtmlPackageFolder: ''
	}
	private graphicsType: 'HTML' | 'VIZ' = 'HTML'
	private variants: TV2ShowStyleVariant[] = []

	public build(): DeepMockProxy<ShowStyleContext> {
		const context = mockDeep<ShowStyleContext>({
			config: {
				showStyle: {
					GfxDefaults: this.gfxDefaults,
					GfxSchemaTemplates: this.gfxSchemaTemplates,
					GfxDesignTemplates: this.gfxDesignTemplates
				},
				studio: {
					GraphicsType: this.graphicsType
				},
				selectedGfxSetup: this.selectedGfxSetup,
				variants: this.variants
			}
		})
		return context
	}

	public setGfxDefaults(gfxDefault: Partial<TableConfigItemGfxDefaults>): MockContextBuilder {
		this.gfxDefaults = [gfxDefault]
		return this
	}

	public setGfxSchemaTemplates(gfxSchemaTemplates: TableConfigGfxSchema[]): MockContextBuilder {
		this.gfxSchemaTemplates = gfxSchemaTemplates
		return this
	}

	public setGfxDesignTemplates(gfxDesignTemplates: TableConfigItemGfxDesignTemplate[]): MockContextBuilder {
		this.gfxDesignTemplates = gfxDesignTemplates
		return this
	}

	public setSelectedGfxSetup(selectedGfxSetup: TableConfigGfxSetup): MockContextBuilder {
		this.selectedGfxSetup = selectedGfxSetup
		return this
	}

	public setGraphicsType(graphicsType: 'HTML' | 'VIZ'): MockContextBuilder {
		this.graphicsType = graphicsType
		return this
	}

	public setVariants(variants: TV2ShowStyleVariant[]): MockContextBuilder {
		this.variants = variants
		return this
	}
}
