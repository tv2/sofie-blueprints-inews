import { PartDefinition } from 'tv2-common'

export function PartTime(partDefinition: PartDefinition, totalWords: number): number {
	const storyDuration = Number(partDefinition.fields.audioTime) * 1000 || 0
	const partTime = (partDefinition.script.replace(/[\r\n]/g, '').length / totalWords) * storyDuration
	return Math.max(partTime, 0)
}
