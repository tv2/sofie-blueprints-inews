import { ITranslatableMessage } from '@tv2media/blueprints-integration'

export function t(key: string, args?: { [k: string]: any }): ITranslatableMessage {
	return {
		key,
		args
	}
}
