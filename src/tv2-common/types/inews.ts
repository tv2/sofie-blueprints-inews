interface INewsFields {
	title: string
	modifyDate: string // number
	pageNumber?: string
	tapeTime: string // number
	audioTime: string // number
	totalTime: string // number
	cumeTime: string // number
	backTime: string // number
}

interface INewsMetaData {
	wire?: 'f' | 'b' | 'u' | 'r' | 'o'
	mail?: 'read' | 'unread'
	locked?: 'pass' | 'user'
	words?: string // number
	rate?: string // number
	break?: string
	mcserror?: string
	hold?: string
	float?: 'float' | undefined
	delete?: string
}

export interface INewsStory {
	/** Same identifier as the file the story came from */
	identifier: string
	locator: string
	fields: INewsFields
	meta: INewsMetaData
	cues: Array<UnparsedCue | null>
	body?: string
}

export interface INewsPayload {
	iNewsStory?: INewsStory
}

export type UnparsedCue = string[] | null
