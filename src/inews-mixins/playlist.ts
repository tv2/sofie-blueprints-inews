import {
	BlueprintResultOrderedRundowns,
	BlueprintResultRundown,
	BlueprintResultRundownPlaylist,
	ExtendedIngestRundown,
	IBlueprintRundownDB,
	IBlueprintRundownPlaylistInfo,
	IngestRundown,
	IShowStyleUserContext,
	IStudioUserContext,
	ShowStyleBlueprintManifest,
	StudioBlueprintManifest
} from '@sofie-automation/blueprints-integration'
import { assertUnreachable, literal } from 'tv2-common'

function getRundownWithINewsPlaylist(
	_context: IShowStyleUserContext,
	ingestRundown: ExtendedIngestRundown,
	manifest: BlueprintResultRundown
): BlueprintResultRundown {
	manifest.rundown.playlistExternalId = ingestRundown.payload.playlistExternalId
	return manifest
}

function getRundownWithBackTime(
	_context: IShowStyleUserContext,
	ingestRundown: ExtendedIngestRundown,
	manifest: BlueprintResultRundown
): BlueprintResultRundown {
	const backTime = ingestRundown.segments[ingestRundown.segments.length - 1]?.payload?.iNewsStory?.fields?.backTime as
		| string
		| undefined

	let expectedEnd: number | undefined
	let expectedDuration =
		ingestRundown.segments.reduce((prev, curr) => prev + Number(curr.payload?.iNewsStory?.fields?.totalTime) ?? 0, 0) *
		1000

	if (backTime) {
		const backTimeNum = Number(backTime.replace(/^@/, ''))
		if (!Number.isNaN(backTimeNum)) {
			const midnightToday = new Date()
			midnightToday.setHours(0, 0, 0, 0)

			expectedEnd = midnightToday.getTime() + backTimeNum * 1000
		}

		manifest.rundown.expectedEnd = expectedEnd
	}

	manifest.rundown.expectedDuration = expectedDuration

	return manifest
}

function getRundownWithCommercialBreakBackTime(
	_context: IShowStyleUserContext,
	ingestRundown: ExtendedIngestRundown,
	manifest: BlueprintResultRundown
) {
	const backTime = ingestRundown.segments[ingestRundown.segments.length - 1]?.payload?.iNewsStory?.fields?.backTime as
		| string
		| undefined

	if (backTime) {
		manifest.rundown.endIsBreak = true
	}

	return manifest
}

function getRundownPlaylistInfoINewsPlaylist(
	_context: IStudioUserContext,
	rundowns: IBlueprintRundownDB[],
	resultPlaylist: BlueprintResultRundownPlaylist
): BlueprintResultRundownPlaylist {
	return literal<BlueprintResultRundownPlaylist>({
		...resultPlaylist,
		order: rundowns.reduce((prev, curr) => {
			let rankMatch = curr.externalId.match(/_(\d+)$/)
			prev[curr.externalId] = rankMatch ? Number(rankMatch[1]) : 0
			return prev
		}, {} as BlueprintResultOrderedRundowns)
	})
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

export function GetRundownWithMixins(
	getRundown: ShowStyleBlueprintManifest['getRundown'],
	mixins: Array<GetRundownMixin>
) {
	return (context: IShowStyleUserContext, ingestRundown: ExtendedIngestRundown) => {
		let result = getRundown(context, ingestRundown)

		for (const mixin of mixins) {
			result = mixin(context, ingestRundown, result)
		}

		return result
	}
}

export function GetRundownPlaylistInfoWithMixins(
	getRundownPlaylistInfo: StudioBlueprintManifest['getRundownPlaylistInfo'] | undefined,
	mixins: Array<GetRundownPlaylistInfoMixin>
) {
	return (context: IStudioUserContext, rundowns: IBlueprintRundownDB[]) => {
		let sortedRundowns = rundowns.sort((a, b) => {
			const getRank = (externalId: string): number => {
				const match = externalId.match(/_(\d+)/)
				if (match) {
					return Number(match[1])
				}

				return 0
			}

			return getRank(a.externalId) - getRank(b.externalId)
		})
		let result =
			(getRundownPlaylistInfo ? getRundownPlaylistInfo(context, rundowns) : undefined) ??
			literal<BlueprintResultRundownPlaylist>({
				playlist: literal<IBlueprintRundownPlaylistInfo>({
					name: (rundowns[0] ?? { name: '' }).name,
					expectedEnd: sortedRundowns[sortedRundowns.length - 1]?.expectedEnd,
					expectedDuration: sortedRundowns.reduce((prev, curr) => prev + (curr.expectedDuration ?? 0), 0)
				}),
				order: null
			})

		for (const mixin of mixins) {
			result = mixin(context, rundowns, result)
		}

		return result
	}
}

export enum ShowStyleManifestMixinINews {
	INewsPlaylist = 'inews-playlist',
	BackTime = 'inews-back-time',
	CommercialBreakBackTime = 'inews-commercial-break-back-time'
}

export enum StudioManifestMixinINews {
	INewsPlaylist = 'inews-playlist'
}

export function GetShowStyleManifestWithMixins(
	manifest: ShowStyleBlueprintManifest,
	mixins: Array<ShowStyleManifestMixinINews>
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
			case ShowStyleManifestMixinINews.CommercialBreakBackTime:
				getRundownMixins.push(getRundownWithCommercialBreakBackTime)
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
	mixins: Array<StudioManifestMixinINews>
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
