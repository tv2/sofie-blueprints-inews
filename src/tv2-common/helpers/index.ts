export * from './abPlayback'
export * from './config'
export * from './sisyfos'
export * from './graphics'
export * from './rundownAdLibActions'

export function SanitizePath(path: string): string {
	return path.replace(/[\/\\]*$/, '')
}
