import { SharedSourceLayer } from 'tv2-constants'

export enum AFVDSourceLayer {
	// Pgm
	PgmLocal = 'studio0_local',
	PgmSchema = 'studio0_schema',

	VizFullIn1 = 'studio0_aux_viz_full1',
	AuxStudioScreen = 'studio0_aux_studio_screen',
	PgmDVEBackground = 'studio0_dve_back',
	PgmFullBackground = 'studio0_full_back',
	GraphicsShowLifecycle = 'studio0_graphic_show_lifecycle'
}

// tslint:disable-next-line: variable-name
export const SourceLayer = {
	...AFVDSourceLayer,
	...SharedSourceLayer
}
export type SourceLayer = AFVDSourceLayer | SharedSourceLayer
