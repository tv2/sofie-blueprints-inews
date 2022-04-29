import { IBlueprintTriggeredActions } from '@tv2media/blueprints-integration'
import { DVEBoxTriggers, MakeCutToBoxTrigger } from './helpers'

const SERVER_TO_BOX_1_HOTKEYS: string[] = ['Shift+KeyT']

const SERVER_TO_BOX_2_HOTKEYS: string[] = ['Ctrl+Alt+Shift+KeyG']

const SERVER_TO_BOX_3_HOTKEYS: string[] = []

const SERVER_TO_BOX_4_HOTKEYS: string[] = []

const CUT_TO_BOX_HOTKEYS: DVEBoxTriggers = [
	SERVER_TO_BOX_1_HOTKEYS,
	SERVER_TO_BOX_2_HOTKEYS,
	SERVER_TO_BOX_3_HOTKEYS,
	SERVER_TO_BOX_4_HOTKEYS
]

export interface ServerHotkeyAssignments {
	cutToBox: DVEBoxTriggers
}

function serverHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_server_${hotkeyType}_${index}`
}

function serverHotkeyName() {
	return `serv`
}

const SERVER_SOURCES = ['casparcg']

export function MakeServerHotkeys(
	showStyleId: string,
	sourceLayerId: string,
	getNextRank: () => number
): IBlueprintTriggeredActions[] {
	const cutToBoxHotkeys: IBlueprintTriggeredActions[] = []
	for (let currentSourceIndex = 0; currentSourceIndex < SERVER_SOURCES.length; currentSourceIndex++) {
		const name = serverHotkeyName()

		for (let box = 0; box < CUT_TO_BOX_HOTKEYS.length; box++) {
			if (CUT_TO_BOX_HOTKEYS[box].length) {
				const boxHotkey = CUT_TO_BOX_HOTKEYS[box][currentSourceIndex]
				cutToBoxHotkeys.push(
					MakeCutToBoxTrigger(
						serverHotkeyId(showStyleId, sourceLayerId, `cut_to_box_${box + 1}`, currentSourceIndex),
						getNextRank,
						name + ` inp ${box + 1}`,
						boxHotkey,
						sourceLayerId,
						false,
						currentSourceIndex,
						box
					)
				)
			}
		}
	}

	return cutToBoxHotkeys
}
