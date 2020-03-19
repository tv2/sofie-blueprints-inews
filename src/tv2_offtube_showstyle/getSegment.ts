import {
	BlueprintResultSegment,
	IBlueprintRundownDB,
	IBlueprintSegment,
	IngestSegment,
	PartContext,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'

export function getSegment(_context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {},
		identifier:
			ingestSegment.payload.iNewsStory.fields.pageNumber && ingestSegment.payload.iNewsStory.fields.pageNumber.trim()
				? ingestSegment.payload.iNewsStory.fields.pageNumber.trim()
				: undefined
	})
	// const config = parseConfig(context)

	return {
		segment,
		parts: []
	}
}

export class PartContext2 implements PartContext {
	public readonly rundownId: string
	public readonly rundown: IBlueprintRundownDB
	private baseContext: SegmentContext
	private externalId: string

	constructor(baseContext: SegmentContext, externalId: string) {
		this.baseContext = baseContext
		this.externalId = externalId

		this.rundownId = baseContext.rundownId
		this.rundown = baseContext.rundown
	}

	/** PartContext */
	public getRuntimeArguments() {
		return this.baseContext.getRuntimeArguments(this.externalId) || {}
	}

	/** IShowStyleConfigContext */
	public getShowStyleConfig() {
		return this.baseContext.getShowStyleConfig()
	}
	public getShowStyleConfigRef(configKey: string) {
		return this.baseContext.getShowStyleConfigRef(configKey)
	}

	/** IStudioContext */
	public getStudioMappings() {
		return this.baseContext.getStudioMappings()
	}

	/** IStudioConfigContext */
	public getStudioConfig() {
		return this.baseContext.getStudioConfig()
	}
	public getStudioConfigRef(configKey: string) {
		return this.baseContext.getStudioConfigRef(configKey)
	}

	/** NotesContext */
	public error(message: string) {
		return this.baseContext.error(message)
	}
	public warning(message: string) {
		return this.baseContext.warning(message)
	}
	public getNotes() {
		return this.baseContext.getNotes()
	}

	/** ICommonContext */
	public getHashId(originString: string, originIsNotUnique?: boolean) {
		return this.baseContext.getHashId(`${this.externalId}_${originString}`, originIsNotUnique)
	}
	public unhashId(hash: string) {
		return this.baseContext.unhashId(hash)
	}
}
