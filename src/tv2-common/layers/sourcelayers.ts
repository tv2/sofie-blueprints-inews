export enum SharedSourceLayers {
	PgmGraphicsIdent = 'studio0_graphicsIdent',
	PgmGraphicsIdentPersistent = 'studio0_graphicsIdent_persistent',
	PgmGraphicsTop = 'studio0_graphicsTop',
	PgmGraphicsLower = 'studio0_graphicsLower',
	PgmGraphicsHeadline = 'studio0_graphicsHeadline',
	PgmGraphicsTema = 'studio0_graphicsTema',
	PgmGraphicsTLF = 'studio0_graphicsTelefon',
	/** General, 'fallback', overlay layer */
	PgmGraphicsOverlay = 'studio0_overlay',
	WallGraphics = 'studio0_wall_graphics',

	// Note: there is a regex in core to ignore some DVE layers. That will need updating if adding more
	PgmDVEBox1 = 'studio0_dve_box1',
	PgmDVEBox2 = 'studio0_dve_box2',
	PgmDVEBox3 = 'studio0_dve_box3',
	PgmDVEBox4 = 'studio0_dve_box4'
}
