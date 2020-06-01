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
	GetSisyfosTimelineObjForCamera,
	literal,
	MakeContentServer,
	PartDefinition
} from 'tv2-common'
import { AdlibTags, CueType, Enablers } from 'tv2-constants'
import {
	OfftubeAbstractLLayer,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { MergePiecesAsTimeline } from '../helpers/MergePiecesAsTimeline'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeCreatePartVO(
	context: PartContext,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	segmentExternalId: string,
	_totalWords: number,
	_totalTime: number
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
	// const sanitisedScript = partDefinition.script.replace(/\n/g, '').replace(/\r/g, '')

	// TODO: EFFEKT
	// part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: 'pgm',
			sourceLayerId: OfftubeSourceLayer.PgmVoiceOver,
			infiniteMode: PieceLifespan.OutOnNextPart,
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [segmentExternalId]
			}),
			content: MakeContentServer(file, `adlib_server_${file}`, partDefinition, config, {
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
		`adlib_server_${file}`,
		partDefinition,
		file,
		true,
		{
			PgmServer: OfftubeSourceLayer.SelectedAdLibServer,
			PgmVoiceOver: OfftubeSourceLayer.SelectedAdLibVoiceOver,
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
			enabler: Enablers.OFFTUBE_ENABLE_SERVER,
			serverEnable: OfftubeAbstractLLayer.OfftubeAbstractLLayerServerEnable
		}
	)
	adlibServer.toBeQueued = true
	adlibServer.canCombineQueue = true
	adlibServer.tags = [AdlibTags.OFFTUBE_ADLIB_SERVER, AdlibTags.ADLIB_KOMMENTATOR]
	// TODO: This breaks infinites
	// adlibServer.expectedDuration = (sanitisedScript.length / totalWords) * (totalTime * 1000 - duration) + duration
	adlibServer.content?.timelineObjects.push(...GetSisyfosTimelineObjForCamera(context, config, 'server'))

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, {})

	adlibServer = MergePiecesAsTimeline(context, config, partDefinition, adlibServer, [
		CueType.Grafik,
		CueType.TargetEngine,
		CueType.VIZ
	])

	adLibPieces.push(adlibServer)

	AddScript(partDefinition, pieces, duration, OfftubeSourceLayer.PgmScript)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
