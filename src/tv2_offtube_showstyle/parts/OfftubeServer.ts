import { BlueprintResultPart, IBlueprintAdLibPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { CreateAdlibServer, CreatePartServerBase, PartDefinition } from 'tv2-common'
import { AdlibTags, Enablers } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeCreatePartServer(
	context: PartContext,
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

	const adlibServer: IBlueprintAdLibPiece = CreateAdlibServer(
		config,
		0,
		partDefinition.externalId,
		partDefinition.externalId,
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
	adlibServer.canCombineQueue = true
	adlibServer.tags = [AdlibTags.OFFTUBE_100pc_SERVER]
	adLibPieces.push(adlibServer)

	// TODO: Merge graphics into server part as timeline objects
	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
