import { IBlueprintAdLibPiece, IBlueprintPiece, ICommonContext, TSR } from '@tv2media/blueprints-integration'
import { ActionBase } from './actions'

export function literal<T>(o: T) {
	return o
}
export function assertUnreachable(_never: never): never {
	throw new Error('Switch validation failed, look for assertUnreachable(...)')
}

// tslint:disable-next-line: prettier
export type WithValuesOfTypes<T, Q> = { [P in keyof T as T[P] extends Q | undefined ? P : never]: T[P] }
export type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> & Pick<T, TRequired>
export type EmptyBaseObj = OptionalExceptFor<Omit<TSR.TimelineObjEmpty, 'content'>, 'layer' | 'enable' | 'classes'>
export function createEmptyObject(obj: EmptyBaseObj): TSR.TimelineObjEmpty {
	return {
		id: '',
		priority: 0,
		...obj,
		content: {
			deviceType: TSR.DeviceType.ABSTRACT,
			type: 'empty'
		}
	}
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

export function JoinAssetToFolder(folder: string | undefined, assetFile: string) {
	if (!folder) {
		return assetFile
	}

	// Replace every `\\` with `\`, then replace every `\` with `/`
	const folderWithForwardSlashes = folder.replace(/\\\\/g, '\\').replace(/\\/g, '/')
	const assetWithForwardSlashes = assetFile.replace(/\\\\/g, '\\').replace(/\\/g, '/')

	// Remove trailing slash from folder and leading slash from asset
	const folderWithoutTrailingSlashes = folderWithForwardSlashes.replace(/\/+$/, '')
	const assetFileWithoutLeadingSlashes = assetWithForwardSlashes.replace(/^\/+/, '')

	return `${folderWithoutTrailingSlashes}/${assetFileWithoutLeadingSlashes}`
}

export function JoinAssetToNetworkPath(
	networkPath: string,
	folder: string | undefined,
	assetFile: string,
	extension: string
) {
	// Replace every `\\` with `\`, then replace every `\` with `/`
	const folderWithForwardSlashes = folder?.replace(/\\\\/g, '/').replace(/\\/g, '/')
	const assetWithForwardSlashes = assetFile.replace(/\\\\/g, '/').replace(/\\/g, '/')
	const networkPathWithForwardSlashes =
		networkPath[0] +
		networkPath
			.slice(1)
			.replace(/\\\\/g, '/')
			.replace(/\\/g, '/')

	// Remove trailing/leading slash from folder and leading slash from asset
	const folderWithoutLeadingTrailingSlashes = folderWithForwardSlashes?.replace(/\/+$/, '').replace(/^\/+/, '')
	const assetFileWithoutLeadingSlashes = assetWithForwardSlashes.replace(/^\/+/, '')
	const networkPathWithoutTrailingSlashes = networkPathWithForwardSlashes.replace(/\/+$/, '')

	// Replace all forward slashes with a single backslash
	const folderWithWindowsPaths = folderWithoutLeadingTrailingSlashes?.replace(/\//g, '\\')
	const assetFileWithWindowsPaths = assetFileWithoutLeadingSlashes.replace(/\//g, '\\')
	const networkPathWithWindowsPaths = networkPathWithoutTrailingSlashes.replace(/\//g, '\\')

	// Remove leading dot from e.g. '.mxf' => 'mxf'
	const extensionWithoutLeadingDot = extension.replace(/^\./, '')

	if (!folderWithWindowsPaths) {
		return `${networkPathWithWindowsPaths}\\${assetFileWithWindowsPaths}.${extensionWithoutLeadingDot}`
	}

	return `${networkPathWithWindowsPaths}\\${folderWithWindowsPaths}\\${assetFileWithWindowsPaths}.${extensionWithoutLeadingDot}`
}

export function generateExternalId(context: ICommonContext, action: ActionBase): string {
	return context.getHashId(JSON.stringify(action), false)
}