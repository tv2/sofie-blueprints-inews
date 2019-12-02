export enum SourceLayer {
	// Pgm
	PgmCam = 'studio0_camera',
	PgmLive = 'studio0_live',
	PgmDVE = 'studio0_dve',
	PgmDVEAdlib = 'studio0_dve_adlib',
	PgmServer = 'studio0_clip',
	PgmVoiceOver = 'studio0_voiceover',
	PgmPilot = 'studio0_pilot',
	PgmPilotOverlay = 'studio0_pilotOverlay',
	PgmGraphicsIdent = 'studio0_graphicsIdent',
	PgmGraphicsTop = 'studio0_graphicsTop',
	PgmGraphicsLower = 'studio0_graphicsLower',
	PgmGraphicsHeadline = 'studio0_graphicsHeadline',
	PgmGraphicsTema = 'studio0_graphicsTema',
	PgmGraphicsTLF = 'studio0_graphicsTelefon',
	PgmGraphicsOverlay = 'studio0_overlay',
	PgmDelayed = 'studio0_delayed',
	PgmContinuity = 'studio0_continuity',

	// Note: there is a regex in core to ignore some DVE layers. That will need updating if adding more
	PgmDVEBox1 = 'studio0_dve_box1',
	PgmDVEBox2 = 'studio0_dve_box2',
	PgmDVEBox3 = 'studio0_dve_box3',

	VizFullIn1 = 'studio0_aux_viz_full1',
	PgmDVEBackground = 'studio0_dve_back',
	PgmDesign = 'studio0_design',
	PgmAdlibVizCmd = 'studio0_adlib_viz_cmd', // shortcuts
	PgmDSK = 'studio0_dsk_cmd', // shortcuts
	PgmJingle = 'studio0_jingle',
	PgmScript = 'studio0_script',
	// PgmSlutord = 'studio0_slutord',
	PgmAudioBed = 'studio0_audio_bed'
}

export enum ControlClasses {
	ShowIdentGraphic = 'show_ident_graphic',
	DVEOnAir = 'dve_on_air' // DVE Part is on air
}
