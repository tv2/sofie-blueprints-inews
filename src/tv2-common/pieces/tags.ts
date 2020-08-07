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

export function GetTagForKam(name: string) {
	return `${TallyTags.KAM}_${name.replace(/\W/g, '_')}`
}

export function GetTagForLive(name: string) {
	return `${TallyTags.LIVE}_${name.replace(/\W/g, '_')}`
}

export function GetTagForServer(clip: string, vo: boolean) {
	return `${TallyTags.CLIP}_${clip}${vo ? '_VO' : ''}`
}

export function GetTagForServerNext(clip: string, vo: boolean) {
	return `${GetTagForServer(clip, vo)}_NEXT`
}

export function GetTagForDVE(cue: CueDefinitionDVE) {
	return `${TallyTags.DVE}_${cue.template}_${JSON.stringify(cue.sources).replace(/\W/g, '_')}`
}

export function GetTagForDVENext(cue: CueDefinitionDVE) {
	return `${GetTagForDVE(cue)}_NEXT`
}

export function GetTagForFull(graphic: string) {
	return `${TallyTags.FULL}_${graphic.replace(/\W/g, '_')}`
}

export function GetTagForFullNext(graphic: string) {
	return `${GetTagForFull(graphic)}_NEXT`
}
