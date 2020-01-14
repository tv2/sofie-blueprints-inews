import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'

export function PartTime(partDefinition: PartDefinition, totalWords: number, defaultTime: boolean = true): number {
	const storyDuration = Number(partDefinition.fields.totalTime) * 1000 || 0
	const partTime = (partDefinition.script.replace(/[\r\n]/g, '').length / totalWords) * storyDuration
	return partTime > 0 ? partTime : defaultTime ? 3000 : 0
}
