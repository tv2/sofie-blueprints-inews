import { DveLoopGenerator } from '../helpers/graphics/caspar/dve-loop-generator'
import { GfxSchemaGenerator } from './gfx-schema-generator'

export abstract class GfxSchemaGeneratorFacade {
	public static create(): GfxSchemaGenerator {
		return new GfxSchemaGenerator(new DveLoopGenerator())
	}
}
