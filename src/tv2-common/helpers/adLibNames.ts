export function localSourceFullAudioName(source: string) {
	return `EVS ${source} 100%`
}

export function localSourceVoAudioName(source: string) {
	return `EVS ${source} VO`
}

export function localSourceName(source: string, vo: boolean) {
	return vo ? localSourceVoAudioName(source) : localSourceFullAudioName(source)
}
