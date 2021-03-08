export * from './abPlayback'
export * from './config'
export * from './dsk'
export * from './sisyfos'
export * from './graphics/index'
export * from './rundownAdLibActions'

export function SanitizePath(path: string): string {
	return path.replace(/[\/\\]*$/, '')
}
