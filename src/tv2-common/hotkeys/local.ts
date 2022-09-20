import { IBlueprintTriggeredActions } from '@tv2media/blueprints-integration'
import { AdlibTags } from 'tv2-constants'
import { replaySourceFullAudioName, replaySourceVoAudioName } from '../helpers'
import { MakeStudioSourceHotkeys, SourceHotkeyTriggers } from './helpers'

export interface LocalSourceHotkeyAssignments {
	fullAudio: SourceHotkeyTriggers
	voAudio: SourceHotkeyTriggers
}

function localSourceFullAudioHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_local_full_audio_${hotkeyType}_${index}`
}

function localSourceVoAudioHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_local_vo_audio_${hotkeyType}_${index}`
}

export function MakeLocalSourceHotkeys(
	showStyleId: string,
	sourceLayerId: string,
	localSources: string[],
	assignemnts: LocalSourceHotkeyAssignments,
	getNextRank: () => number
): IBlueprintTriggeredActions[] {
	const fullAudioKeys = MakeStudioSourceHotkeys(
		showStyleId,
		sourceLayerId,
		localSources,
		assignemnts.fullAudio,
		getNextRank,
		replaySourceFullAudioName,
		localSourceFullAudioHotkeyId,
		[AdlibTags.ADLIB_FULL_AUDIO_LEVEL]
	)

	const voAudioKeys = MakeStudioSourceHotkeys(
		showStyleId,
		sourceLayerId,
		localSources,
		assignemnts.voAudio,
		getNextRank,
		replaySourceVoAudioName,
		localSourceVoAudioHotkeyId,
		[AdlibTags.ADLIB_VO_AUDIO_LEVEL]
	)

	return [...fullAudioKeys, ...voAudioKeys]
}
