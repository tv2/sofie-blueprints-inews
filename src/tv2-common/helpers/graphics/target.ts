import { GraphicEngine } from 'tv2-constants'

export function IsTargetingFull(engine: GraphicEngine) {
	return engine === 'FULL' || IsTargetingTLF(engine)
}

export function IsTargetingOVL(engine: GraphicEngine) {
	return engine === 'OVL'
}

export function IsTargetingWall(engine: GraphicEngine) {
	return engine === 'WALL'
}

export function IsTargetingTLF(engine: GraphicEngine) {
	return engine === 'TLF'
}
