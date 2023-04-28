import { ISourceLayer, SourceLayerType } from 'blueprints-integration'
import { GetDSKSourceLayerDefaults, literal } from 'tv2-common'
import { SharedSourceLayer } from 'tv2-constants'
import { ATEMModel } from '../../types/atem'
import { SourceLayer } from '../layers'

// OVERLAY group
const OVERLAY: ISourceLayer[] = [
	{
		_id: SourceLayer.PgmGraphicsIdent,
		_rank: 10,
		name: 'GFX Ident',
		abbreviation: 'G',
		type: SourceLayerType.LOWER_THIRD,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.PgmGraphicsTop,
		_rank: 20,
		name: 'GFX Top',
		abbreviation: 'G',
		type: SourceLayerType.LOWER_THIRD,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.PgmGraphicsLower,
		_rank: 30,
		name: 'GFX Lowerthirds',
		abbreviation: 'G',
		type: SourceLayerType.LOWER_THIRD,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.PgmGraphicsHeadline,
		_rank: 40,
		name: 'GFX Headline',
		abbreviation: 'G',
		type: SourceLayerType.LOWER_THIRD,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.PgmGraphicsTema,
		_rank: 50,
		name: 'GFX Tema',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.PgmGraphicsOverlay,
		_rank: 55,
		name: 'GFX Overlay (fallback)',
		abbreviation: 'O',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.PgmPilotOverlay,
		_rank: 60,
		name: 'GFX Overlay (VCP)',
		abbreviation: 'O',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.GraphicsShowLifecycle,
		_rank: 60,
		name: 'GFX Show Lifecycle',
		abbreviation: '',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: false,

		isSticky: false,

		isQueueable: false,
		isHidden: true,
		allowDisable: true,
		onPresenterScreen: false
	}
]

// JINGLE group
const JINGLE: ISourceLayer[] = [
	{
		_id: SourceLayer.PgmJingle,
		_rank: 10,
		name: 'Jingle',
		abbreviation: '',
		type: SourceLayerType.TRANSITION,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	}
]

// PGM group
const PGM: ISourceLayer[] = [
	{
		_id: SourceLayer.PgmCam,
		_rank: 0,
		name: 'Camera',
		abbreviation: 'K',
		type: SourceLayerType.CAMERA,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,
		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SourceLayer.PgmLive,
		_rank: 0,
		name: 'Live',
		abbreviation: 'L',
		type: SourceLayerType.REMOTE,
		exclusiveGroup: 'me1',
		isRemoteInput: true,
		isGuestInput: false,

		isSticky: false,
		stickyOriginalOnly: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SourceLayer.PgmLocal,
		_rank: 0,
		name: 'EVS',
		abbreviation: 'EVS',
		type: SourceLayerType.LOCAL,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SourceLayer.PgmDVE,
		_rank: 0,
		name: 'DVE',
		abbreviation: 'D',
		type: SourceLayerType.SPLITS,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,
		stickyOriginalOnly: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SourceLayer.PgmDVEAdLib,
		_rank: 0,
		name: 'DVE (adlib)',
		abbreviation: 'D',
		type: SourceLayerType.SPLITS,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SourceLayer.PgmServer,
		_rank: 0,
		name: 'Server',
		abbreviation: 'S',
		type: SourceLayerType.VT,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SourceLayer.PgmVoiceOver,
		_rank: 0,
		name: 'VO',
		abbreviation: 'VO',
		type: SourceLayerType.LIVE_SPEAK,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SourceLayer.PgmPilot,
		_rank: 0,
		name: 'GFX FULL (VCP)',
		abbreviation: 'F',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SourceLayer.PgmGraphicsTLF,
		_rank: 0,
		name: 'GFX Telefon',
		abbreviation: 'TLF',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: true,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SourceLayer.PgmContinuity,
		_rank: 0,
		name: 'Continuity',
		abbreviation: 'CONTINUITY',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	}
]

// MUSIK group
const MUSIK: ISourceLayer[] = [
	{
		_id: SourceLayer.PgmAudioBed,
		_rank: 30,
		name: 'Audiobed (shared)',
		abbreviation: 'VO',
		type: SourceLayerType.AUDIO,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	}
]

// MANUS group
const MANUS: ISourceLayer[] = [
	{
		_id: SourceLayer.PgmScript,
		_rank: 20,
		name: 'Manus',
		abbreviation: '',
		type: SourceLayerType.SCRIPT,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	}
]

// SEC group
const SEC: ISourceLayer[] = [
	{
		_id: SourceLayer.PgmAdlibJingle,
		_rank: 10,
		name: 'Effect (adlib)',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.PgmAdlibGraphicCmd,
		_rank: 10,
		name: 'GFX Cmd (adlib)',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	},
	...GetDSKSourceLayerDefaults(ATEMModel.CONSTELLATION_8K_UHD_MODE),
	{
		_id: SourceLayer.PgmDesign,
		_rank: 30,
		name: 'VIZ Design',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.PgmSchema,
		_rank: 30,
		name: 'Viz Schema',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		isHidden: true
	},
	{
		_id: SourceLayer.PgmDVEBackground,
		_rank: 40,
		name: 'DVE Background',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.PgmFullBackground,
		_rank: 41,
		name: 'GFX FULL Background',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.PgmSisyfosAdlibs,
		_rank: 50,
		name: 'Sisyfos (adlib)',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.WallGraphics,
		_rank: 60,
		name: 'GFX Wall',
		abbreviation: '',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: SharedSourceLayer.RobotCamera,
		_rank: 70,
		name: 'Robot Camera',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	}
]

// AUX group
const AUX: ISourceLayer[] = [
	{
		_id: SourceLayer.VizFullIn1,
		_rank: 10,
		name: 'Full Inp 1',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.AuxStudioScreen,
		_rank: 20,
		name: 'AUX studio screen',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isClearable: true,

		isSticky: false,

		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: SourceLayer.AuxMixMinus,
		_rank: 22,
		name: 'MixMinus AUX',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: false,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: false
	}
]

// SELECTED_ADLIB group
const SELECTED_ADLIB: ISourceLayer[] = [
	{
		_id: SourceLayer.SelectedServer,
		_rank: 0,
		name: 'Server (selected)',
		abbreviation: 'S',
		type: SourceLayerType.VT,
		exclusiveGroup: 'server',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: true,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SourceLayer.SelectedVoiceOver,
		_rank: 0,
		name: 'VO (selected)',
		abbreviation: 'VO',
		type: SourceLayerType.LIVE_SPEAK,
		exclusiveGroup: 'server',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: true,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: SharedSourceLayer.SelectedAdlibGraphicsFull,
		_rank: 0,
		name: 'GFX Full (selected)',
		abbreviation: 'GFX Full',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,

		isSticky: false,

		isQueueable: true,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: true
	}
]

export default literal<ISourceLayer[]>([
	...OVERLAY,
	...JINGLE,
	...PGM,
	...MUSIK,
	...MANUS,
	...SEC,
	...SELECTED_ADLIB,
	...AUX
])
