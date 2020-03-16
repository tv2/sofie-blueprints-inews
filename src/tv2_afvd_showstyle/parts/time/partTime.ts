import { PartDefinition } from 'tv2-common'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'

export function PartTime(
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number,
	defaultTime: boolean = true
): number {
	const storyDuration = Number(partDefinition.fields.audioTime) * 1000 || 0
	const partTime = (partDefinition.script.replace(/[\r\n]/g, '').length / totalWords) * storyDuration
	return Math.min(partTime > 0 ? partTime : defaultTime ? 10000 : 0, config.studio.MaximumKamDisplayDuration || 10000)
}
