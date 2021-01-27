import { IBlueprintPart } from '@sofie-automation/blueprints-integration'
import { INewsStory } from 'tv2-common'

export function GetTimeFromPart(story: INewsStory): Partial<IBlueprintPart> {
	return {
		expectedDuration: Number(story.fields.audioTime),
		prerollDuration: 0
	}
}
