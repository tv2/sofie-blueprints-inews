import { IBlueprintTriggeredActions } from '@tv2media/blueprints-integration'
import { MakeStudioSourceHotkeys, SourceHotkeyTriggers } from './helpers'

export type RemoteSourceHotkeyAssignments = SourceHotkeyTriggers

function remoteHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_remote_${hotkeyType}_${index}`
}

function feedHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_feed_${hotkeyType}_${index}`
}

function remoteHotkeyName(remote: string) {
	const feed = remote.match(/^F(.+).*$/) // TODO: fix when refactoring FindSourceInfo
	return feed ? `FEED ${feed[1]}` : `LIVE ${remote}`
}

export function MakeRemoteHotkeys(
	showStyleId: string,
	sourceLayerId: string,
	remotes: string[],
	assignments: RemoteSourceHotkeyAssignments,
	getNextRank: () => number,
	feed: boolean
): IBlueprintTriggeredActions[] {
	return MakeStudioSourceHotkeys(
		showStyleId,
		sourceLayerId,
		remotes,
		assignments,
		getNextRank,
		remoteHotkeyName,
		feed ? feedHotkeyId : remoteHotkeyId
	)
}
