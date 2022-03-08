import { SharedSourceLayers } from 'tv2-constants'
import { literal } from '../util'
import { GlobalHotkeyAssignments } from './global'
import { RundownViewHotkeyAssignments } from './rundownView'
import { ActiveSegmentHotketAssignments } from './segment'

export interface TV2Hotkeys {
	activeSegment: ActiveSegmentHotketAssignments
	global: GlobalHotkeyAssignments
	rundownView: RundownViewHotkeyAssignments
}

export const defaultHotkeys: TV2Hotkeys = {
	activeSegment: literal<ActiveSegmentHotketAssignments>({
		lowerThirds: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG']
	}),
	global: literal<GlobalHotkeyAssignments>({
		recallLast: {
			DVE: 'F10',
			Live: 'Ctrl+Alt+Shift+KeyB'
		},
		takeWithTransition: ['NumpadDivide', 'NumpadSubtract', 'NumpadAdd'],
		camera: {
			directCut: ['F1', 'F2', 'F3', 'F4', 'F5'],
			queue: ['Ctrl+Shift+F1', 'Ctrl+Shift+F2', 'Ctrl+Shift+F3', 'Ctrl+Shift+F4', 'Ctrl+Shift+F5'],
			cutToBox: [
				['Shift+F1', 'Shift+F2', 'Shift+F3', 'Shift+F4', 'Shift+F5'],
				['Ctrl+F1', 'Ctrl+F2', 'Ctrl+F3', 'Ctrl+Alt+Shift+KeyA', 'Ctrl+F5'],
				['Shift+Alt+F1', 'Shift+Alt+F2', 'Shift+Alt+F3', 'Shift+Alt+F4', 'Shift+Alt+F5'],
				[]
			],
			routeToStudioScreen: [],
			routeToGraphicsEngine: []
		},
		clear: [
			{
				sourceLayers: [
					SharedSourceLayers.PgmGraphicsIdent,
					SharedSourceLayers.PgmGraphicsIdentPersistent,
					SharedSourceLayers.PgmGraphicsTop,
					SharedSourceLayers.PgmGraphicsLower,
					SharedSourceLayers.PgmGraphicsHeadline,
					SharedSourceLayers.PgmGraphicsTema,
					SharedSourceLayers.PgmGraphicsOverlay,
					SharedSourceLayers.PgmPilotOverlay,
					SharedSourceLayers.PgmGraphicsTLF
				],
				key: 'KeyQ',
				name: 'overlay ALT UD'
			},
			{
				sourceLayers: [SharedSourceLayers.PgmGraphicsIdent, SharedSourceLayers.PgmGraphicsIdentPersistent],
				key: 'Ctrl+Shift+KeyA',
				name: 'ovl: ident OUT'
			},
			{
				sourceLayers: [SharedSourceLayers.PgmGraphicsTop],
				key: 'Ctrl+Shift+KeyS',
				name: 'ovl: top OUT'
			},
			{
				sourceLayers: [SharedSourceLayers.PgmGraphicsLower],
				key: 'Ctrl+Shift+KeyD',
				name: 'ovl:lower OUT'
			},
			{
				sourceLayers: [SharedSourceLayers.PgmGraphicsHeadline],
				key: 'Ctrl+Shift+KeyF',
				name: 'ovl: headline OUT'
			},
			{
				sourceLayers: [SharedSourceLayers.PgmGraphicsTema],
				key: 'Ctrl+Shift+KeyG',
				name: 'ovl: tema OUT'
			},
			{
				sourceLayers: [SharedSourceLayers.PgmAudioBed],
				key: 'Minus',
				name: 'STOP soundpl.'
			}
		],
		dve: {
			sommerfugl: 'KeyM',
			morbarn: 'Comma',
			barnmor: 'Period',
			barnMorIpad: 'KeyN',
			'3split': 'KeyC',
			'3barnMor': 'KeyB',
			'2barnMor': 'KeyV'
		},
		graphics: {
			altud: 'KeyQ',
			designSc: 'Shift+KeyA',
			gfxContinue: 'Space'
		},
		local: {
			fullAudio: {
				directCut: [],
				queue: ['KeyR', 'KeyI'],
				cutToBox: [['Shift+KeyE', 'Shift+KeyI'], ['Ctrl+KeyE', 'Ctrl+KeyI'], ['Alt+Shift+KeyE', 'Alt+Shift+KeyG'], []],
				routeToStudioScreen: ['Shift+Ctrl+KeyE'],
				routeToGraphicsEngine: ['Ctrl+Alt+Shift+KeyF']
			},
			voAudio: {
				directCut: [],
				queue: ['KeyE', 'KeyU'],
				cutToBox: [['Shift+KeyD', 'Shift+KeyU'], ['Ctrl+KeyD', 'Ctrl+Alt+Shift+KeyI'], ['Alt+Shift+KeyD'], []],
				routeToGraphicsEngine: [],
				routeToStudioScreen: []
			}
		},
		remote: {
			directCut: [],
			queue: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'],
			cutToBox: [
				[
					'Shift+Digit1',
					'Shift+Digit2',
					'Shift+Digit3',
					'Shift+Digit4',
					'Shift+Digit5',
					'Shift+Digit6',
					'Shift+Digit7',
					'Shift+Digit8',
					'Shift+Digit9',
					'Shift+Digit0'
				],
				[
					'Ctrl+Digit1',
					'Ctrl+Digit2',
					'Ctrl+Digit3',
					'Ctrl+Digit4',
					'Ctrl+Digit5',
					'Ctrl+Digit6',
					'Ctrl+Digit7',
					'Ctrl+Digit8',
					'Ctrl+Digit9',
					'Ctrl+Digit0'
				],
				[
					'Shift+Alt+Digit1',
					'Shift+Alt+Digit2',
					'Shift+Alt+Digit3',
					'Shift+Alt+Digit4',
					'Shift+Alt+Digit5',
					'Shift+Alt+Digit6',
					'Shift+Alt+Digit7',
					'Shift+Alt+Digit8',
					'Shift+Alt+Digit9',
					'Shift+Alt+Digit0'
				],
				[]
			],
			routeToStudioScreen: [],
			routeToGraphicsEngine: []
		},
		feed: {
			directCut: [],
			queue: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'],
			cutToBox: [
				[
					'Shift+Digit1',
					'Shift+Digit2',
					'Shift+Digit3',
					'Shift+Digit4',
					'Shift+Digit5',
					'Shift+Digit6',
					'Shift+Digit7',
					'Shift+Digit8',
					'Shift+Digit9',
					'Shift+Digit0'
				],
				[
					'Ctrl+Digit1',
					'Ctrl+Digit2',
					'Ctrl+Digit3',
					'Ctrl+Digit4',
					'Ctrl+Digit5',
					'Ctrl+Digit6',
					'Ctrl+Digit7',
					'Ctrl+Digit8',
					'Ctrl+Digit9',
					'Ctrl+Digit0'
				],
				[
					'Shift+Alt+Digit1',
					'Shift+Alt+Digit2',
					'Shift+Alt+Digit3',
					'Shift+Alt+Digit4',
					'Shift+Alt+Digit5',
					'Shift+Alt+Digit6',
					'Shift+Alt+Digit7',
					'Shift+Alt+Digit8',
					'Shift+Alt+Digit9',
					'Shift+Alt+Digit0'
				],
				[]
			],
			routeToStudioScreen: [],
			routeToGraphicsEngine: []
		},
		server: {
			cutToBox: [['Shift+KeyT'], ['Ctrl+Alt+Shift+KeyG'], [], []]
		},
		sisyfos: {
			micsUp: 'Ctrl+Alt+Shift+KeyE',
			micsDown: 'Ctrl+Alt+Shift+KeyD'
		}
	}),
	rundownView: literal<RundownViewHotkeyAssignments>({
		activate: 'Backquote',
		activateRehearsal: 'Ctrl+Backquote',
		deactivate: 'Ctrl+Shift+Backquote',
		take: 'AnyEnter',
		goToLiveLive: 'Shift+Home',
		rewindSegments: 'Ctrl+Home',
		resetRundown: 'Shift+Escape',
		moveNextForward: 'Shift+ArrowRight',
		moveNextDown: 'Shift+ArrowDown',
		moveNextBack: 'Shift+ArrowLeft',
		moveNextUp: 'Shift+ArrowUp',
		takeSnapshot: 'Shift+Backspace',
		queueNextMiniShelfAdLib: 'Tab',
		queuePreviousMiniShelfAdLib: 'Shift+Tab'
	})
}
