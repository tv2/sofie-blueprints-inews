import { SharedSourceLayers } from 'tv2-common'

export enum SourceLayer {
	// Pgm
	PgmSourceSelect = 'studio0_offtube_pgm_source_select',
	PgmDVEBackground = 'studio0_offtube_dve_back',
	PgmJingle = 'studio0_offtube_jingle',
	// TODO: This should be a shared sourcelayer, needs migration for pilot graphics.
	PgmFull = 'studio0_full',

	// TODO: These will be removed by adlib actions
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
export const OfftubeSourceLayer = {
	...SourceLayer,
	...SharedSourceLayers
}
export type OfftubeSourceLayer = SourceLayer | SharedSourceLayers

export enum OfftubeOutputLayers {
	SEC = 'sec',
	OVERLAY = 'overlay',
	JINGLE = 'jingle',
	SELECTED_ADLIB = 'selectedAdlib',
	AUX = 'aux',
	PGM = 'pgm'
}
