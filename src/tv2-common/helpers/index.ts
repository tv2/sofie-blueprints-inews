export * from './abPlayback'
export * from './config'
export * from './graphics'
export * from './dsk'
export * from './sisyfos'
export * from './rundownAdLibActions'
export * from './postProcessDefinitions'
export * from './translation'
export * from './adLibNames'
export * from './serverResume'

export function SanitizePath(path: string): string {
	return path.replace(/[\/\\]*$/, '')
}
