import { GraphicEngine } from 'tv2-constants'

export function TranslateEngine(eng: string): GraphicEngine {
	return !!eng.match(/WALL/i) ? 'WALL' : !!eng.match(/FULL/i) ? 'FULL' : 'OVL'
}
