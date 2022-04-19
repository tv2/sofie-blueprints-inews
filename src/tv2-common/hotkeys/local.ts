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

function localSourceFullAudioPick(sourceIndex: number, hotkeyType: string): number {
	if (shouldUseCustomIndexPickerForLocalSourceAudio(hotkeyType)) {
		return 2 * sourceIndex
	}
	return sourceIndex
}

function localSourceVoAudioHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_local_vo_audio_${hotkeyType}_${index}`
}

function localSourceVoAudioHotkeyName(source: string) {
	return `EVS ${source} VO`
}

function localSourceVoAudioPick(sourceIndex: number, hotkeyType: string): number {
	if (shouldUseCustomIndexPickerForLocalSourceAudio(hotkeyType)) {
		return 1 + 2 * sourceIndex
	}
	return sourceIndex
}

function shouldUseCustomIndexPickerForLocalSourceAudio(hotkeyType: string): boolean {
	return hotkeyType === 'queue' || /^cut_to_box_\d+$/.test(hotkeyType)
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
		localSourceFullAudioPick,
	)

	const voAudioKeys = MakeStudioSourceHotkeys(
		showStyleId,
		sourceLayerId,
		localSources,
		assignemnts.voAudio,
		getNextRank,
		localSourceVoAudioHotkeyName,
		localSourceVoAudioHotkeyId,
		localSourceVoAudioPick,
	)

	return [...fullAudioKeys, ...voAudioKeys]
}
