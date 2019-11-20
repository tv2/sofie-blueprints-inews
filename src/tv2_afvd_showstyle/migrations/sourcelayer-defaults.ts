import { ISourceLayer, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { SourceLayer } from '../layers'

// {
// 	_id: SourceLayer.PgmServer,
// 	_rank: 12000,
// 	name: 'Server',
// 	abbreviation: 'VT',
// 	type: SourceLayerType.VT,
// 	activateKeyboardHotkeys: 'f7,f8',
// 	onPGMClean: true,
// 	onPresenterScreen: true,
// 	unlimited: false,
// 	exclusiveGroup: 'fullscreen_pgm'
// },
// {
// 	_id: SourceLayer.PgmSlutord,
// 	_rank: 11900,
// 	name: 'Slutord',
// 	type: SourceLayerType.SCRIPT,
// 	onPGMClean: true,
// 	unlimited: false
// },
// {
// 	_id: SourceLayer.PgmVoiceOver,
// 	_rank: 11000,
// 	name: 'Voice Over',
// 	abbreviation: 'VO',
// 	type: SourceLayerType.LIVE_SPEAK,
// 	onPGMClean: true,
// 	unlimited: false
// },
// {
// 	_id: SourceLayer.PgmGraphics,
// 	_rank: 10000,
// 	name: 'Graphics',
// 	type: SourceLayerType.GRAPHICS,
// 	onPGMClean: false,
// 	activateKeyboardHotkeys: 'q,w,e,r,t,y',
// 	clearKeyboardHotkey: 'u,alt+j,alt+u',
// 	allowDisable: true,
// 	unlimited: false
// },
// {
// 	_id: SourceLayer.PgmGraphicsTLF,
// 	_rank: 9900,
// 	name: 'TLF',
// 	type: SourceLayerType.GRAPHICS,
// 	onPGMClean: true,
// 	activateKeyboardHotkeys: '',
// 	clearKeyboardHotkey: '',
// 	allowDisable: true,
// 	unlimited: false,
// 	isSticky: true,
// 	exclusiveGroup: 'fullscreen_pgm'
// },
// {
// 	_id: SourceLayer.PgmPilot,
// 	_rank: 9500,
// 	name: 'Graphics',
// 	type: SourceLayerType.GRAPHICS,
// 	onPGMClean: false,
// 	activateKeyboardHotkeys: 'q,w,e,r,t,y',
// 	clearKeyboardHotkey: 'u,alt+j,alt+u',
// 	allowDisable: true,
// 	unlimited: false
// },
// {
// 	_id: SourceLayer.PgmAdlibViz,
// 	_rank: 9400,
// 	name: 'Viz AdLibs',
// 	type: SourceLayerType.GRAPHICS,
// 	onPGMClean: false,
// 	activateKeyboardHotkeys: '',
// 	clearKeyboardHotkey: '',
// 	allowDisable: true,
// 	unlimited: false
// },
// {
// 	_id: SourceLayer.PgmJingle,
// 	_rank: 9000,
// 	name: 'Jingle',
// 	type: SourceLayerType.VT,
// 	onPGMClean: true,
// 	activateKeyboardHotkeys: '',
// 	assignHotkeysToGlobalAdlibs: false,
// 	unlimited: false
// },
// {
// 	_id: SourceLayer.PgmLive,
// 	_rank: 8000,
// 	name: 'Live',
// 	type: SourceLayerType.REMOTE,
// 	onPGMClean: true,
// 	activateKeyboardHotkeys: '1,2,3,4,5,6',
// 	isRemoteInput: true,
// 	assignHotkeysToGlobalAdlibs: true,
// 	isSticky: true,
// 	activateStickyKeyboardHotkey: 'f5',
// 	onPresenterScreen: true,
// 	unlimited: false,
// 	exclusiveGroup: 'fullscreen_pgm'
// },
// {
// 	_id: SourceLayer.PgmDVE,
// 	_rank: 7000,
// 	name: 'DVE',
// 	type: SourceLayerType.SPLITS,
// 	onPGMClean: true,
// 	isSticky: true,
// 	activateStickyKeyboardHotkey: 'f6',
// 	onPresenterScreen: true,
// 	unlimited: false,
// 	exclusiveGroup: 'fullscreen_pgm'
// },
// {
// 	_id: SourceLayer.PgmDVEBackground,
// 	_rank: 7500,
// 	name: 'DVE Background',
// 	type: SourceLayerType.GRAPHICS,
// 	onPGMClean: false,
// 	activateKeyboardHotkeys: '',
// 	clearKeyboardHotkey: '',
// 	allowDisable: true,
// 	unlimited: false
// },
// {
// 	_id: SourceLayer.PgmDesign,
// 	_rank: 7500,
// 	name: 'VIZ Design',
// 	type: SourceLayerType.GRAPHICS,
// 	onPGMClean: false,
// 	activateKeyboardHotkeys: '',
// 	clearKeyboardHotkey: '',
// 	allowDisable: true,
// 	unlimited: false
// },
// {
// 	_id: SourceLayer.PgmBreak,
// 	_rank: 5000,
// 	name: 'Break',
// 	type: SourceLayerType.VT,
// 	onPGMClean: true,
// 	unlimited: false
// },
// {
// 	_id: SourceLayer.PgmScript,
// 	_rank: 4000,
// 	name: 'Script',
// 	type: SourceLayerType.SCRIPT,
// 	onPGMClean: true,
// 	unlimited: false
// },
// {
// 	_id: SourceLayer.PgmVIZ,
// 	_rank: 3000,
// 	name: 'VIZ',
// 	type: SourceLayerType.GRAPHICS,
// 	onPGMClean: false,
// 	unlimited: false,
// 	isHidden: true
// },
// {
// 	_id: SourceLayer.PgmAudioBed,
// 	_rank: 0,
// 	name: 'Bed',
// 	type: SourceLayerType.AUDIO,
// 	onPGMClean: true,
// 	activateKeyboardHotkeys: '',
// 	assignHotkeysToGlobalAdlibs: false,
// 	unlimited: false,
// 	isHidden: true
// }

const protoitem: ISourceLayer =
{
    _id: '',
    _rank: 0,
    name: '',
    abbreviation: '',
    type: SourceLayerType.,
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

// KEY group
const KEY: ISourceLayer[] = [
	{
		_id: 'SourLayer.studio0_graphicsIdent',
		_rank: 10,
		name: 'Ident',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: 'q,alt+a',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: 'SourLayer.studio0_graphicsTop',
		_rank: 20,
		name: 'Top',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: 'q,alt+s',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: 'SourLayer.studio0_graphicsLower',
		_rank: 30,
		name: '',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: 'q,alt+d',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: 'SourLayer.studio0_graphicsHeadline',
		_rank: 40,
		name: '',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: 'q,alt+f',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
	{
		_id: 'SourLayer.studio0_graphicsTema',
		_rank: 50,
		name: '',
		abbreviation: 'G',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: '',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: 'q,alt+g',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: true,
		onPresenterScreen: false
	},
]

// PGM group
const PGM1: ISourceLayer[] = [
]

// PGM group
const PGM2: ISourceLayer[] = [
	{
		_id: 'SourceLayer.PgmCam',
		_rank: 0,
		name: 'Kam',
		abbreviation: 'K',
		type: SourceLayerType.CAMERA,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: 'F1,F2,F3,F4,F5',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: true,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: 'SourceLayer.PgmLive', // @todo: should queue by default
		_rank: 0,
		name: 'Live',
		abbreviation: 'L',
		type: SourceLayerType.REMOTE,
		exclusiveGroup: 'me1',
		isRemoteInput: true,
		isGuestInput: false,
		activateKeyboardHotkeys: '1,2,3,4,5,6,7,8,9,0',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: true,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: 'SourceLayer.studio0_dev0', // @todo: should queue by default
		_rank: 0,
		name: 'DVE',
		abbreviation: 'D',
		type: SourceLayerType.SPLITS,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: true,
		activateStickyKeyboardHotkey: 'F10',
		isQueueable: true,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: 'SourceLayer.studio0_clip0',
		_rank: 0,
		name: 'Server',
		abbreviation: 'S',
		type: SourceLayerType.VT
		exclusiveGroup: 'me1',
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
		_id: 'SourceLayer.studio0_voiceover0',
		_rank: 0,
		name: 'Voice Over',
		abbreviation: 'VO',
		type: SourceLayerType.LIVE_SPEAK,
		exclusiveGroup: 'me1',
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
		_id: 'SourceLayer.studio0_pilot0',
		_rank: 0,
		name: 'Full',
		abbreviation: 'F',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: 'me1',
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
		_id: 'SourceLayer.studio0_graphics1',
		_rank: 0,
		name: 'Telefon',
		abbreviation: 'TLF',
		type: SourceLayerType.GRAPHICS,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: 'I',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: true,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
	{
		_id: 'SourceLayer.studio0_delayed0',
		_rank: 0,
		name: 'EVS',
		abbreviation: 'EVS',
		type: SourceLayerType.VT,
		exclusiveGroup: 'me1',
		isRemoteInput: false,
		isGuestInput: false,
		activateKeyboardHotkeys: 'E',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: true,
		isHidden: false,
		allowDisable: false,
		onPresenterScreen: true
	},
]

// PGM group
const PGM3: ISourceLayer[] = [
]

// SEC group
const SEC: ISourceLayer[] = []

// AUX group
const AUX: ISourceLayer[] = []

export default literal<ISourceLayer[]>([...KEY, ...PGM1, ...PGM2, ...PGM3, ...SEC, ...AUX])
