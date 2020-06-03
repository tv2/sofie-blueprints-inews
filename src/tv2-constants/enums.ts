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
	OFFTUBE_ENABLE_SERVER = 'offtube_enable_server',
	OFFTUBE_ENABLE_FULL = 'offtube_enable_full',
	OFFTUBE_ENABLE_DVE = 'offtube_enable_dve',
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
	/** Used as a placeholder for onTimelineGenerate to do clips-in-DVE. */
	DVEPlaceholder = 'dve_placeholder',
	NOLookahead = 'no_lookahead',
	CopyMediaPlayerSession = 'copy_media_player_session',
	AbstractLookahead = 'abstract_lookahead'
}
