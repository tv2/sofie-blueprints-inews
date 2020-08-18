import { ActionTakeWithTransitionVariant, CueDefinitionDVE } from 'tv2-common'
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

function sanitize(str: string) {
	return str.replace(/\W/g, '_')
}

export function GetTagForKam(name: string) {
	return `${TallyTags.KAM}_${sanitize(name)}`
}

export function GetTagForLive(name: string) {
	return `${TallyTags.LIVE}_${sanitize(name)}`
}

export function GetTagForServer(clip: string, vo: boolean) {
	return `${TallyTags.CLIP}_${sanitize(clip)}${vo ? '_VO' : ''}`
}

export function GetTagForServerNext(clip: string, vo: boolean) {
	return `${GetTagForServer(clip, vo)}_NEXT`
}

export function GetTagForDVE(cue: CueDefinitionDVE) {
	return `${TallyTags.DVE}_${sanitize(cue.template)}_${sanitize(JSON.stringify(cue.sources))}`
}

export function GetTagForDVENext(cue: CueDefinitionDVE) {
	return `${GetTagForDVE(cue)}_NEXT`
}

export function GetTagForFull(graphic: string) {
	return `${TallyTags.FULL}_${sanitize(graphic)}`
}

export function GetTagForFullNext(graphic: string) {
	return `${GetTagForFull(graphic)}_NEXT`
}

export function GetTagForJingle(clip: string) {
	return `${TallyTags.JINGLE}_${sanitize(clip)}`
}

export function GetTagForJingleNext(clip: string) {
	return `${GetTagForJingle(clip)}_NEXT`
}
