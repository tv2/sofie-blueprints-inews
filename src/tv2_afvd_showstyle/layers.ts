import { SharedSourceLayers } from 'tv2-common'

export enum AFVDSourceLayer {
	// Pgm
	PgmCam = 'studio0_camera',
	PgmLive = 'studio0_live',
	PgmDVE = 'studio0_dve',
	PgmServer = 'studio0_clip',
	PgmVoiceOver = 'studio0_voiceover',
	PgmLocal = 'studio0_local',
	/** "Full" */
	PgmPilot = 'studio0_pilot',
	/** Viz-specific */
	PgmPilotOverlay = 'studio0_pilotOverlay',
	PgmContinuity = 'studio0_continuity',

	VizFullIn1 = 'studio0_aux_viz_full1',
	AuxStudioScreen = 'studio0_aux_studio_screen',
	PgmDVEBackground = 'studio0_dve_back',
	PgmFullBackground = 'studio0_full_back',
	PgmDesign = 'studio0_design',
	PgmAdlibVizCmd = 'studio0_adlib_viz_cmd', // shortcuts
	PgmDSK1 = 'studio0_dsk_cmd', // shortcuts
	PgmDSK2 = 'studio0_dsk2_cmd', // shortcuts
	PgmDSK3 = 'studio0_dsk3_cmd', // shortcuts
	PgmDSK4 = 'studio0_dsk4_cmd', // shortcuts
	PgmSisyfosAdlibs = 'studio0_sisyfos_adlibs', // shortcuts
	PgmJingle = 'studio0_jingle',
	PgmScript = 'studio0_script',
	// PgmSlutord = 'studio0_slutord',
	PgmAudioBed = 'studio0_audio_bed',

	// Wall
	WallGraphics = 'studio0_wall_graphics'
}

export const afvdPgmDSKLayers: { [num: number]: string } = {
	1: AFVDSourceLayer.PgmDSK1,
	2: AFVDSourceLayer.PgmDSK2,
	3: AFVDSourceLayer.PgmDSK3,
	4: AFVDSourceLayer.PgmDSK4
}

// tslint:disable-next-line: variable-name
export const SourceLayer = {
	...AFVDSourceLayer,
	...SharedSourceLayers
}
export type SourceLayer = AFVDSourceLayer | SharedSourceLayers
