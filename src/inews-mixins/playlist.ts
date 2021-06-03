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
import { literal } from 'tv2-common'

function getRundownWithINewsPlaylist(
	_context: IShowStyleUserContext,
	ingestRundown: ExtendedIngestRundown,
	manifest: BlueprintResultRundown
): BlueprintResultRundown {
	manifest.rundown.playlistExternalId = ingestRundown.payload.playlistExternalId
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
					expectedEnd: sortedRundowns[sortedRundowns.length - 1]?.expectedEnd
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
	INewsPlaylist = 'inews-playlist'
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
		}
	}

	manifest.getRundownPlaylistInfo = GetRundownPlaylistInfoWithMixins(manifest.getRundownPlaylistInfo, getPlaylistMixins)

	return manifest
}
