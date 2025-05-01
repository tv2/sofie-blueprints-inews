import { DVESources, findSourceInfo, ShowStyleContext, SourceDefinition, SourceInfo, SourceInfoType } from 'tv2-common'

export enum PlayoutContentType {
	CAMERA = 'CAMERA',
	REMOTE = 'REMOTE',
	REPLAY = 'REPLAY',
	SPLIT_SCREEN = 'SPLIT_SCREEN',
	GRAPHICS = 'GRAPHICS',
	OVERLAY_GRAPHICS = 'OVERLAY_GRAPHICS',
	VIDEO_CLIP = 'VIDEO_CLIP',
	VOICE_OVER = 'VOICE_OVER',
	JINGLE = 'JINGLE',
	AUDIO = 'AUDIO',
	MANUS = 'MANUS',
	TRANSITION = 'TRANSITION',
	COMMAND = 'COMMAND',
	UNKNOWN = 'UNKNOWN'
}

export type PlayoutContent =
	| SourcePlayoutContent
	| SplitScreenPlayoutContent
	| GraphicsPlayoutContent
	| OverlayGraphicsPlayoutContent
	| VideoPlayoutContent
	| VoiceOverPlayoutContent
	| JinglePlayoutContent
	| AudioPlayoutContent
	| ManusPlayoutContent
	| TransitionPlayoutContent
	| CommandPlayoutContent
	| UnknownPlayoutContent

export type SourcePlayoutContent = CameraPlayoutContent | RemotePlayoutContent | ReplayPlayoutContent

interface CameraPlayoutContent {
	type: PlayoutContentType.CAMERA
	source: string
}

interface RemotePlayoutContent {
	type: PlayoutContentType.REMOTE
	source: string
}

interface ReplayPlayoutContent {
	type: PlayoutContentType.REPLAY
	source: string
}

interface SplitScreenPlayoutContent {
	type: PlayoutContentType.SPLIT_SCREEN
	layout: string
	sources: SourcePlayoutContent[]
}

interface GraphicsPlayoutContent {
	type: PlayoutContentType.GRAPHICS
}

interface OverlayGraphicsPlayoutContent {
	type: PlayoutContentType.OVERLAY_GRAPHICS
}

interface VideoPlayoutContent {
	type: PlayoutContentType.VIDEO_CLIP
}

interface VoiceOverPlayoutContent {
	type: PlayoutContentType.VOICE_OVER
}

interface JinglePlayoutContent {
	type: PlayoutContentType.JINGLE
}

interface AudioPlayoutContent {
	type: PlayoutContentType.AUDIO
}

interface ManusPlayoutContent {
	type: PlayoutContentType.MANUS
}

interface TransitionPlayoutContent {
	type: PlayoutContentType.TRANSITION
}

interface CommandPlayoutContent {
	type: PlayoutContentType.COMMAND
}

interface UnknownPlayoutContent {
	type: PlayoutContentType.UNKNOWN
}

// These methods below should ideally not be placed here. Since we hopefully refactor ingest soon, they should be short lived.
export function parseDveSourcesToPlayoutContent(
	sources: DVESources,
	context: ShowStyleContext
): SourcePlayoutContent[] {
	const playoutContents: SourcePlayoutContent[] = []
	const inp1: SourcePlayoutContent | undefined = parseSourceDefinitionToPlayoutContent(context, sources.INP1)
	if (inp1) {
		playoutContents.push(inp1)
	}
	const inp2: SourcePlayoutContent | undefined = parseSourceDefinitionToPlayoutContent(context, sources.INP2)
	if (inp2) {
		playoutContents.push(inp2)
	}
	const inp3: SourcePlayoutContent | undefined = parseSourceDefinitionToPlayoutContent(context, sources.INP3)
	if (inp3) {
		playoutContents.push(inp3)
	}
	const inp4: SourcePlayoutContent | undefined = parseSourceDefinitionToPlayoutContent(context, sources.INP4)
	if (inp4) {
		playoutContents.push(inp4)
	}
	return playoutContents
}

function parseSourceDefinitionToPlayoutContent(
	context: ShowStyleContext,
	source?: SourceDefinition
): SourcePlayoutContent | undefined {
	if (!source) {
		return
	}

	const sourceInfo: SourceInfo | undefined = findSourceInfo(context.config.sources, source)
	if (!sourceInfo) {
		return
	}

	switch (sourceInfo.type) {
		case SourceInfoType.KAM: {
			return {
				type: PlayoutContentType.CAMERA,
				source: sourceInfo.id
			}
		}
		case SourceInfoType.FEED:
		case SourceInfoType.LIVE: {
			return {
				type: PlayoutContentType.REMOTE,
				source: sourceInfo.id
			}
		}
		case SourceInfoType.REPLAY: {
			return {
				type: PlayoutContentType.REPLAY,
				source: sourceInfo.id
			}
		}
		default: {
			return
		}
	}
}
