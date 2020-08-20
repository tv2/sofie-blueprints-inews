import { ActionTakeWithTransitionVariant, CueDefinitionDVE, SanitizeString } from 'tv2-common'
import { TallyTags } from 'tv2-constants'

export function GetTagForTransition(variant: ActionTakeWithTransitionVariant) {
	let tag = `${TallyTags.TAKE_WITH_TRANSITION}_${variant.type.toUpperCase()}`

	switch (variant.type) {
		case 'effekt':
			tag += variant.effekt
			break
		case 'mix':
			tag += variant.frames
			break
		default:
			break
	}

	return tag
}

export function GetTagForKam(name: string) {
	return `${TallyTags.KAM}_${SanitizeString(name)}`
}

export function GetTagForLive(name: string) {
	return `${TallyTags.LIVE}_${SanitizeString(name)}`
}

export function GetTagForServer(storyName: string, clip: string, vo: boolean) {
	return `${storyName}_${TallyTags.CLIP}_${SanitizeString(clip)}${vo ? '_VO' : ''}`
}

export function GetTagForServerNext(storyName: string, clip: string, vo: boolean) {
	return `${GetTagForServer(storyName, clip, vo)}_NEXT`
}

export function GetTagForDVE(template: string, sources: CueDefinitionDVE['sources']) {
	return `${TallyTags.DVE}_${SanitizeString(template)}_${SanitizeString(JSON.stringify(sources))}`
}

export function GetTagForDVENext(template: string, sources: CueDefinitionDVE['sources']) {
	return `${GetTagForDVE(template, sources)}_NEXT`
}

export function GetTagForFull(storyName: string, graphic: string) {
	return `${storyName}_${TallyTags.FULL}_${SanitizeString(graphic)}`
}

export function GetTagForFullNext(storyName: string, graphic: string) {
	return `${GetTagForFull(storyName, graphic)}_NEXT`
}

export function GetTagForJingle(storyName: string, clip: string) {
	return `${storyName}_${TallyTags.JINGLE}_${SanitizeString(clip)}`
}

export function GetTagForJingleNext(storyName: string, clip: string) {
	return `${GetTagForJingle(storyName, clip)}_NEXT`
}
