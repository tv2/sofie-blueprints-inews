import { IBlueprintTriggeredActions } from '@tv2media/blueprints-integration'
import { MakeStudioSourceHotkeys, SourceHotkeyTriggers } from './helpers'

export interface LocalSourceHotkeyAssignments {
	fullAudio: SourceHotkeyTriggers
	voAudio: SourceHotkeyTriggers
}

function localSourceFullAudioHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_local_full_audio_${hotkeyType}_${index}`
}

function localSourceFullAudioHotkeyName(source: string) {
	return `EVS ${source} 100%`
}

function localSourceFullAudioPickId(sourceIndex: number, hotkeyType: string): number {
	return sourceIndex * (hotkeyType === 'queue' ? 2 : 0)
}

function localSourceVoAudioHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_local_vo_audio_${hotkeyType}_${index}`
}

function localSourceVoAudioHotkeyName(source: string) {
	return `EVS ${source} VO`
}

function localSourceVoAudioPickId(sourceIndex: number, hotkeyType: string): number {
	return 1 + sourceIndex * (hotkeyType === 'queue' ? 2 : 0)
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
		localSourceFullAudioHotkeyName,
		localSourceFullAudioHotkeyId,
		localSourceFullAudioPickId,
	)

	const voAudioKeys = MakeStudioSourceHotkeys(
		showStyleId,
		sourceLayerId,
		localSources,
		assignemnts.voAudio,
		getNextRank,
		localSourceVoAudioHotkeyName,
		localSourceVoAudioHotkeyId,
		localSourceVoAudioPickId,
	)

	return [...fullAudioKeys, ...voAudioKeys]
}
