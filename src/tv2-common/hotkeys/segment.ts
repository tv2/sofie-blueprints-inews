import {
	IAdLibFilterLink,
	IAdlibPlayoutAction,
	IBlueprintHotkeyTrigger,
	IBlueprintTriggeredActions,
	IGUIContextFilterLink,
	PlayoutActions,
	TriggerType
} from '@tv2media/blueprints-integration'
import { literal, TRIGGER_HOTKEYS_ON_KEYUP } from 'tv2-common'
import { AdlibTags, SharedSourceLayers } from 'tv2-constants'

export interface ActiveSegmentHotketAssignments {
	lowerThirds: string[]
}

function activeSegmentAdLibHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_graphics_${hotkeyType}_${index}`
}

export function MakeActiveSegmentTriggers(
	showStyleId: string,
	assignments: ActiveSegmentHotketAssignments,
	getNextRank: () => number
) {
	return assignments.lowerThirds.map((key, index) =>
		makeSegmentHotKey(
			SharedSourceLayers.PgmGraphicsLower,
			getNextRank,
			activeSegmentAdLibHotkeyId(showStyleId, SharedSourceLayers.PgmGraphicsLower, key, index),
			`Lower GFX AdLib ${index + 1}`,
			key,
			index
		)
	)
}

function makeSegmentHotKey(
	sourceLayerId: string,
	getNextRank: () => number,
	id: string,
	name: string,
	hotkey: string | undefined,
	pick: number
) {
	return literal<IBlueprintTriggeredActions>({
		_id: id,
		_rank: getNextRank(),
		name,
		triggers: hotkey
			? [
					literal<IBlueprintHotkeyTrigger>({
						type: TriggerType.hotkey,
						keys: hotkey,
						up: TRIGGER_HOTKEYS_ON_KEYUP
					})
			  ]
			: [],
		actions: [
			literal<IAdlibPlayoutAction>({
				action: PlayoutActions.adlib,
				filterChain: [
					literal<IGUIContextFilterLink>({
						object: 'view'
					}),
					literal<IAdLibFilterLink>({
						object: 'adLib',
						field: 'segment',
						value: 'current'
					}),
					literal<IAdLibFilterLink>({
						object: 'adLib',
						field: 'tag',
						value: [AdlibTags.ADLIB_FLOW_PRODUCER]
					}),
					literal<IAdLibFilterLink>({
						object: 'adLib',
						field: 'sourceLayerId',
						value: [sourceLayerId]
					}),
					literal<IAdLibFilterLink>({
						object: 'adLib',
						field: 'pick',
						value: pick
					})
				]
			})
		]
	})
}
