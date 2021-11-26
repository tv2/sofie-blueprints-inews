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
import { CameraHotkeyAssignments, MakeCameraHotkeys } from './camera'
import { ClearLayerHotkeyAssignments, MakeClearHotkeys } from './clear'
import { DVEHotkeyAssignments, MakeDVELayoutHotkeys } from './dve'
import { GraphicsHotkeyAssignemnts, MakeGraphicsHotkeys } from './graphics'
import { LocalSourceHotkeyAssignments, MakeLocalSourceHotkeys } from './local'
import { MakeRemoteHotkeys, RemoteSourceHotkeyAssignments } from './remote'
import { MakeServerHotkeys, ServerHotkeyAssignments } from './server'
import { MakeSisyfosHotkeys, SisyfosHotkeyAssignments } from './sisyfos'

export interface GlobalHotkeyAssignments {
	recallLast: {
		DVE: string
		Live: string
	}
	takeWithTransition: string[]
	camera: CameraHotkeyAssignments
	clear: ClearLayerHotkeyAssignments
	dve: DVEHotkeyAssignments
	graphics: GraphicsHotkeyAssignemnts
	local: LocalSourceHotkeyAssignments
	remote: RemoteSourceHotkeyAssignments
	feed: RemoteSourceHotkeyAssignments
	server: ServerHotkeyAssignments
	sisyfos: SisyfosHotkeyAssignments
}

export interface GlobalHotkeySourceLayers {
	local?: string
}

export interface GlobalHotkeySources {
	camera: string[]
	remote: string[]
	feed: string[]
	local: string[]
	dveLayouts: string[]
}

export function MakeGlobalTriggers(
	showStyleId: string,
	assignments: GlobalHotkeyAssignments,
	sources: GlobalHotkeySources,
	layers: GlobalHotkeySourceLayers,
	getNextRank: () => number
): IBlueprintTriggeredActions[] {
	const cameraTriggers = MakeCameraHotkeys(
		showStyleId,
		SharedSourceLayers.PgmCam,
		sources.camera,
		assignments.camera,
		getNextRank
	)
	const remoteTriggers = MakeRemoteHotkeys(
		showStyleId,
		SharedSourceLayers.PgmLive,
		sources.remote,
		assignments.remote,
		getNextRank
	)
	const feedTriggers = MakeRemoteHotkeys(
		showStyleId,
		SharedSourceLayers.PgmLive,
		sources.feed,
		assignments.feed,
		getNextRank
	)
	const localTriggers = layers.local
		? MakeLocalSourceHotkeys(showStyleId, layers.local, sources.local, assignments.local, getNextRank)
		: []

	const dveTriggers = MakeDVELayoutHotkeys(
		showStyleId,
		SharedSourceLayers.PgmDVEAdLib,
		sources.dveLayouts,
		assignments.dve,
		getNextRank
	)
	const serverTriggers = MakeServerHotkeys(showStyleId, SharedSourceLayers.PgmServer, getNextRank)
	const graphicsTriggers = MakeGraphicsHotkeys(
		showStyleId,
		SharedSourceLayers.PgmAdlibGraphicCmd,
		assignments.graphics,
		getNextRank
	)

	const clearTriggers = MakeClearHotkeys(showStyleId, assignments.clear, getNextRank)
	const sisyfosTriggers = MakeSisyfosHotkeys(
		showStyleId,
		SharedSourceLayers.PgmSisyfosAdlibs,
		assignments.sisyfos,
		getNextRank
	)
	const recallLastTriggers = [
		makeRecallLastTrigger(
			SharedSourceLayers.PgmDVE,
			getNextRank,
			recallLastHotkeyId(showStyleId, SharedSourceLayers.PgmDVE, 'dve', 0),
			'Last DVE',
			assignments.recallLast.DVE,
			[AdlibTags.ADLIB_RECALL_LAST_DVE]
		),
		makeRecallLastTrigger(
			SharedSourceLayers.PgmLive,
			getNextRank,
			recallLastHotkeyId(showStyleId, SharedSourceLayers.PgmLive, 'live', 0),
			'Last Live',
			assignments.recallLast.DVE,
			[AdlibTags.ADLIB_RECALL_LAST_LIVE]
		)
	]
	const takeWithTransitionTriggers = assignments.takeWithTransition.map((key, index) =>
		makeTakeWithTransitionTrigger(
			SharedSourceLayers.PgmAdlibJingle,
			getNextRank,
			takeWithTransitionHotkeyId(showStyleId, SharedSourceLayers.PgmAdlibJingle, key, index),
			`Take with transition ${index + 1}`,
			key,
			index
		)
	)

	return [
		...cameraTriggers,
		...remoteTriggers,
		...feedTriggers,
		...localTriggers,
		...dveTriggers,
		...serverTriggers,
		...graphicsTriggers,
		...clearTriggers,
		...sisyfosTriggers,
		...recallLastTriggers,
		...takeWithTransitionTriggers
	]
}

function recallLastHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_recall_last_${hotkeyType}_${index}`
}

function makeRecallLastTrigger(
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

function takeWithTransitionHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_take_with_transition_${hotkeyType}_${index}`
}

function makeTakeWithTransitionTrigger(
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
						value: [AdlibTags.ADLIB_TAKE_WITH_TRANSITION]
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
