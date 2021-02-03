import {
	AsRunEventContext,
	EventContext,
	IBlueprintExternalMessageQueueObj
} from '@sofie-automation/blueprints-integration'
import * as _ from 'underscore'

/**
 * This function is called whenever an item in the as-run-log is created
 */
export default function(_context: EventContext & AsRunEventContext): Promise<IBlueprintExternalMessageQueueObj[]> {
	return Promise.resolve([])
}
