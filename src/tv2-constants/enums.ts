export enum NoteType {
	WARNING = 1,
	ERROR = 2
}

export enum MediaPlayerClaimType {
	Preloaded,
	Active
}

export enum CueType {
	UNKNOWN,
	Ekstern,
	DVE,
	Telefon,
	VIZ,
	Mic,
	AdLib,
	LYD,
	Jingle,
	Profile,
	ClearGrafiks,
	UNPAIRED_TARGET,
	UNPAIRED_PILOT,
	BackgroundLoop,
	GraphicDesign,
	Graphic,
	Routing,
	PgmClean
}

export const enum PartType {
	Unknown = 'Unknown',
	Kam = 'Kam',
	Server = 'Server',
	VO = 'VO',
	Teknik = 'Teknik',
	Grafik = 'Grafik',
	INTRO = 'INTRO',
	EVS = 'EVS',
	DVE = 'DVE',
	Ekstern = 'Ekstern',
	Telefon = 'Telefon'
}

export enum Enablers {
	OFFTUBE_ENABLE_FULL = 'offtube_enable_full',
	OFFTUBE_ENABLE_SERVER_LOOKAHEAD = 'offtube_enable_server_lookahead'
}

export enum AdlibTags {
	OFFTUBE_ADLIB_SERVER = 'offtube_adlib_server',
	OFFTUBE_100pc_SERVER = 'offtube_adlib_100pc_server',
	OFFTUBE_SET_CAM_NEXT = 'offtube_set_cam_next',
	OFFTUBE_SET_REMOTE_NEXT = 'offtube_set_remote_next',
	OFFTUBE_SET_FULL_NEXT = 'offtube_set_full_next',
	OFFTUBE_SET_JINGLE_NEXT = 'offtube_set_jingle_next',
	OFFTUBE_SET_SERVER_NEXT = 'offtube_set_server_next',
	OFFTUBE_SET_DVE_NEXT = 'offtube_set_dve_next',
	ADLIB_FLOW_PRODUCER = 'flow_producer',
	ADLIB_STATIC_BUTTON = 'static_button',
	ADLIB_KOMMENTATOR = 'kommentator'
}

export enum ControlClasses {
	ShowIdentGraphic = 'show_ident_graphic',
	/** Indicates that a DVE is currently on air */
	DVEOnAir = 'dve_on_air',
	ServerOnAir = 'server_on_air',
	LYDOnAir = 'lyd_on_air',
	NOLookahead = 'no_lookahead',
	CopyMediaPlayerSession = 'copy_media_player_session',
	AbstractLookahead = 'abstract_lookahead'
}

export function GetEnableClassForServer(mediaPlayerSessionId: string) {
	return `${ControlClasses.ServerOnAir}_${mediaPlayerSessionId}`
}

export enum AdlibActionType {
	SELECT_SERVER_CLIP = 'select_server_clip',
	SELECT_DVE = 'select_dve',
	SELECT_DVE_LAYOUT = 'select_dve_layout',
	SELECT_FULL_GRAFIK = 'select_full_grafik',
	SELECT_JINGLE = 'select_jingle',
	CUT_TO_CAMERA = 'cut_to_camera',
	CUT_TO_REMOTE = 'cut_to_remote',
	CUT_SOURCE_TO_BOX = 'cut_source_to_box',
	COMMENTATOR_SELECT_SERVER = 'commentator_select_server',
	COMMENTATOR_SELECT_DVE = 'commentator_select_dve',
	COMMENTATOR_SELECT_FULL = 'commentator_select_full',
	COMMENTATOR_SELECT_JINGLE = 'commentator_select_jingle',
	CLEAR_GRAPHICS = 'clear_graphics',
	TAKE_WITH_TRANSITION = 'take_with_transition',
	RECALL_LAST_LIVE = 'recall_last_live',
	RECALL_LAST_DVE = 'recall_last_dve'
}

export enum TallyTags {
	// Actions
	GFX_CLEAR = 'GFX_CLEAR',
	GFX_ALTUD = 'GFX_ALTUD',
	TAKE_WITH_TRANSITION = 'TAKE_WITH_TRANSITION',

	// A particular source is live
	KAM = 'KAM',
	LIVE = 'EKSTERN',
	CLIP = 'CLIP',
	DVE = 'DVE',
	FULL = 'FULL',
	JINGLE = 'JINGLE',

	// ANY of source type is live
	SERVER_IS_LIVE = 'SERVER_IS_LIVE',
	DVE_IS_LIVE = 'DVE_IS_LIVE',
	FULL_IS_LIVE = 'FULL_IS_LIVE',
	JINGLE_IS_LIVE = 'JINGLE_IS_LIVE'
}

export enum GraphicLLayer {
	GraphicLLayerOverlay = 'graphic_overlay', // <= viz_layer_overlay
	GraphicLLayerOverlayIdent = 'graphic_overlay_ident', // <= viz_layer_overlay_ident
	GraphicLLayerOverlayTopt = 'graphic_overlay_topt', // <= viz_layer_overlay_topt
	GraphicLLayerOverlayLower = 'graphic_overlay_lower', // <= viz_layer_overlay_lower
	GraphicLLayerOverlayHeadline = 'graphic_overlay_headline', // <= viz_layer_overlay_headline
	GraphicLLayerOverlayTema = 'graphic_overlay_tema', // <= viz_layer_overlay_tema
	GraphicLLayerPilot = 'graphic_pilot', // <= viz_layer_pilot
	GraphicLLayerPilotOverlay = 'graphic_pilot_overlay', // <= viz_layer_pilot_overlay
	GraphicLLayerDesign = 'graphic_design', // <= viz_layer_design
	GraphicLLayerFullLoop = 'graphic_full_loop',
	GraphicLLayerAdLibs = 'graphic_adlibs', // <= viz_layer_adlibs
	GraphicLLayerWall = 'graphic_wall' // <= viz_layer_wall,
}

export enum AbstractLLayer {
	ServerEnablePending = 'server_enable_pending',
	/* Exists to give the Ident UI marker a timeline object so that it gets the startedPlayback callback */
	IdentMarker = 'ident_marker',
	AudioBedBaseline = 'audio_bed_baseline'
}

export enum SharedATEMLLayer {
	AtemDSKGraphics = 'atem_dsk_graphics'
}

export enum SharedCasparLLayer {
	CasparCGLYD = 'casparcg_audio_lyd',
	CasparPlayerClipPending = 'casparcg_player_clip_pending',
	CasparPlayerJingle = 'casparcg_player_jingle'
}

export enum SharedSisyfosLLayer {
	SisyfosSourceAudiobed = 'sisyfos_source_audiobed',
	SisyfosResync = 'sisyfos_resync'
}

export enum SharedOutputLayers {
	OVERLAY = 'overlay',
	SEC = 'sec',
	PGM = 'pgm',
	JINGLE = 'jingle',
	MUSIK = 'musik',
	MANUS = 'manus',
	AUX = 'aux',
	SELECTED_ADLIB = 'selectedAdlib'
}

export enum SharedSourceLayers {
	PgmCam = 'studio0_camera',
	PgmLive = 'studio0_live',
	PgmDVE = 'studio0_dve',
	PgmDVEAdLib = 'studio0_dve_adlib',
	PgmServer = 'studio0_clip',
	PgmVoiceOver = 'studio0_voiceover',
	PgmContinuity = 'studio0_continuity',
	PgmJingle = 'studio0_jingle',
	PgmSisyfosAdlibs = 'studio0_sisyfos_adlibs', // shortcuts

	// Graphics
	PgmGraphicsIdent = 'studio0_graphicsIdent',
	PgmGraphicsIdentPersistent = 'studio0_graphicsIdent_persistent',
	PgmGraphicsTop = 'studio0_graphicsTop',
	PgmGraphicsLower = 'studio0_graphicsLower',
	PgmGraphicsHeadline = 'studio0_graphicsHeadline',
	PgmGraphicsTema = 'studio0_graphicsTema',
	PgmGraphicsTLF = 'studio0_graphicsTelefon',
	// "Full" / "Pilot" graphics
	PgmPilot = 'studio0_pilot',
	PgmPilotOverlay = 'studio0_pilotOverlay',
	// "Design" templates
	PgmDesign = 'studio0_design',

	/** General, 'fallback', overlay layer */
	PgmGraphicsOverlay = 'studio0_overlay',
	WallGraphics = 'studio0_wall_graphics',

	PgmAdlibGraphicCmd = 'studio0_adlib_graphic_cmd', // shortcuts

	PgmDVEBox1 = 'studio0_dve_box1',
	PgmDVEBox2 = 'studio0_dve_box2',
	PgmDVEBox3 = 'studio0_dve_box3',
	PgmDVEBox4 = 'studio0_dve_box4',

	// Selected Sources
	SelectedServer = 'studio0_selected_clip',
	SelectedVoiceOver = 'studio0_selected_voiceover',
	SelectedAdlibGraphicsFull = 'studio0_selected_graphicsFull',

	// Other / sec / manus
	PgmScript = 'studio0_script',
	PgmAudioBed = 'studio0_audio_bed',

	// DSK toggle
	PgmDSK1 = 'studio0_dsk_cmd',
	PgmDSK2 = 'studio0_dsk_2_cmd',
	PgmDSK3 = 'studio0_dsk_3_cmd',
	PgmDSK4 = 'studio0_dsk_4_cmd'
}
