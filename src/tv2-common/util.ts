import { IBlueprintAdLibPiece, IBlueprintPiece, TSR } from 'tv-automation-sofie-blueprints-integration'

export function literal<T>(o: T) {
	return o
}
export function assertUnreachable(_never: never): never {
	throw new Error('Switch validation failed, look for assertUnreachable(...)')
}

export type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> & Pick<T, TRequired>
export type EmptyBaseObj = OptionalExceptFor<Omit<TSR.TimelineObjEmpty, 'content'>, 'layer' | 'enable' | 'classes'>
export function createEmptyObject(obj: EmptyBaseObj): TSR.TimelineObjEmpty {
	return literal<TSR.TimelineObjEmpty>({
		id: '',
		priority: 0,
		...obj,
		content: {
			deviceType: TSR.DeviceType.ABSTRACT,
			type: 'empty'
		}
	})
}

/**
 * Returs true if the piece is interface IBlueprintAdLibPiece
 * @param {IBlueprintPiece | IBlueprintAdLibPiece} piece Piece to check
 */
export function isAdLibPiece(piece: IBlueprintPiece | IBlueprintAdLibPiece) {
	return '_rank' in piece
}

export function SanitizeString(str: string) {
	return str.replace(/\W/g, '_')
}
