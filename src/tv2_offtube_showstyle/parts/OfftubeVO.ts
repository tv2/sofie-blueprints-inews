import { BlueprintResultPart, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { CreateAdlibServer, CreatePartServerBase, PartDefinition } from 'tv2-common'
import { AdlibTags, Enablers, MEDIA_PLAYER_AUTO } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { GetSisyfosTimelineObjForCamera } from '../helpers/sisyfos'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeCreatePartVO(
	context: PartContext,
	config: OffTubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number,
	totalTime: number
): BlueprintResultPart {
	const basePartProps = CreatePartServerBase(context, config, partDefinition)

	if (basePartProps.invalid) {
		return basePartProps.part
	}

	const part = basePartProps.part.part
	const pieces = basePartProps.part.pieces
	const adLibPieces = basePartProps.part.adLibPieces
	const file = basePartProps.file
	const duration = basePartProps.duration
	const sanitisedScript = partDefinition.script.replace(/\n/g, '').replace(/\r/g, '')

	// TODO: EFFEKT
	// part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	const adlibServer = CreateAdlibServer(
		config,
		0,
		partDefinition.externalId,
		MEDIA_PLAYER_AUTO,
		partDefinition,
		file,
		true,
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
	adlibServer.tags = [AdlibTags.OFFTUBE_ADLIB_SERVER]
	adlibServer.expectedDuration = (sanitisedScript.length / totalWords) * (totalTime * 1000 - duration) + duration
	adlibServer.content?.timelineObjects.push(...GetSisyfosTimelineObjForCamera('server'))
	adLibPieces.push(adlibServer)

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
