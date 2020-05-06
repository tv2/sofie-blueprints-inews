import { PartDefinition } from 'tv2-common'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'

export function PartTime<StudioConfig extends TV2StudioConfigBase>(
	config: TV2BlueprintConfigBase<StudioConfig>,
	partDefinition: PartDefinition,
	totalWords: number,
	/** Amount of time reserved for parts without a script. */
	reservedTime: number,
	defaultTime: boolean = true
): number {
	const storyDuration = Number(partDefinition.fields.audioTime) * 1000 || 0
	// Take away reserved time from "extra" tape time
	// If remainder is negative, time needs to be taken away from story time to meet reserve quantity.
	const remainder = (Number(partDefinition.fields.tapeTime) * 1000 || 0) - reservedTime
	const partTime =
		(partDefinition.script.replace(/[\r\n]/g, '').length / totalWords) *
		Math.max(storyDuration - (remainder < 0 ? -remainder : 0), 0)
	return Math.min(
		partTime > 0 ? partTime : defaultTime ? config.studio.DefaultPartDuration : 0,
		config.studio.MaximumPartDuration || 10000
	)
}
