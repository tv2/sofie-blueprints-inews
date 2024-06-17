import { IBlueprintPart } from 'blueprints-integration'
import { Invalidity } from './invalidity'

export interface Part<T = unknown> extends IBlueprintPart<T> {
	invalidity?: Invalidity
}
