export enum NoteType {
	WARNING = 1,
	ERROR = 2
}

export enum MediaPlayerClaimType {
	Preloaded,
	Active
}

export enum CueType {
	Unknown,
	Grafik,
	MOS,
	Ekstern,
	DVE,
	Telefon,
	VIZ,
	Mic,
	AdLib,
	LYD,
	Jingle,
	Design,
	Profile,
	TargetEngine,
	ClearGrafiks
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
	/** Used as a placeholder for onTimelineGenerate to do clips-in-DVE. */
	DVEPlaceholder = 'dve_placeholder',
	NOLookahead = 'no_lookahead',
	CopyMediaPlayerSession = 'copy_media_player_session',
	AbstractLookahead = 'abstract_lookahead'
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
	TAKE_WITH_TRANSITION = 'take_with_transition'
}

export enum TallyTags {
	// Actions
	GFX_CLEAR = 'GFX_CLEAR',
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
