import { PartDefinition } from 'tv2-common'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'

export function PartTime<StudioConfig extends TV2StudioConfigBase>(
	config: TV2BlueprintConfigBase<StudioConfig>,
	partDefinition: PartDefinition,
	totalWords: number,
	defaultTime: boolean = true
): number {
	const storyDuration = Number(partDefinition.fields.audioTime) * 1000 || 0
	const partTime = (partDefinition.script.replace(/[\r\n]/g, '').length / totalWords) * storyDuration
	return Math.min(partTime > 0 ? partTime : defaultTime ? 10000 : 0, config.studio.MaximumKamDisplayDuration || 10000)
}
