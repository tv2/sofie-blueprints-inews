import { IBlueprintTriggeredActions } from 'blueprints-integration'
import { MakeRouteToGraphicsEngineTrigger } from './auxGraphics'
import { MakeRouteToStudioScreenTrigger } from './auxStudioScreen'
import { MakeCutToBoxTrigger } from './cutToBox'
import { MakeDirectCutTrigger } from './directCut'
import { MakeQueueTrigger } from './queue'

export interface SourceHotkeyTriggers {
	directCut: string[]
	queue: string[]
	cutToBox: DVEBoxTriggers
	routeToStudioScreen: string[]
	routeToGraphicsEngine: string[]
}

export type DVEBoxTriggers = [string[], string[], string[], string[]]

export function MakeStudioSourceHotkeys(
	showStyleId: string,
	sourceLayerId: string,
	sources: string[],
	hotkeys: SourceHotkeyTriggers,
	getNextRank: () => number,
	nameFunc: (source: string) => string,
	idFunc: (showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) => string,
	tags: string[] = []
): IBlueprintTriggeredActions[] {
	const directCutHotkeys: IBlueprintTriggeredActions[] = []
	const queueHotkeys: IBlueprintTriggeredActions[] = []
	const cutToBoxHotkeys: IBlueprintTriggeredActions[] = []
	const toAuxStudioScreenHotkeys: IBlueprintTriggeredActions[] = []
	const toAuxGraphicsEngineHotkeys: IBlueprintTriggeredActions[] = []

	for (const [currentSourceIndex, source] of sources.entries()) {
		const name = nameFunc(source)

		// If any are assigned, assign all
		if (hotkeys.directCut.length) {
			const directHotkey = hotkeys.directCut[currentSourceIndex]
			directCutHotkeys.push(
				MakeDirectCutTrigger(
					idFunc(showStyleId, sourceLayerId, 'cut_direct', currentSourceIndex),
					getNextRank,
					name,
					directHotkey,
					sourceLayerId,
					currentSourceIndex
				)
			)
		}

		if (hotkeys.queue.length) {
			const queueHotkey = hotkeys.queue[currentSourceIndex]
			queueHotkeys.push(
				MakeQueueTrigger(
					idFunc(showStyleId, sourceLayerId, 'queue', currentSourceIndex),
					getNextRank,
					name,
					queueHotkey,
					sourceLayerId,
					tags,
					currentSourceIndex
				)
			)
		}

		for (let box = 0; box < hotkeys.cutToBox.length; box++) {
			if (hotkeys.cutToBox[box].length) {
				const boxHotkey = hotkeys.cutToBox[box][currentSourceIndex]
				cutToBoxHotkeys.push(
					MakeCutToBoxTrigger(
						idFunc(showStyleId, sourceLayerId, `cut_to_box_${box + 1}`, currentSourceIndex),
						getNextRank,
						name + ` inp ${box + 1}`,
						boxHotkey,
						sourceLayerId,
						tags,
						currentSourceIndex,
						box
					)
				)
			}
		}

		if (hotkeys.routeToStudioScreen.length) {
			const toStudioScreenHotkey = hotkeys.routeToStudioScreen[currentSourceIndex]
			toAuxStudioScreenHotkeys.push(
				MakeRouteToStudioScreenTrigger(
					idFunc(showStyleId, sourceLayerId, `studio_screen`, currentSourceIndex),
					getNextRank,
					name + ` til SS`,
					toStudioScreenHotkey,
					sourceLayerId,
					currentSourceIndex
				)
			)
		}

		if (hotkeys.routeToGraphicsEngine.length) {
			const toGraphicsEngineHotkey = hotkeys.routeToGraphicsEngine[currentSourceIndex]
			toAuxGraphicsEngineHotkeys.push(
				MakeRouteToGraphicsEngineTrigger(
					idFunc(showStyleId, sourceLayerId, `graphics_engine`, currentSourceIndex),
					getNextRank,
					name,
					toGraphicsEngineHotkey,
					sourceLayerId,
					currentSourceIndex
				)
			)
		}
	}

	return [
		...directCutHotkeys,
		...queueHotkeys,
		...cutToBoxHotkeys,
		...toAuxStudioScreenHotkeys,
		...toAuxGraphicsEngineHotkeys
	]
}
