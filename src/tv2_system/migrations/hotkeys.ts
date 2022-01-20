import {
	ClientActions,
	IBlueprintTriggeredActions,
	MigrationContextShowStyle,
	MigrationStepShowStyle,
	PlayoutActions,
	TriggerType
} from '@tv2media/blueprints-integration'
import { literal } from 'tv2-common'

export function RemoveDefaultCoreShortcuts(versionStr: string) {
	const defaultTriggerIds = DEFAULT_CORE_TRIGGERS.map(trigger => trigger._id)

	return literal<MigrationStepShowStyle>({
		id: `${versionStr}.removeCoreDefaultTriggers`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			for (const coreTrigger of DEFAULT_CORE_TRIGGERS) {
				if (context.getTriggeredAction(coreTrigger._id)) {
					return true
				}
			}

			return false
		},
		migrate: (context: MigrationContextShowStyle) => {
			for (const trigger of defaultTriggerIds) {
				context.removeTriggeredAction(trigger)
			}
		}
	})
}

// copy-pasted from core migrations
const t = (text: string) => text
let j = 0
const DEFAULT_CORE_TRIGGERS: IBlueprintTriggeredActions[] = [
	{
		_id: 'toggleShelf',
		actions: [
			{
				action: ClientActions.shelf,
				filterChain: [
					{
						object: 'view'
					}
				],
				state: 'toggle'
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Tab',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Toggle Shelf')
	},
	{
		_id: 'activateRundownPlaylist',
		actions: [
			{
				action: PlayoutActions.activateRundownPlaylist,
				rehearsal: false,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Backquote',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Activate (On-Air)')
	},
	{
		_id: 'activateRundownPlaylist_rehearsal',
		actions: [
			{
				action: PlayoutActions.activateRundownPlaylist,
				rehearsal: true,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Control+Backquote',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Activate (Rehearsal)')
	},
	{
		_id: 'deactivateRundownPlaylist',
		actions: [
			{
				action: PlayoutActions.deactivateRundownPlaylist,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Control+Shift+Backquote',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Deactivate')
	},
	{
		_id: 'take',
		actions: [
			{
				action: PlayoutActions.take,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'NumpadEnter',
				up: true
			},
			{
				type: TriggerType.hotkey,
				keys: 'F12',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Take')
	},
	{
		_id: 'hold',
		actions: [
			{
				action: PlayoutActions.hold,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'KeyH',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Hold')
	},
	{
		_id: 'hold_undo',
		actions: [
			{
				action: PlayoutActions.hold,
				undo: true,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Shift+KeyH',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Undo Hold')
	},
	{
		_id: 'reset_rundown_playlist',
		actions: [
			{
				action: PlayoutActions.resetRundownPlaylist,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Control+Shift+F12',
				up: true
			},
			{
				type: TriggerType.hotkey,
				keys: 'Control+Shift+AnyEnter',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Reset Rundown')
	},
	{
		_id: 'disable_next_piece',
		actions: [
			{
				action: PlayoutActions.disableNextPiece,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'KeyG',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Disable the next element')
	},
	{
		_id: 'disable_next_piece_undo',
		actions: [
			{
				action: PlayoutActions.disableNextPiece,
				filterChain: [
					{
						object: 'view'
					}
				],
				undo: true
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Shift+KeyG',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Undo Disable the next element')
	},
	{
		_id: 'create_snapshot_for_debug',
		actions: [
			{
				action: PlayoutActions.createSnapshotForDebug,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Backspace',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Store Snapshot')
	},
	{
		_id: 'move_next_part',
		actions: [
			{
				action: PlayoutActions.moveNext,
				filterChain: [
					{
						object: 'view'
					}
				],
				parts: 1,
				segments: 0
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'F9',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Move Next forwards')
	},
	{
		_id: 'move_next_segment',
		actions: [
			{
				action: PlayoutActions.moveNext,
				filterChain: [
					{
						object: 'view'
					}
				],
				parts: 0,
				segments: 1
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'F10',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Move Next to the following segment')
	},
	{
		_id: 'move_previous_part',
		actions: [
			{
				action: PlayoutActions.moveNext,
				filterChain: [
					{
						object: 'view'
					}
				],
				parts: -1,
				segments: 0
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Shift+F9',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Move Next backwards')
	},
	{
		_id: 'move_previous_segment',
		actions: [
			{
				action: PlayoutActions.moveNext,
				filterChain: [
					{
						object: 'view'
					}
				],
				parts: 0,
				segments: -1
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Shift+F10',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Move Next to the previous segment')
	},
	{
		_id: 'go_to_onAir_line',
		actions: [
			{
				action: ClientActions.goToOnAirLine,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Control+Home',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Go to On Air line')
	},
	{
		_id: 'rewind_segments',
		actions: [
			{
				action: ClientActions.rewindSegments,
				filterChain: [
					{
						object: 'view'
					}
				]
			}
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: 'Shift+Home',
				up: true
			}
		],
		_rank: ++j * 1000,
		name: t('Rewind segments to start')
	}
]
