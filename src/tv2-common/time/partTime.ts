import { PartDefinition } from 'tv2-common'

export function PartTime(
	maximumDisplayDuration: number,
	partDefinition: PartDefinition,
	totalWords: number,
	defaultTime: boolean = true
): number {
	const storyDuration = Number(partDefinition.fields.audioTime) * 1000 || 0
	const partTime = (partDefinition.script.replace(/[\r\n]/g, '').length / totalWords) * storyDuration
	return Math.min(partTime > 0 ? partTime : defaultTime ? 10000 : 0, maximumDisplayDuration || 10000)
}
