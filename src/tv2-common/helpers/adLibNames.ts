export function localSourceFullAudioName(source: string) {
	if (/EPSIO/i.test(source)) {
		return source
	}
	return `EVS ${source} 100%`
}

export function localSourceVoAudioName(source: string) {
	if (/EPSIO/i.test(source)) {
		return source
	}
	return `EVS ${source} VO`
}

export function localSourceName(source: string, vo: boolean) {
	if (/EPSIO/i.test(source)) {
		return source
	}
	return vo ? localSourceVoAudioName(source) : localSourceFullAudioName(source)
}
