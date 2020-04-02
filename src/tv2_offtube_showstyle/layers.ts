export enum OffTubeSourceLayer {
	// Pgm
	PgmSourceSelect = 'studio0_offtube_pgm_source_select',
	PgmDVEBackground = 'studio0_offtube_dve_back',
	PgmJingle = 'studio0_offtube_jingle',

	// Adlib selection
	SelectedAdLibDVE = 'studio0_offtube_dve',
	SelectedAdLibServer = 'studio0_offtube_clip',
	SelectedAdLibVoiceOver = 'studio0_offtube_voiceover',
	SelectedAdlibGraphicsFull = 'studio0_offtube_graphicsFull',

	PgmDVEBox1 = 'studio0_dve_box1',
	PgmDVEBox2 = 'studio0_dve_box2',
	PgmDVEBox3 = 'studio0_dve_box3',
	PgmDVEBox4 = 'studio0_dve_box4',

	// Graphics
	PgmGraphicsOverlay = 'studio0_offtube_graphicsOverlay',
	PgmGraphicsIdent = 'studio0_offtube_graphicsIdent',
	PgmGraphicsIdentPersistent = 'studio0_offtube_graphicsIdent_persistent',
	PgmGraphicsTop = 'studio0_offtube_graphicsTop',
	PgmGraphicsLower = 'studio0_offtube_graphicsLower',
	PgmGraphicsHeadline = 'studio0_offtube_graphicsHeadline',
	PgmGraphicsTema = 'studio0_offtube_graphicsTema',
	PgmGraphicsTLF = 'studio0_offtube_graphicsTLF',
	PgmContinuity = 'studio0_offtube_continuity',
	WallGraphics = 'studio0_offtube_wall_graphics',

	// Aux
	AuxStudioScreen = 'studio0_offtube_aux_studio_screen'
}

export enum OfftubeOutputLayers {
	SEC = 'sec',
	OVERLAY = 'overlay',
	JINGLE = 'jingle',
	SELECTED_ADLIB = 'selectedAdlib',
	AUX = 'aux'
}
