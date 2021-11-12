import {
	BlueprintRemoveOrphanedPartInstance,
	IRemoveOrphanedPartInstanceContext
} from '@sofie-automation/blueprints-integration'
import { PartMetaData } from 'tv2-common'

export function shouldRemoveOrphanedPartInstance(
	context: IRemoveOrphanedPartInstanceContext,
	partInstance: BlueprintRemoveOrphanedPartInstance
) {
	if ((partInstance.partInstance.part.metaData as PartMetaData).dirty) {
		context.removePartInstance()
	}
}
