import {
	ActionExecutionContext,
	ActionUserData,
	IBlueprintPiece,
	PieceLifespan,
	PieceMetaData
} from 'tv-automation-sofie-blueprints-integration'
import { ActionSelectServerClip, CreatePartServerBase, literal, MakeContentServer } from 'tv2-common'
import { AdlibActionType } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../tv2_offtube_studio/layers'
import { parseConfig } from './helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from './layers'

export function executeAction(context: ActionExecutionContext, actionId: string, userData: ActionUserData): void {
	switch (actionId) {
		case AdlibActionType.SELECT_SERVER_CLIP:
			executeActionSelectServerClip(context, actionId, userData as ActionSelectServerClip)
			break
	}
}

function executeActionSelectServerClip(
	context: ActionExecutionContext,
	_actionId: string,
	userData: ActionSelectServerClip
) {
	const file = userData.file
	const partDefinition = userData.partDefinition
	const duration = userData.duration
	const config = parseConfig(context)

	const part = CreatePartServerBase(context, config, partDefinition)
	context.queuePart(part.part.part, [
		literal<IBlueprintPiece>({
			_id: '',
			externalId: `adlib_action_${file}`,
			name: file,
			enable: { start: 0 },
			outputLayerId: OfftubeOutputLayers.PGM,
			sourceLayerId: OfftubeSourceLayer.PgmServer,
			infiniteMode: PieceLifespan.OutOnNextPart,
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [`adlib_server_${file}`]
			}),
			content: MakeContentServer(
				file,
				`adlib_server_${file}`,
				partDefinition,
				config,
				{
					Caspar: {
						ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
					},
					Sisyfos: {
						ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
					},
					ATEM: {
						MEPGM: OfftubeAtemLLayer.AtemMEClean
					}
				},
				duration
			),
			adlibPreroll: config.studio.CasparPrerollDuration
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: `selected_server_${file}`,
			name: file,
			enable: {
				start: 0
			},
			outputLayerId: OfftubeOutputLayers.SELECTED_ADLIB,
			sourceLayerId: OfftubeSourceLayer.SelectedAdLibServer,
			infiniteMode: PieceLifespan.OutOnNextSegment,
			metaData: {
				userData
			}
		})
	])
}
