import {
	ClientActions,
	IBlueprintHotkeyTrigger,
	IBlueprintTriggeredActions,
	IGUIContextFilterLink,
	IRundownPlaylistActivateAction,
	PlayoutActions,
	SomeAction,
	TriggerType
} from '@tv2media/blueprints-integration'
import { literal, TRIGGER_HOTKEYS_ON_KEYUP } from 'tv2-common'

export interface RundownViewHotkeyAssignments {
	activate: string
	activateRehearsal: string
	deactivate: string
	take: string
	goToLiveLive: string
	rewindSegments: string
	resetRundown: string
	moveNextForward: string
	moveNextDown: string
	moveNextBack: string
	moveNextUp: string
	takeSnapshot: string
	queueNextMiniShelfAdLib: string
	queuePreviousMiniShelfAdLib: string
}

function rundownViewActionTriggerId(showStyleId: string, action: string) {
	return `${showStyleId}_rundown_view_${action}`
}

export function MakeRundownViewTriggers(
	showStyleId: string,
	assignments: RundownViewHotkeyAssignments,
	getNextRank: () => number
): IBlueprintTriggeredActions[] {
	return [
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'activate_rundown'),
			_rank: getNextRank(),
			name: 'Activate Rundown',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.activate
				})
			],
			actions: [
				literal<IRundownPlaylistActivateAction>({
					action: PlayoutActions.activateRundownPlaylist,
					rehearsal: false,
					force: true,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'activate_rundown_rehearsal'),
			_rank: getNextRank(),
			name: 'øve rundown',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.activateRehearsal,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<IRundownPlaylistActivateAction>({
					action: PlayoutActions.activateRundownPlaylist,
					rehearsal: true,
					force: true,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'deactivate_rundown'),
			_rank: getNextRank(),
			name: 'deaktivate rundown',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.deactivate,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: PlayoutActions.deactivateRundownPlaylist,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'take'),
			_rank: getNextRank(),
			name: 'Take',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.take,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: PlayoutActions.take,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'go_to_live'),
			_rank: getNextRank(),
			name: 'gå til aktiv linje',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.goToLiveLive,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: ClientActions.goToOnAirLine,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'rewind_segments'),
			_rank: getNextRank(),
			name: 'REW tidslinje',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.rewindSegments,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: ClientActions.rewindSegments,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'reset_rundown'),
			_rank: getNextRank(),
			name: 'Reload rundown',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.resetRundown,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: PlayoutActions.resetRundownPlaylist,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'move_next_forward'),
			_rank: getNextRank(),
			name: 'hist. højre SKIP',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.moveNextForward,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: PlayoutActions.moveNext,
					segments: 0,
					parts: 1,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'move_next_down'),
			_rank: getNextRank(),
			name: 'hist. ned SKIP',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.moveNextDown,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: PlayoutActions.moveNext,
					segments: 1,
					parts: 0,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'move_next_back'),
			_rank: getNextRank(),
			name: 'hist. venstre SKIP',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.moveNextBack,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: PlayoutActions.moveNext,
					segments: 0,
					parts: -1,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'move_next_up'),
			_rank: getNextRank(),
			name: 'hist. op SKIP',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.moveNextUp,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: PlayoutActions.moveNext,
					segments: -1,
					parts: 0,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'log_error'),
			_rank: getNextRank(),
			name: 'Take Snapshot',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.takeSnapshot,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: PlayoutActions.createSnapshotForDebug,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'queue_next_adlib'),
			_rank: getNextRank(),
			name: 'Queue Next AdLib',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.queueNextMiniShelfAdLib,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: ClientActions.miniShelfQueueAdLib,
					forward: true,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		}),
		literal<IBlueprintTriggeredActions>({
			_id: rundownViewActionTriggerId(showStyleId, 'queue_previous_adlib'),
			_rank: getNextRank(),
			name: 'Queue Previous AdLib',
			triggers: [
				literal<IBlueprintHotkeyTrigger>({
					type: TriggerType.hotkey,
					keys: assignments.queuePreviousMiniShelfAdLib,
					up: TRIGGER_HOTKEYS_ON_KEYUP
				})
			],
			actions: [
				literal<SomeAction>({
					action: ClientActions.miniShelfQueueAdLib,
					forward: false,
					filterChain: [
						literal<IGUIContextFilterLink>({
							object: 'view'
						})
					]
				})
			]
		})
	]
}
