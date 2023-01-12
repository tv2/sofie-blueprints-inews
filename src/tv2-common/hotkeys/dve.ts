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

export interface DVEHotkeyAssignments {
	sommerfugl: string
	morbarn: string
	barnmor: string
	barnMorIpad: string
	'3split': string
	'3barnMor': string
	'2barnMor': string
}

function dveHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_dve_layout_${hotkeyType}_${index}`
}

export function MakeDVELayoutHotkeys(
	showStyleId: string,
	sourceLayerId: string,
	dveLayouts: string[],
	assignments: DVEHotkeyAssignments,
	getNextRank: () => number
) {
	return dveLayouts.map((layout, index) => {
		// Try to fetch the hotkey by name, otherwise we'll create a blank trigger for unknown layouts
		const hotkey = assignments[layout as keyof typeof assignments] as string | undefined

		return literal<IBlueprintTriggeredActions>({
			_id: dveHotkeyId(showStyleId, sourceLayerId, layout, index),
			_rank: getNextRank(),
			name: layout,
			triggers: hotkey
				? {
						[hotkey]: literal<IBlueprintHotkeyTrigger>({
							type: TriggerType.hotkey,
							keys: hotkey,
							up: TRIGGER_HOTKEYS_ON_KEYUP
						})
				  }
				: {},
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
							value: [AdlibTags.ADLIB_SELECT_DVE_LAYOUT, layout]
						}),
						literal<IAdLibFilterLink>({
							object: 'adLib',
							field: 'pick',
							value: 0
						})
					]
				})
			}
		})
	})
}
