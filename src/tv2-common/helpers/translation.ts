import { ITranslatableMessage } from '@sofie-automation/blueprints-integration'

export function t(key: string, args?: { [k: string]: any }): ITranslatableMessage {
	return {
		key,
		args
	}
}
