import { IBlueprintPart } from '@sofie-automation/blueprints-integration'
import { INewsStory, TimeFromINewsField } from 'tv2-common'

export function GetTimeFromPart(story: INewsStory): Partial<IBlueprintPart> {
	return {
		expectedDuration: TimeFromINewsField(story.fields.audioTime),
		prerollDuration: 0
	}
}
