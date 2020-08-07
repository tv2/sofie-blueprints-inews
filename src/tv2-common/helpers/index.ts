export * from './abPlayback'
export * from './config'
export * from './sisyfos'
export * from './graphics'

export function SanitizePath(path: string): string {
	return path.replace(/[\/\\]*$/, '')
}
