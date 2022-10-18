import { ISourceLayer } from 'blueprints-integration'
import {
	GlobalHotkeySourceLayers,
	GlobalHotkeySources,
	MakeGlobalTriggers,
	MakeRundownViewTriggers,
	TV2Hotkeys
} from 'tv2-common'
import { MakeActiveSegmentTriggers } from './segment'

export * from './rundownView'
export * from './global'
export * from './hotkey-defaults'

export interface ISourceLayerWithHotKeys extends ISourceLayer {
	clearKeyboardHotkey?: string
	activateKeyboardHotkeys?: string
	assignHotkeysToGlobalAdlibs?: boolean
	activateStickyKeyboardHotkey?: string
}

export const TRIGGER_HOTKEYS_ON_KEYUP = true

export function MakeAllAdLibsTriggers(
	showStyleId: string,
	assignments: TV2Hotkeys,
	globalSources: GlobalHotkeySources,
	globalSourceLayers: GlobalHotkeySourceLayers
) {
	let rank = 1000
	const getNextRank = () => ++rank
	const rundownViewTriggers = MakeRundownViewTriggers(showStyleId, assignments.rundownView, getNextRank)
	rank = 2000
	const globalTriggers = MakeGlobalTriggers(
		showStyleId,
		assignments.global,
		globalSources,
		globalSourceLayers,
		getNextRank
	)
	rank = 3000
	const segmentTriggers = MakeActiveSegmentTriggers(showStyleId, assignments.activeSegment, getNextRank)

	return [...rundownViewTriggers, ...globalTriggers, ...segmentTriggers]
}
