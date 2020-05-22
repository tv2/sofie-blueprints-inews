import {
	BlueprintResultPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	PieceMetaData
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddScript,
	CreateAdlibServer,
	CreatePartServerBase,
	literal,
	MakeContentServer,
	PartDefinition
} from 'tv2-common'
import { AdlibTags, CueType, Enablers } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { MergePiecesAsTimeline } from '../helpers/MergePiecesAsTimeline'
import { GetSisyfosTimelineObjForCamera } from '../helpers/sisyfos'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeCreatePartVO(
	context: PartContext,
	config: OffTubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	segmentExternalId: string,
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

	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: 'pgm',
			sourceLayerId: OffTubeSourceLayer.PgmServer,
			infiniteMode: PieceLifespan.OutOnNextPart,
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [segmentExternalId]
			}),
			content: MakeContentServer(file, segmentExternalId, partDefinition, config, {
				Caspar: {
					ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
				},
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
				},
				ATEM: {
					MEPGM: OfftubeAtemLLayer.AtemMEClean
				}
			}),
			adlibPreroll: config.studio.CasparPrerollDuration
		})
	)

	let adlibServer = CreateAdlibServer(
		config,
		0,
		partDefinition.externalId,
		segmentExternalId,
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
				MEPGM: OfftubeAtemLLayer.AtemMEClean
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
	adlibServer.name = file
	adlibServer.toBeQueued = true
	adlibServer.canCombineQueue = true
	adlibServer.tags = [AdlibTags.OFFTUBE_ADLIB_SERVER]
	adlibServer.expectedDuration = (sanitisedScript.length / totalWords) * (totalTime * 1000 - duration) + duration
	adlibServer.content?.timelineObjects.push(...GetSisyfosTimelineObjForCamera('server'))

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, {})

	adlibServer = MergePiecesAsTimeline(context, config, partDefinition, adlibServer, [
		CueType.Grafik,
		CueType.TargetEngine,
		CueType.VIZ
	])

	adLibPieces.push(adlibServer)

	AddScript(partDefinition, pieces, duration, OffTubeSourceLayer.PgmScript)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
