import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	PieceMetaData,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddScript,
	CreateAdlibServer,
	CreatePartServerBase,
	literal,
	MakeContentServer,
	PartDefinition,
	TimelineBlueprintExt
} from 'tv2-common'
import { AdlibTags, ControlClasses, CueType, Enablers } from 'tv2-constants'
import {
	OfftubeAbstractLLayer,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { MergePiecesAsTimeline } from '../helpers/MergePiecesAsTimeline'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeCreatePartServer(
	context: PartContext,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	_segmentExternalId: string
): BlueprintResultPart {
	const basePartProps = CreatePartServerBase(context, config, partDefinition)

	if (basePartProps.invalid) {
		return basePartProps.part
	}

	let part = basePartProps.part.part
	const pieces = basePartProps.part.pieces
	const adLibPieces = basePartProps.part.adLibPieces
	const file = basePartProps.file
	const duration = basePartProps.duration

	part = {
		...part
		// TODO: Effekt
		// ...CreateEffektForpart(context, config, partDefinition, pieces)
	}

	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: 'pgm',
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
		})
	)

	let adlibServer: IBlueprintAdLibPiece = CreateAdlibServer(
		config,
		0,
		partDefinition.externalId,
		`adlib_server_${file}`,
		partDefinition,
		file,
		false,
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
		duration,
		{
			isOfftube: true,
			tagAsAdlib: true,
			enabler: Enablers.OFFTUBE_ENABLE_SERVER,
			serverEnable: OfftubeAbstractLLayer.OfftubeAbstractLLayerServerEnable
		}
	)
	adlibServer.toBeQueued = true
	adlibServer.canCombineQueue = true
	adlibServer.outputLayerId = 'selectedAdlib'
	adlibServer.tags = [AdlibTags.OFFTUBE_100pc_SERVER, AdlibTags.ADLIB_KOMMENTATOR]
	// HACK: Replace with adlib action
	adlibServer.additionalPieces = [
		literal<IBlueprintAdLibPiece>({
			_rank: 0,
			externalId: 'setNextToServer',
			name: 'Server',
			sourceLayerId: OfftubeSourceLayer.PgmServer,
			outputLayerId: OfftubeOutputLayers.PGM,
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: true,
			canCombineQueue: true,
			content: {
				timelineObjects: [
					literal<TSR.TimelineObjAbstractAny>({
						id: 'serverProgramEnabler',
						enable: {
							while: '1'
						},
						priority: 1,
						layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
						content: {
							deviceType: TSR.DeviceType.ABSTRACT
						},
						classes: [Enablers.OFFTUBE_ENABLE_SERVER]
					}),
					literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
						id: '',
						enable: { start: 0 },
						priority: 0,
						layer: OfftubeAtemLLayer.AtemMENext,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.ME,
							me: {
								previewInput: undefined
							}
						},
						metaData: {
							context: `Lookahead-lookahead for serverProgramEnabler`
						},
						classes: ['ab_on_preview', ControlClasses.CopyMediaPlayerSession, Enablers.OFFTUBE_ENABLE_SERVER_LOOKAHEAD]
					})
				]
			},
			tags: [AdlibTags.OFFTUBE_SET_SERVER_NEXT]
		})
	]
	// TODO: This should happen in above function
	// TODO: This breaks infinites
	// adlibServer.expectedDuration = duration

	// TODO: Merge graphics into server part as timeline objects
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
