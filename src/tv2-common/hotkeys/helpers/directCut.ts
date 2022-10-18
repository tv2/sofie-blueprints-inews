import {
	IAdLibFilterLink,
	IAdlibPlayoutAction,
	IBlueprintHotkeyTrigger,
	IBlueprintTriggeredActions,
	IGUIContextFilterLink,
	PlayoutActions,
	TriggerType
} from 'blueprints-integration'
import { literal, TRIGGER_HOTKEYS_ON_KEYUP } from 'tv2-common'
import { AdlibTags } from 'tv2-constants'

export function MakeDirectCutTrigger(
	id: string,
	getNextRank: () => number,
	name: string,
	hotkey: string | undefined,
	sourceLayerId: string,
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
			: [], // Not enough known hotkeys -> create a blank trigger as a placeholder to be assigned later
		actions: [
			literal<IAdlibPlayoutAction>({
				action: PlayoutActions.adlib,
				filterChain: [
					literal<IGUIContextFilterLink>({
						object: 'view'
					}),
					literal<IAdLibFilterLink>({
						object: 'adLib',
						field: 'sourceLayerId',
						value: [sourceLayerId]
					}),
					literal<IAdLibFilterLink>({
						object: 'adLib',
						field: 'global',
						value: true
					}),
					literal<IAdLibFilterLink>({
						object: 'adLib',
						field: 'tag',
						value: [AdlibTags.ADLIB_CUT_DIRECT]
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
