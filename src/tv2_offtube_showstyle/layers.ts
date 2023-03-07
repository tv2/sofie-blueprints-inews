import { SharedOutputLayer, SharedSourceLayer } from 'tv2-constants'

export enum SourceLayer {
	// Pgm
	PgmDVEBackground = 'studio0_offtube_dve_back',

	// Adlib selection
	SelectedAdLibDVE = 'studio0_offtube_dve',
	SelectedAdlibJingle = 'studio0_offtube_jingle',

	// Aux
	AuxStudioScreen = 'studio0_offtube_aux_studio_screen',
	AuxPgmClean = 'studio0_offtube_aux_pgm_clean'
}

// tslint:disable-next-line: variable-name
export const OfftubeSourceLayer = {
	...SourceLayer,
	...SharedSourceLayer
}
export type OfftubeSourceLayer = SourceLayer | SharedSourceLayer

enum OutputLayers {}

// tslint:disable-next-line: variable-name
export const OfftubeOutputLayers = {
	...OutputLayers,
	...SharedOutputLayer
}

export type OfftubeOutputLayers = OutputLayers | SharedOutputLayer
