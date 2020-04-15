import { SharedSourceLayers } from 'tv2-common'

export enum SourceLayer {
	// Pgm
	PgmSourceSelect = 'studio0_offtube_pgm_source_select',
	PgmDVEBackground = 'studio0_offtube_dve_back',
	PgmJingle = 'studio0_offtube_jingle',

	// Adlib selection
	SelectedAdLibDVE = 'studio0_offtube_dve',
	SelectedAdLibServer = 'studio0_offtube_clip',
	SelectedAdLibVoiceOver = 'studio0_offtube_voiceover',
	SelectedAdlibGraphicsFull = 'studio0_offtube_graphicsFull',

	PgmContinuity = 'studio0_offtube_continuity',

	// Aux
	AuxStudioScreen = 'studio0_offtube_aux_studio_screen'
}

// tslint:disable-next-line: variable-name
export const OffTubeSourceLayer = {
	...SourceLayer,
	...SharedSourceLayers
}
export type OffTubeSourceLayer = SourceLayer | SharedSourceLayers

export enum OfftubeOutputLayers {
	SEC = 'sec',
	OVERLAY = 'overlay',
	JINGLE = 'jingle',
	SELECTED_ADLIB = 'selectedAdlib',
	AUX = 'aux'
}
