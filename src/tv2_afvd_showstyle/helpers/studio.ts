import { IStudioContext } from '@tv2media/blueprints-integration'

/**
 * Gets the name of the studio this context belongs to.
 * @param {IStudioContext} context Context to find the studio name for.
 */
export function getStudioName(context: IStudioContext) {
	const studio = (context as any).studio

	if (studio) {
		return studio.name
	}

	return ''
}
