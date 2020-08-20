import {
	BlueprintResultTimeline,
	IBlueprintResolvedPieceInstance,
	OnGenerateTimelineObj,
	PartEndState,
	PartEventContext,
	TimelinePersistentState
} from 'tv-automation-sofie-blueprints-integration'
import { onTimelineGenerate } from 'tv2-common'
import {
	CasparPlayerClip,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../tv2_offtube_studio/layers'
import { getConfig } from './helpers/config'

export function onTimelineGenerateOfftube(
	context: PartEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintResolvedPieceInstance[]
): Promise<BlueprintResultTimeline> {
	// If we are not in a server, then disable the server adlib piece
	/*const currentPartId = context.part._id
	const currentPieces: { [id: string]: IBlueprintResolvedPieceInstance } = {}
	for (const piece of resolvedPieces) {
		if (piece.piece.partId === currentPartId) {
			currentPieces[piece._id] = piece
		}
	}
	const currentServerOnAir = Object.values(currentPieces).find(
		p => p.piece.sourceLayerId === OfftubeSourceLayer.PgmServer
	)
	if (!currentServerOnAir) {
		const currentAdlibServerPieceGroup = timeline.find(
			obj =>
				obj.isGroup &&
				(obj.layer === OfftubeSourceLayer.SelectedAdLibServer ||
					obj.layer === OfftubeSourceLayer.SelectedAdLibVoiceOver) &&
				obj.pieceInstanceId &&
				currentPieces[obj.pieceInstanceId]
		)
		if (currentAdlibServerPieceGroup) {
			const enableObj = timeline.find(
				obj =>
					(obj as any).inGroup === currentAdlibServerPieceGroup.id &&
					obj.layer === OfftubeAbstractLLayer.OfftubeAbstractLLayerServerEnable
			)
			if (enableObj) {
				// This is the master object that looks for the class coming from OfftubeSourceLayer.PgmServer to say it is on air. We know that doesnt exist here, so ignore it
				enableObj.enable = { while: '0' }
			}
		}
	}*/

	return onTimelineGenerate(
		context,
		timeline,
		previousPersistentState,
		previousPartEndState,
		resolvedPieces,
		getConfig,
		{
			Caspar: {
				ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending,
				PlayerClip: CasparPlayerClip
			},
			Sisyfos: {
				ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
				PlayerA: OfftubeSisyfosLLayer.SisyfosSourceServerA,
				PlayerB: OfftubeSisyfosLLayer.SisyfosSourceServerB
			}
		},
		OfftubeCasparLLayer.CasparPlayerClipPending,
		OfftubeAtemLLayer.AtemMENext
	)
}
