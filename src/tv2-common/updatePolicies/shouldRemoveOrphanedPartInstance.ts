import { BlueprintRemoveOrphanedPartInstance, IRundownUserContext } from '@tv2media/blueprints-integration'
import { PartMetaData } from 'tv2-common'

export function shouldRemoveOrphanedPartInstance(
	_context: IRundownUserContext,
	partInstance: BlueprintRemoveOrphanedPartInstance
): boolean {
	return !(partInstance.partInstance.part.metaData as PartMetaData | undefined)?.dirty
}
