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

export interface GraphicsHotkeyAssignemnts {
	altud: string
	designSc: string
	gfxContinue: string
}

function graphicsHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_graphics_${hotkeyType}_${index}`
}

export function MakeGraphicsHotkeys(
	showStyleId: string,
	sourceLayerId: string,
	assignments: GraphicsHotkeyAssignemnts,
	getNextRank: () => number
) {
	return [
		makeGraphicsGlobalHotKey(
			sourceLayerId,
			getNextRank,
			graphicsHotkeyId(showStyleId, sourceLayerId, 'alt_ud', 0),
			'overlay ALT UD',
			assignments.altud,
			[AdlibTags.ADLIB_GFX_ALTUD]
		),
		makeGraphicsGlobalHotKey(
			sourceLayerId,
			getNextRank,
			graphicsHotkeyId(showStyleId, sourceLayerId, 'design_sc', 0),
			'Design Style SC',
			assignments.designSc,
			[AdlibTags.ADLIB_DESIGN_STYLE_SC]
		),
		makeGraphicsGlobalHotKey(
			sourceLayerId,
			getNextRank,
			graphicsHotkeyId(showStyleId, sourceLayerId, 'gfx_continue', 0),
			'GFX Continue',
			assignments.gfxContinue,
			[AdlibTags.ADLIB_GFX_CONTINUE_FORWARD]
		)
	]
}

function makeGraphicsGlobalHotKey(
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
