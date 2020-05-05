import { VizEngine } from 'tv2-constants'

export function TranslateEngine(eng: string): VizEngine {
	return !!eng.match(/WALL/i) ? 'WALL' : !!eng.match(/FULL/i) ? 'FULL' : 'OVL'
}
