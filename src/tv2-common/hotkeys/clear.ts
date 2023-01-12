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

export type ClearLayerHotkeyAssignments = Array<{ sourceLayers: string[]; key: string; name: string }>

function clearSourceLayerHotKeyId(showStyleId: string, sourceLayers: string[]) {
	return `${showStyleId}_clear_sourcelayer_${sourceLayers.join(',')}`
}

export function MakeClearHotkeys(
	showStyleId: string,
	assignments: ClearLayerHotkeyAssignments,
	getNextRank: () => number
) {
	return assignments.map(clearedSourceLayer =>
		literal<IBlueprintTriggeredActions>({
			_id: clearSourceLayerHotKeyId(showStyleId, clearedSourceLayer.sourceLayers),
			_rank: getNextRank(),
			name: clearedSourceLayer.name,
			triggers: {
				[clearedSourceLayer.key]: literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: clearedSourceLayer.key,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			},
			actions: {
				adlibPlayoutAction: literal<IAdlibPlayoutAction>({
					action: PlayoutActions.adlib,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						}),
						literal<IAdLibFilterLink>({
							object: 'adLib',
							field: 'sourceLayerId',
							value: clearedSourceLayer.sourceLayers
						}),
						literal<IAdLibFilterLink>({
							object: 'adLib',
							field: 'type',
							value: 'clear'
						})
					]
				})
			}
		})
	)
}
