import { SharedSourceLayers } from 'tv2-constants'

export enum AFVDSourceLayer {
	// Pgm
	PgmLocal = 'studio0_local',

	VizFullIn1 = 'studio0_aux_viz_full1',
	AuxStudioScreen = 'studio0_aux_studio_screen',
	PgmDVEBackground = 'studio0_dve_back',
	PgmFullBackground = 'studio0_full_back',
	GraphicsShowLifecycle = 'studio0_graphic_show_lifecycle',

	// Wall
	WallGraphics = 'studio0_wall_graphics',

	// Telemetrics
	Telemetrics = 'studio0_telemetrics'
}

// tslint:disable-next-line: variable-name
export const SourceLayer = {
	...AFVDSourceLayer,
	...SharedSourceLayers
}
export type SourceLayer = AFVDSourceLayer | SharedSourceLayers
