import { ISourceLayer, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import { OffTubeSourceLayer } from '../layers'

// OVERLAY group
const OVERLAY: ISourceLayer[] = [
	{
		_id: OffTubeSourceLayer.PgmGraphicsIdent,
		_rank: 10,
		name: 'Ident',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: OffTubeSourceLayer.PgmGraphicsIdentPersistent,
		_rank: 10,
		name: 'Ident Persistent',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: OffTubeSourceLayer.PgmGraphicsTop,
		_rank: 20,
		name: 'Top',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: OffTubeSourceLayer.PgmGraphicsLower,
		_rank: 30,
		name: 'Bund',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: OffTubeSourceLayer.PgmGraphicsHeadline,
		_rank: 40,
		name: 'Headline',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	}
]

// JINGLE group
const JINGLE: ISourceLayer[] = [
	{
		_id: OffTubeSourceLayer.PgmJingle,
		_rank: 10,
		name: 'Jingle',
		abbreviation: '',
		type: SourceLayerType.TRANSITION,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: ',',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	}
]

// PGM group
const PGM: ISourceLayer[] = [
	{
		_id: OffTubeSourceLayer.PgmSourceSelect,
		_rank: 0,
		name: 'Source Select',
		abbreviation: '',
		type: SourceLayerType.METADATA,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: OffTubeSourceLayer.PgmDVEBackground,
		_rank: 50,
		name: 'DVE Background',
		abbreviation: '',
		type: SourceLayerType.METADATA,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	},
	{
		_id: OffTubeSourceLayer.PgmContinuity,
		_rank: 50,
		name: 'CONTINUITY',
		abbreviation: 'CONTINUITY',
		type: SourceLayerType.METADATA,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	}
]

// SEC group
const SEC: ISourceLayer[] = []

// SELECTED_ADLIB group
const SELECTED_ADLIB: ISourceLayer[] = [
	{
		_id: OffTubeSourceLayer.SelectedAdLibDVE,
		_rank: 0,
		name: 'DVE',
		abbreviation: 'D',
		type: SourceLayerType.SPLITS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: OffTubeSourceLayer.SelectedAdLibServer,
		_rank: 0,
		name: 'Server',
		abbreviation: 'S',
		type: SourceLayerType.VT,
		exclusiveGroup: 'server',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: OffTubeSourceLayer.SelectedAdLibVoiceOver,
		_rank: 0,
		name: 'Voice Over',
		abbreviation: 'VO',
		type: SourceLayerType.LIVE_SPEAK,
		exclusiveGroup: 'server',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: OffTubeSourceLayer.SelectedAdlibGraphicsFull,
		_rank: 0,
		name: 'GFX Full',
		abbreviation: 'GFX Full',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	}
]

// AUX group
const AUX: ISourceLayer[] = [
	{
		_id: OffTubeSourceLayer.AuxStudioScreen,
		_rank: 20,
		name: 'Studio',
		abbreviation: '',
		type: SourceLayerType.UNKNOWN,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys:
			'shift+ctrl+1,shift+ctrl+2,shift+ctrl+3,shift+ctrl+4,shift+ctrl+5,shift+ctrl+6,shift+ctrl+7,shift+ctrl+8,shift+ctrl+9,shift+ctrl+0,shift+ctrl+e',
		clearKeyboardHotkey: ',',
		assignHotkeysToGlobalAdlibs: true,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: false
	}
]

export default literal<ISourceLayer[]>([...OVERLAY, ...JINGLE, ...PGM, ...SEC, ...SELECTED_ADLIB, ...AUX])
