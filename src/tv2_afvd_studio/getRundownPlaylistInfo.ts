import {
	BlueprintResultRundownPlaylist,
	IBlueprintRundownDB,
	IBlueprintRundownPlaylistInfo,
	IStudioUserContext
} from '@sofie-automation/blueprints-integration'
import { literal } from 'tv2-common'

export function getRundownPlaylistInfo(
	_context: IStudioUserContext,
	rundowns: IBlueprintRundownDB[]
): BlueprintResultRundownPlaylist | null {
	return literal<BlueprintResultRundownPlaylist>({
		playlist: literal<IBlueprintRundownPlaylistInfo>({
			name: (rundowns[0] ?? { name: '' }).name
		}),
		order: null
	})
}
