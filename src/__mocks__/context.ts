import * as crypto from 'crypto'
import * as _ from 'underscore'

import {
	BlueprintMappings,
	ConfigItemValue,
	IBlueprintRundownDB,
	ICommonContext,
	IShowStyleContext
} from '@sofie-automation/blueprints-integration'
import { NoteType } from 'tv2-constants'
import { parseConfig as parseShowStyleConfig } from '../tv2_afvd_showstyle/helpers/config'
import { parseConfig } from '../tv2_afvd_studio/helpers/config'

export function getHash(str: string): string {
	const hash = crypto.createHash('sha1')
	return hash
		.update(str)
		.digest('base64')
		.replace(/[\+\/\=]/gi, '_') // remove +/= from strings, because they cause troubles
}

export class CommonContext implements ICommonContext {
	private _idPrefix: string = ''
	private hashI = 0
	private hashed: { [hash: string]: string } = {}

	constructor(idPrefix: string) {
		this._idPrefix = idPrefix
	}
	public getHashId(str?: any) {
		if (!str) {
			str = 'hash' + this.hashI++
		}

		let id
		id = getHash(this._idPrefix + '_' + str.toString())
		this.hashed[id] = str
		return id
		// return Random.id()
	}
	public unhashId(hash: string): string {
		return this.hashed[hash] || hash
	}
}

export interface PartNote {
	type: NoteType
	origin: {
		name: string
		roId?: string
		segmentId?: string
		partId?: string
		pieceId?: string
	}
	message: string
}
// tslint:disable-next-line: max-classes-per-file
export class ShowStyleContext extends NotesContext implements IShowStyleContext {
	public studioConfig: { [key: string]: ConfigItemValue } = {}
	public showStyleConfig: { [key: string]: ConfigItemValue } = {}

	private mappingsDefaults: BlueprintMappings

	constructor(contextName: string, mappingsDefaults: BlueprintMappings, rundownId?: string) {
		super(contextName, rundownId)
		this.mappingsDefaults = mappingsDefaults
	}
	public getStudioConfig(): { [key: string]: ConfigItemValue } {
		return parseConfig(this.studioConfig)
	}
	public getStudioConfigRef(configKey: string): string {
		return 'studio.mock.' + configKey // just a placeholder
	}
	public getShowStyleConfig(): { [key: string]: ConfigItemValue } {
		return parseShowStyleConfig(this.showStyleConfig)
	}
	public getShowStyleConfigRef(configKey: string): string {
		return 'showStyle.mock.' + configKey // just a placeholder
	}
	public getStudioMappings(): BlueprintMappings {
		return _.clone(this.mappingsDefaults)
	}
}

// tslint:disable-next-line: max-classes-per-file
export class SegmentContext extends ShowStyleContext implements ISegmentContext {
	public rundownId: string
	public rundown: IBlueprintRundownDB

	constructor(rundown: IBlueprintRundownDB, mappings: BlueprintMappings, contextName?: string) {
		super(contextName || rundown.name, mappings, rundown._id)

		this.rundownId = rundown._id
		this.rundown = rundown
	}

	public hackGetMediaObjectDuration(_mediaId: string): number | undefined {
		return undefined
	}
}
