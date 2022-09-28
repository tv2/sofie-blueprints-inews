import {
	BlueprintResultOrderedRundowns,
	BlueprintResultRundown,
	BlueprintResultRundownPlaylist,
	ExtendedIngestRundown,
	IBlueprintResultRundownPlaylist,
	IBlueprintRundownDB,
	IGetRundownContext,
	IngestRundown,
	IShowStyleUserContext,
	IStudioUserContext,
	PlaylistTimingType,
	RundownPlaylistTiming,
	ShowStyleBlueprintManifest,
	StudioBlueprintManifest
} from '@tv2media/blueprints-integration'
import { assertUnreachable, literal, TimeFromINewsField } from 'tv2-common'
import { getRundownDuration } from './rundownDuration'

interface RundownMetaData {
	rank: number
	backTime: string | undefined
}

interface RundownPayload {
	rank: number
	backTime: string | undefined
}

function getRundownWithINewsPlaylist(
	_context: IShowStyleUserContext,
	ingestRundown: ExtendedIngestRundown,
	manifest: BlueprintResultRundown
): BlueprintResultRundown {
	manifest.rundown.playlistExternalId = ingestRundown.payload.playlistExternalId
	return manifest
}

export function getRundownWithBackTime(
	_context: IShowStyleUserContext,
	ingestRundown: ExtendedIngestRundown,
	manifest: BlueprintResultRundown
): BlueprintResultRundown {
	const sortedSegments = ingestRundown.segments.sort((a, b) => a.rank - b.rank)
	const firstContinuityStory = sortedSegments.find(segment => segment.name.match(/^\s*continuity\s*$/i))
	const backTime = firstContinuityStory ? firstContinuityStory.payload.iNewsStory.fields.backTime : undefined

	let expectedEnd: number | undefined
	const expectedDuration = getRundownDuration(ingestRundown.segments)

	if (backTime) {
		const backTimeNum = TimeFromINewsField(backTime.replace(/^@/, ''))
		const midnightToday = new Date()
		midnightToday.setHours(0, 0, 0, 0)
		expectedEnd = midnightToday.getTime() + backTimeNum * 1000
		expectedEnd = expectedEnd
	}

	if (expectedEnd) {
		manifest.rundown.timing = {
			type: PlaylistTimingType.BackTime,
			expectedEnd,
			expectedDuration
		}
	}

	if (!manifest.rundown.metaData) {
		manifest.rundown.metaData = {}
	}
	;(manifest.rundown.metaData as RundownMetaData).rank = (ingestRundown.payload as RundownPayload).rank
	;(manifest.rundown.metaData as RundownMetaData).backTime = (ingestRundown.payload as RundownPayload).backTime

	return manifest
}

function getRundownWithBreakBackTime(
	_context: IShowStyleUserContext,
	ingestRundown: ExtendedIngestRundown,
	manifest: BlueprintResultRundown
) {
	const backTime = (ingestRundown.payload as RundownPayload).backTime

	if (backTime) {
		manifest.rundown.endOfRundownIsShowBreak = true
	}

	return manifest
}

function getRundownPlaylistInfoINewsPlaylist(
	_context: IStudioUserContext,
	rundowns: IBlueprintRundownDB[],
	resultPlaylist: BlueprintResultRundownPlaylist
): BlueprintResultRundownPlaylist {
	const result: BlueprintResultOrderedRundowns = {}
	return {
		...resultPlaylist,
		order: rundowns.reduce((prev, curr) => {
			prev[curr.externalId] = (curr.metaData as RundownMetaData).rank
			return prev
		}, result)
	}
}

type GetRundownMixin = (
	context: IShowStyleUserContext,
	ingestRundown: IngestRundown,
	manifest: BlueprintResultRundown
) => BlueprintResultRundown

type GetRundownPlaylistInfoMixin = (
	context: IStudioUserContext,
	rundowns: IBlueprintRundownDB[],
	resultPlaylist: BlueprintResultRundownPlaylist
) => BlueprintResultRundownPlaylist

export function GetRundownWithMixins(getRundown: ShowStyleBlueprintManifest['getRundown'], mixins: GetRundownMixin[]) {
	return async (
		context: IGetRundownContext,
		ingestRundown: ExtendedIngestRundown
	): Promise<BlueprintResultRundown | null> => {
		let result = await getRundown(context, ingestRundown)
		if (result === null) {
			return result
		}

		for (const mixin of mixins) {
			result = mixin(context, ingestRundown, result)
		}

		return result
	}
}

export function GetRundownPlaylistInfoWithMixins(
	getRundownPlaylistInfo: StudioBlueprintManifest['getRundownPlaylistInfo'] | undefined,
	mixins: GetRundownPlaylistInfoMixin[]
) {
	return (context: IStudioUserContext, rundowns: IBlueprintRundownDB[]) => {
		const sortedRundowns = rundowns.sort((a, b) => {
			return (a.metaData as RundownMetaData).rank - (b.metaData as RundownMetaData).rank
		})
		const lastRundownTiming = sortedRundowns[sortedRundowns.length - 1].timing
		let timing: RundownPlaylistTiming = {
			type: PlaylistTimingType.None
		}
		if (lastRundownTiming.type === PlaylistTimingType.BackTime && lastRundownTiming.expectedEnd) {
			timing = {
				type: PlaylistTimingType.BackTime,
				expectedEnd: lastRundownTiming.expectedEnd,
				expectedDuration: lastRundownTiming.expectedDuration,
				expectedStart: lastRundownTiming.expectedStart
			}
		}
		let result: BlueprintResultRundownPlaylist = (getRundownPlaylistInfo
			? getRundownPlaylistInfo(context, rundowns, '')
			: undefined) ?? {
			playlist: literal<IBlueprintResultRundownPlaylist>({
				name: (rundowns[0] ?? { name: '' }).name,
				timing
			}),
			order: null
		}

		for (const mixin of mixins) {
			result = mixin(context, rundowns, result)
		}

		return result
	}
}

export enum ShowStyleManifestMixinINews {
	INewsPlaylist = 'inews-playlist',
	BackTime = 'inews-back-time',
	BreakBackTime = 'inews-break-back-time'
}

export enum StudioManifestMixinINews {
	INewsPlaylist = 'inews-playlist'
}

export function GetShowStyleManifestWithMixins(
	manifest: ShowStyleBlueprintManifest,
	mixins: ShowStyleManifestMixinINews[]
): ShowStyleBlueprintManifest {
	const getRundownMixins: GetRundownMixin[] = []

	for (const mixin of mixins) {
		switch (mixin) {
			case ShowStyleManifestMixinINews.INewsPlaylist:
				getRundownMixins.push(getRundownWithINewsPlaylist)
				break
			case ShowStyleManifestMixinINews.BackTime:
				getRundownMixins.push(getRundownWithBackTime)
				break
			case ShowStyleManifestMixinINews.BreakBackTime:
				getRundownMixins.push(getRundownWithBreakBackTime)
				break
			default:
				assertUnreachable(mixin)
				break
		}
	}

	manifest.getRundown = GetRundownWithMixins(manifest.getRundown, getRundownMixins)

	return manifest
}

export function GetStudioManifestWithMixins(
	manifest: StudioBlueprintManifest,
	mixins: StudioManifestMixinINews[]
): StudioBlueprintManifest {
	const getPlaylistMixins: GetRundownPlaylistInfoMixin[] = []

	for (const mixin of mixins) {
		switch (mixin) {
			case StudioManifestMixinINews.INewsPlaylist:
				getPlaylistMixins.push(getRundownPlaylistInfoINewsPlaylist)
				break
			default:
				assertUnreachable(mixin)
				break
		}
	}

	manifest.getRundownPlaylistInfo = GetRundownPlaylistInfoWithMixins(manifest.getRundownPlaylistInfo, getPlaylistMixins)

	return manifest
}
