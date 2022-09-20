export function replaySourceFullAudioName(source: string) {
	if (/EPSIO/i.test(source)) {
		return source
	}
	return `${source} 100%`
}

export function replaySourceVoAudioName(source: string) {
	if (/EPSIO/i.test(source)) {
		return source
	}
	return `${source} VO`
}

export function replaySourceName(source: string, vo: boolean) {
	if (/EPSIO/i.test(source)) {
		return source
	}
	return vo ? replaySourceVoAudioName(source) : replaySourceFullAudioName(source)
}
