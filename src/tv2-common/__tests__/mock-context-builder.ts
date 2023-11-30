import { mock, when } from 'ts-mockito'
import {
	ShowStyleContext,
	TableConfigGfxSchema,
	TableConfigGfxSetup,
	TableConfigItemGfxDefaults,
	TV2ShowStyleConfig
} from 'tv2-common'

// tslint:disable:no-object-literal-type-assertion
/**
 * A builder class to create mocks for ShowStyleContext.
 * To make this useful to as many as possible all defaults should be empty or as close to empty as possible.
 * Feel free to add more setters methods as needed.
 */
export class MockContextBuilder {
	private gfxDefaults: TableConfigItemGfxDefaults[] = []
	private gfxSchemaTemplates: TableConfigGfxSchema[] = []
	private selectedGfxSetup: TableConfigGfxSetup = {
		_id: '',
		Name: '',
		HtmlPackageFolder: ''
	}
	private graphicsType: 'HTML' | 'VIZ' = 'HTML'

	public build(): ShowStyleContext {
		const context = mock<ShowStyleContext>()

		when(context.config).thenReturn({
			showStyle: {
				GfxDefaults: this.gfxDefaults,
				GfxSchemaTemplates: this.gfxSchemaTemplates
			},
			studio: {
				GraphicsType: this.graphicsType
			},
			selectedGfxSetup: this.selectedGfxSetup
		} as TV2ShowStyleConfig)

		return context
	}

	public setGfxDefaults(gfxDefault: TableConfigItemGfxDefaults): MockContextBuilder {
		this.gfxDefaults = [gfxDefault]
		return this
	}

	public setGfxSchemaTemplates(gfxSchemaTemplates: TableConfigGfxSchema[]): MockContextBuilder {
		this.gfxSchemaTemplates = gfxSchemaTemplates
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
}
