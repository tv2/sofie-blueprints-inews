import { DeviceType, TimelineObjAbstractAny } from 'timeline-state-resolver-types'
import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
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
import { AdlibTags, CueType, Enablers, MEDIA_PLAYER_AUTO } from 'tv2-constants'
import {
	OfftubeAbstractLLayer,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../../tv2_offtube_studio/layers'
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
					MEPGM: OfftubeAtemLLayer.AtemMEProgram
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

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, { adlibsOnly: true })

	adlibServer = MergePiecesAsTimeline(context, config, partDefinition, adlibServer, [
		CueType.Grafik,
		CueType.TargetEngine,
		CueType.VIZ
	])

	adLibPieces.push(adlibServer)

	// TODO: Clean up
	const adlibServerFlowProducer: IBlueprintAdLibPiece = CreateAdlibServer(
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
	adlibServerFlowProducer.toBeQueued = true
	adlibServerFlowProducer.tags = ['flow_producer']
	adlibServerFlowProducer.canCombineQueue = false
	adlibServerFlowProducer.name = file
	adlibServerFlowProducer.infiniteMode = PieceLifespan.OutOnNextPart
	adlibServerFlowProducer.externalId = `${adlibServerFlowProducer.externalId}-flowProducer`
	adlibServerFlowProducer.content!.timelineObjects.push(
		literal<TimelineObjAbstractAny>({
			id: '',
			enable: {
				while: '1'
			},
			priority: 1,
			layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
			content: {
				deviceType: DeviceType.ABSTRACT
			},
			classes: [Enablers.OFFTUBE_ENABLE_SERVER]
		})
	)

	adLibPieces.push(adlibServerFlowProducer)

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
