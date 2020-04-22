import { BlueprintResultPart, IBlueprintAdLibPiece } from 'tv-automation-sofie-blueprints-integration'
import { CreateAdlibServer, CreatePartServerBase, PartContext2, PartDefinition } from 'tv2-common'
import { AdlibTags, CueType, Enablers, MEDIA_PLAYER_AUTO } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { MergePiecesAsTimeline } from '../helpers/MergePiecesAsTimeline'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeCreatePartServer(
	context: PartContext2,
	config: OffTubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition
): BlueprintResultPart {
	const basePartProps = CreatePartServerBase(context, config, partDefinition)

	if (basePartProps.invalid) {
		return basePartProps.part
	}

	const part = basePartProps.part.part
	const pieces = basePartProps.part.pieces
	const adLibPieces = basePartProps.part.adLibPieces
	const file = basePartProps.file

	// TODO: EFFEKT
	/*part = {
		...part,
		...CreateEffektForpart(context, config, partDefinition, pieces)
	}*/

	let adlibServer: IBlueprintAdLibPiece = CreateAdlibServer(
		config,
		0,
		partDefinition.externalId,
		MEDIA_PLAYER_AUTO,
		partDefinition,
		file,
		false,
		{
			PgmServer: OffTubeSourceLayer.SelectedAdLibServer,
			PgmVoiceOver: OffTubeSourceLayer.SelectedAdLibVoiceOver,
			Caspar: {
				ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
			},
			ATEM: {
				MEPGM: OfftubeAtemLLayer.AtemMEProgram
			},
			Sisyfos: {
				ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
			}
		},
		{
			isOfftube: true,
			tagAsAdlib: true,
			enabler: Enablers.OFFTUBE_ENABLE_SERVER
		}
	)
	adlibServer.toBeQueued = true
	adlibServer.canCombineQueue = true
	adlibServer.tags = [AdlibTags.OFFTUBE_100pc_SERVER]
	adlibServer.name = file

	// TODO: Merge graphics into server part as timeline objects
	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, {
		adlibsOnly: true
	})

	adlibServer = MergePiecesAsTimeline(context, config, partDefinition, adlibServer, [
		CueType.Grafik,
		CueType.TargetEngine,
		CueType.VIZ
	])
	adLibPieces.push(adlibServer)
	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
