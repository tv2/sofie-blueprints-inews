export enum NoteType {
	INFO = 0,
	DEBUG = 1,
	WARNING = 2,
	ERROR = 3,
	NOTIFY_USER_INFO = 4,
	NOTIFY_USER_WARNING = 5,
	NOTIFY_USER_ERROR = 6
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
	PgmClean,
	MixMinus,
	RobotCamera
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
	REMOTE = 'Ekstern',
	Telefon = 'Telefon'
}

export const enum SourceType {
	KAM = 'KAM',
	SERVER = 'SERVER',
	VO = 'VO',
	TEKNIK = 'TEKNIK',
	GRAFIK = 'GRAFIK',
	REPLAY = 'REPLAY',
	REMOTE = 'REMOTE',
	DEFAULT = 'DEFAULT',
	PGM = 'PGM',
	INVALID = 'INVALID'
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
	ADLIB_KOMMENTATOR = 'kommentator',
	ADLIB_NO_NEXT_HIGHLIGHT = 'no_next_highlight',
	ADLIB_CUT_DIRECT = 'cut_direct',
	ADLIB_QUEUE_NEXT = 'queue_next',
	ADLIB_VO_AUDIO_LEVEL = 'vo_audio_level',
	ADLIB_FULL_AUDIO_LEVEL = 'full_audio_level',
	ADLIB_TO_STUDIO_SCREEN_AUX = 'to_studio_screen_aux',
	ADLIB_TO_GRAPHICS_ENGINE_AUX = 'to_graphics_engine_aux',
	ADLIB_CUT_TO_BOX_1 = 'cut_to_box_1',
	ADLIB_CUT_TO_BOX_2 = 'cut_to_box_2',
	ADLIB_CUT_TO_BOX_3 = 'cut_to_box_3',
	ADLIB_CUT_TO_BOX_4 = 'cut_to_box_4',
	ADLIB_GFX_ALTUD = 'gfx_altud',
	ADLIB_GFX_LOAD = 'gfx_load',
	ADLIB_GFX_CONTINUE_FORWARD = 'gfx_continue_forward',
	ADLIB_DSK_ON = 'dsk_on',
	ADLIB_DSK_OFF = 'dsk_off',
	ADLIB_MICS_UP = 'mics_up',
	ADLIB_MICS_DOWN = 'mics_down',
	ADLIBS_RESYNC_SISYFOS = 'resync_sisyfos',
	ADLIB_DESIGN_STYLE_SC = 'design_style_sc',
	ADLIB_STOP_AUDIO_BED = 'stop_audio_bed',
	ADLIB_RECALL_LAST_LIVE = 'recall_last_live',
	ADLIB_RECALL_LAST_DVE = 'recall_last_dve',
	ADLIB_SELECT_DVE_LAYOUT = 'select_dve_layout',
	ADLIB_TAKE_WITH_TRANSITION = 'take_with_transition',
	ADLIB_NEXT_TAKE_WITH_TRANSITION = 'next_take_with_transition',
	ADLIB_FADE_DOWN_PERSISTED_AUDIO_LEVELS = 'fade_down_persisted_audio_levels'
}

/**
 * Generates a tag for a 'cut to box' adlib
 * @param box Box number (0-indexed)
 */
export function AdlibTagCutToBox(box: number): AdlibTags {
	return `cut_to_box_${box + 1}` as AdlibTags
}

export enum ControlClasses {
	SERVER_ON_AIR = 'server_on_air',
	LYD_ON_AIR = 'lyd_on_air',
	LIVE_SOURCE_ON_AIR = 'live_source_on_air',
	ABSTRACT_LOOKAHEAD = 'abstract_lookahead',
	PLACEHOLDER = 'placeholder'
}

export function GetEnableClassForServer(mediaPlayerSessionId: string) {
	return `${ControlClasses.SERVER_ON_AIR}_${mediaPlayerSessionId}`
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
	RECALL_LAST_DVE = 'recall_last_dve',
	FADE_DOWN_PERSISTED_AUDIO_LEVELS = 'fade_down_persisted_audio_levels',
	CALL_ROBOT_PRESET = 'call_robot_preset'
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

export enum SharedGraphicLLayer {
	GraphicLLayerOverlay = 'graphic_overlay', // <= viz_layer_overlay
	GraphicLLayerOverlayIdent = 'graphic_overlay_ident', // <= viz_layer_overlay_ident
	GraphicLLayerOverlayTopt = 'graphic_overlay_topt', // <= viz_layer_overlay_topt
	GraphicLLayerOverlayLower = 'graphic_overlay_lower', // <= viz_layer_overlay_lower
	GraphicLLayerOverlayHeadline = 'graphic_overlay_headline', // <= viz_layer_overlay_headline
	GraphicLLayerOverlayTema = 'graphic_overlay_tema', // <= viz_layer_overlay_tema
	GraphicLLayerOverlayPilot = 'graphic_overlay_pilot', // <= viz_layer_pilot_overlay
	GraphicLLayerPilot = 'graphic_pilot', // <= viz_layer_pilot
	GraphicLLayerDesign = 'graphic_design', // <= viz_layer_design
	GraphicLLayerFullLoop = 'graphic_full_loop',
	GraphicLLayerAdLibs = 'graphic_adlibs', // <= viz_layer_adlibs
	GraphicLLayerWall = 'graphic_wall', // <= viz_layer_wall
	GraphicLLayerLocators = 'graphic_locators',
	GraphicLLayerConcept = 'graphic_concept'
}

export enum AbstractLLayer {
	ServerEnablePending = 'server_enable_pending',
	/* Exists to give the Ident UI marker a timeline object so that it gets the startedPlayback callback */
	IdentMarker = 'ident_marker',
	AudioBedBaseline = 'audio_bed_baseline'
}

export enum SwitcherMixEffectLLayer {
	Program = 'me_program',
	Clean = 'me_clean',
	CleanUSKEffect = 'clean_usk_effect',
	Next = 'me_next',
	NextJingle = 'me_next_jingle'
}

export enum SwitcherAuxLLayer {
	AuxProgram = 'aux_pgm',
	AuxClean = 'aux_clean',
	AuxWall = 'aux_wall',
	AuxAR = 'aux_ar',
	AuxVizOvlIn1 = 'aux_viz_ovl_in_1',
	AuxVenue = 'aux_venue',
	AuxLookahead = 'aux_lookahead',
	AuxDve = 'aux_dve',
	AuxVideoMixMinus = 'aux_video_mix_minus',
	AuxScreen = 'aux_screen',
	AuxServerLookahead = 'aux_server_lookahead'
}

export enum SwitcherDveLLayer {
	Dve = 'dve',
	DveBoxes = 'dve_boxes'
}

export enum SharedATEMLLayer {
	AtemAuxVideoMixMinus = 'atem_aux_video_mix_minus'
}

export enum SharedCasparLLayer {
	CasparCGLYD = 'casparcg_audio_lyd',
	CasparPlayerClipPending = 'casparcg_player_clip_pending',
	CasparPlayerJingle = 'casparcg_player_jingle'
}

export enum SharedSisyfosLLayer {
	SisyfosSourceAudiobed = 'sisyfos_source_audiobed',
	SisyfosResync = 'sisyfos_resync',
	SisyfosGroupStudioMics = 'sisyfos_group_studio_mics'
}

export enum RobotCameraLayer {
	TELEMETRICS = 'telemetrics_layer'
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
	PgmAdlibJingle = 'studio0_adlib_jingle',

	// Selected Sources
	SelectedServer = 'studio0_selected_clip',
	SelectedVoiceOver = 'studio0_selected_voiceover',
	SelectedAdlibGraphicsFull = 'studio0_selected_graphicsFull',

	// Other / sec / manus
	PgmScript = 'studio0_script',
	PgmAudioBed = 'studio0_audio_bed',

	// AUX
	AuxMixMinus = 'studio0_aux_mix_minus',

	RobotCamera = 'studio0_robot_camera'
}

export enum DSKRoles {
	FULLGFX = 'full_graphics',
	OVERLAYGFX = 'overlay_graphics',
	JINGLE = 'jingle'
}
