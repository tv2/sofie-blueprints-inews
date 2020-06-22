export * from './abPlayback'
export * from './config'
export * from './sisyfos'

export function SanitizePath(path: string): string {
	return path.replace(/[\/\\]*$/, '')
}
