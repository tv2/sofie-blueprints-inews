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
import { AdlibTags } from 'tv2-constants'

export interface SisyfosHotkeyAssignments {
	micsUp: string
	micsDown: string
}

function sisyfosHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_dve_layout_${hotkeyType}_${index}`
}

export function MakeSisyfosHotkeys(
	showStyleId: string,
	sourceLayerId: string,
	assignments: SisyfosHotkeyAssignments,
	getNextRank: () => number
) {
	return [
		makeSisyfosHotKey(
			sourceLayerId,
			getNextRank,
			sisyfosHotkeyId(showStyleId, sourceLayerId, 'mics_up', 0),
			'mics OP',
			assignments.micsUp,
			[AdlibTags.ADLIB_MICS_UP]
		),
		makeSisyfosHotKey(
			sourceLayerId,
			getNextRank,
			sisyfosHotkeyId(showStyleId, sourceLayerId, 'mics_down', 0),
			'mics NED',
			assignments.micsDown,
			[AdlibTags.ADLIB_MICS_DOWN]
		)
	]
}

function makeSisyfosHotKey(
	sourceLayerId: string,
	getNextRank: () => number,
	id: string,
	name: string,
	hotkey: string | undefined,
	tags: string[]
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
						value: tags
					}),
					literal<IAdLibFilterLink>({
						object: 'adLib',
						field: 'pick',
						value: 0
					})
				]
			})
		]
	})
}
