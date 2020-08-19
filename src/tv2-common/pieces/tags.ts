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

export function GetTagForServer(clip: string, vo: boolean) {
	return `${TallyTags.CLIP}_${SanitizeString(clip)}${vo ? '_VO' : ''}`
}

export function GetTagForServerNext(clip: string, vo: boolean) {
	return `${GetTagForServer(clip, vo)}_NEXT`
}

export function GetTagForDVE(template: string, sources: CueDefinitionDVE['sources']) {
	return `${TallyTags.DVE}_${SanitizeString(template)}_${SanitizeString(JSON.stringify(sources))}`
}

export function GetTagForDVENext(template: string, sources: CueDefinitionDVE['sources']) {
	return `${GetTagForDVE(template, sources)}_NEXT`
}

export function GetTagForFull(graphic: string) {
	return `${TallyTags.FULL}_${SanitizeString(graphic)}`
}

export function GetTagForFullNext(graphic: string) {
	return `${GetTagForFull(graphic)}_NEXT`
}

export function GetTagForJingle(clip: string) {
	return `${TallyTags.JINGLE}_${SanitizeString(clip)}`
}

export function GetTagForJingleNext(clip: string) {
	return `${GetTagForJingle(clip)}_NEXT`
}
