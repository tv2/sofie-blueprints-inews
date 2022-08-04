export * from './abPlayback'
export * from './config'
export * from './dsk'
export * from './sisyfos'
export * from './graphics/index'
export * from './rundownAdLibActions'
export * from './postProcessDefinitions'
export * from './translation'
export * from './adLibNames'
export * from './serverResume'

export function SanitizePath(path: string): string {
	return path.replace(/[\/\\]*$/, '')
}
