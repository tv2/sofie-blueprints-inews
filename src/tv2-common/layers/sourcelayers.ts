export enum SharedSourceLayers {
	PgmCam = 'studio0_camera',
	PgmLive = 'studio0_live',
	PgmDVE = 'studio0_dve',
	PgmDVEAdLib = 'studio0_dve_adlib',
	PgmServer = 'studio0_clip',
	PgmVoiceOver = 'studio0_voiceover',

	// Graphics
	PgmGraphicsIdent = 'studio0_graphicsIdent',
	PgmGraphicsIdentPersistent = 'studio0_graphicsIdent_persistent',
	PgmGraphicsTop = 'studio0_graphicsTop',
	PgmGraphicsLower = 'studio0_graphicsLower',
	PgmGraphicsHeadline = 'studio0_graphicsHeadline',
	PgmGraphicsTema = 'studio0_graphicsTema',
	PgmGraphicsTLF = 'studio0_graphicsTelefon',
	PgmDesign = 'studio0_design',

	/** General, 'fallback', overlay layer */
	PgmGraphicsOverlay = 'studio0_overlay',
	WallGraphics = 'studio0_wall_graphics',

	// Note: there is a regex in core to ignore some DVE layers. That will need updating if adding more
	PgmDVEBox1 = 'studio0_dve_box1',
	PgmDVEBox2 = 'studio0_dve_box2',
	PgmDVEBox3 = 'studio0_dve_box3',
	PgmDVEBox4 = 'studio0_dve_box4',

	// Selected Sources
	SelectedServer = 'studio0_selected_clip',
	SelectedVoiceOver = 'studio0_selected_voiceover',

	// Other / sec / manus
	PgmScript = 'studio0_script',

	// DSK toggle
	PgmDSK1 = 'studio0_dsk_cmd',
	PgmDSK2 = 'studio0_dsk_2_cmd',
	PgmDSK3 = 'studio0_dsk_3_cmd',
	PgmDSK4 = 'studio0_dsk_4_cmd'
}

export const pgmDSKLayers: { [num: number]: string } = {
	1: SharedSourceLayers.PgmDSK1,
	2: SharedSourceLayers.PgmDSK2,
	3: SharedSourceLayers.PgmDSK3,
	4: SharedSourceLayers.PgmDSK4
}
