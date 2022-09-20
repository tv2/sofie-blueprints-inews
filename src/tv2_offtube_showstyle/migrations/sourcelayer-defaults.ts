import { ISourceLayer, SourceLayerType } from '@tv2media/blueprints-integration'
import { GetDSKSourceLayerDefaults, literal } from 'tv2-common'
import { SharedSourceLayers } from 'tv2-constants'
import { ATEMModel } from '../../types/atem'
import { OfftubeSourceLayer } from '../layers'

// OVERLAY group
const OVERLAY: ISourceLayer[] = [
	{
		_id: OfftubeSourceLayer.PgmGraphicsIdent,
		_rank: 10,
		name: 'GFX Ident',
		abbreviation: 'G',
		type: SourceLayerType.LOWER_THIRD,
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
		_id: OfftubeSourceLayer.PgmGraphicsTop,
		_rank: 20,
		name: 'GFX Top',
		abbreviation: 'G',
		type: SourceLayerType.LOWER_THIRD,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isSticky: false,
		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: OfftubeSourceLayer.PgmGraphicsLower,
		_rank: 30,
		name: 'GFX Lowerthirds',
		abbreviation: 'G',
		type: SourceLayerType.LOWER_THIRD,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isSticky: false,
		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: OfftubeSourceLayer.PgmGraphicsHeadline,
		_rank: 40,
		name: 'GFX Headline',
		abbreviation: 'G',
		type: SourceLayerType.LOWER_THIRD,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isSticky: false,
		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: OfftubeSourceLayer.PgmGraphicsOverlay,
		_rank: 50,
		name: 'GFX Overlay (fallback)',
		abbreviation: 'O',
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
		_id: OfftubeSourceLayer.PgmGraphicsTLF,
		_rank: 60,
		name: 'GFX Telefon',
		abbreviation: 'TLF',
		type: SourceLayerType.LOWER_THIRD,
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
		_id: OfftubeSourceLayer.PgmGraphicsTema,
		_rank: 70,
		name: 'GFX Tema',
		abbreviation: 'T',
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
		_id: OfftubeSourceLayer.WallGraphics,
		_rank: 80,
		name: 'GFX Wall',
		abbreviation: 'Wall',
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
		_id: SharedSourceLayers.PgmPilotOverlay,
		_rank: 60,
		name: 'GFX overlay (VCP)(shared)',
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
	}
]

// JINGLE group
const JINGLE: ISourceLayer[] = [
	{
		_id: OfftubeSourceLayer.PgmJingle,
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
		_id: OfftubeSourceLayer.PgmCam,
		_rank: 0,
		name: 'Camera',
		abbreviation: 'K',
		type: SourceLayerType.CAMERA,
		exclusiveGroup: 'me2',
		isRemoteInput: false,
		isGuestInput: false,
		isSticky: false,
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: OfftubeSourceLayer.PgmLive,
		_rank: 0,
		name: 'Live',
		abbreviation: 'L',
		type: SourceLayerType.REMOTE,
		exclusiveGroup: 'me2',
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
		_id: OfftubeSourceLayer.PgmDVE,
		_rank: 0,
		name: 'DVE',
		abbreviation: 'D',
		type: SourceLayerType.SPLITS,
		exclusiveGroup: 'me2',
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
		_id: OfftubeSourceLayer.PgmDVEAdLib,
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
		_id: OfftubeSourceLayer.PgmServer,
		_rank: 0,
		name: 'Server',
		abbreviation: 'S',
		type: SourceLayerType.VT,
		exclusiveGroup: 'me2',
		isRemoteInput: false,
		isGuestInput: false,
		isSticky: false,
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: OfftubeSourceLayer.PgmVoiceOver,
		_rank: 0,
		name: 'VO',
		abbreviation: 'VO',
		type: SourceLayerType.LIVE_SPEAK,
		exclusiveGroup: 'me2',
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
		_id: OfftubeSourceLayer.PgmPilot,
		_rank: 0,
		name: 'GFX FULL (VCP)',
		abbreviation: 'Full',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: 'me2',
		isRemoteInput: false,
		isGuestInput: false,
		isSticky: false,
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: OfftubeSourceLayer.PgmDVEBackground,
		_rank: 50,
		name: 'DVE Background',
		abbreviation: '',
		type: SourceLayerType.METADATA,
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
		_id: OfftubeSourceLayer.PgmContinuity,
		_rank: 50,
		name: 'Continuity',
		abbreviation: 'CONTINUITY',
		type: SourceLayerType.METADATA,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isSticky: false,
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	...GetDSKSourceLayerDefaults(ATEMModel.PRODUCTION_STUDIO_4K_2ME)
]

// MUSIK group
const MUSIK: ISourceLayer[] = [
	{
		_id: SharedSourceLayers.PgmAudioBed,
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
		_id: OfftubeSourceLayer.PgmScript,
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
		_id: OfftubeSourceLayer.PgmAdlibGraphicCmd,
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
	{
		_id: OfftubeSourceLayer.PgmDesign,
		_rank: 30,
		name: 'GFX Design',
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
		_id: OfftubeSourceLayer.PgmSisyfosAdlibs,
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
		_id: OfftubeSourceLayer.PgmAdlibJingle,
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
	}
]

// SELECTED_ADLIB group
const SELECTED_ADLIB: ISourceLayer[] = [
	{
		_id: OfftubeSourceLayer.SelectedAdLibDVE,
		_rank: 0,
		name: 'DVE (selected)',
		abbreviation: 'D',
		type: SourceLayerType.SPLITS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		isSticky: false,
		isQueueable: true,
		isHidden: true,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: OfftubeSourceLayer.SelectedServer,
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
		_id: OfftubeSourceLayer.SelectedVoiceOver,
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
		_id: OfftubeSourceLayer.SelectedAdlibGraphicsFull,
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
	},
	{
		_id: OfftubeSourceLayer.SelectedAdlibJingle,
		_rank: 0,
		name: 'Jingle (selected)',
		abbreviation: 'Jingle',
		type: SourceLayerType.TRANSITION,
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

// AUX group
const AUX: ISourceLayer[] = [
	{
		_id: OfftubeSourceLayer.AuxStudioScreen,
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
		_id: OfftubeSourceLayer.AuxPgmClean,
		_rank: 21,
		name: 'Pgm Clean',
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
		_id: OfftubeSourceLayer.AuxMixMinus,
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
