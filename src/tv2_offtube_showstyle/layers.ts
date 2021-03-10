import { SharedOutputLayers, SharedSourceLayers } from 'tv2-constants'

export enum SourceLayer {
	// Pgm
	PgmSourceSelect = 'studio0_offtube_pgm_source_select',
	PgmDVEBackground = 'studio0_offtube_dve_back',
	PgmJingle = 'studio0_jingle',
	// TODO: This should be a shared sourcelayer, needs migration for pilot graphics.
	PgmFull = 'studio0_full',

	// TODO: These will be removed by adlib actions
	// Adlib selection
	SelectedAdLibDVE = 'studio0_offtube_dve',
	SelectedAdlibJingle = 'studio0_offtube_jingle',

	PgmContinuity = 'studio0_offtube_continuity',

	// Aux
	AuxStudioScreen = 'studio0_offtube_aux_studio_screen',
	AuxPgmClean = 'studio0_offtube_aux_pgm_clean'
}

// tslint:disable-next-line: variable-name
export const OfftubeSourceLayer = {
	...SourceLayer,
	...SharedSourceLayers
}
export type OfftubeSourceLayer = SourceLayer | SharedSourceLayers

enum OutputLayers {}

// tslint:disable-next-line: variable-name
export const OfftubeOutputLayers = {
	...OutputLayers,
	...SharedOutputLayers
}

export type OfftubeOutputLayers = OutputLayers | SharedOutputLayers
