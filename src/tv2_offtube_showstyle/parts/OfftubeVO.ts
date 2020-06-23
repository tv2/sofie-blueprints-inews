import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	PieceMetaData,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddScript,
	CreateAdlibServer,
	CreatePartServerBase,
	GetSisyfosTimelineObjForCamera,
	getStickyLayers,
	literal,
	MakeContentServer,
	PartContext2,
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

export function OfftubeCreatePartVO(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	_segmentExternalId: string,
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
	const actualDuration = (sanitisedScript.length / totalWords) * (totalTime * 1000 - duration) + duration
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
				actualDuration
			),
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
			},
			STICKY_LAYERS: getStickyLayers(config.studio)
		},
		actualDuration,
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
	adlibServer.tags = [AdlibTags.OFFTUBE_ADLIB_SERVER, AdlibTags.ADLIB_KOMMENTATOR]
	// TODO: This breaks infinites
	// adlibServer.expectedDuration = (sanitisedScript.length / totalWords) * (totalTime * 1000 - duration) + duration
	adlibServer.content?.timelineObjects.push(...GetSisyfosTimelineObjForCamera(context, config, 'server'))
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

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, {})

	adlibServer = MergePiecesAsTimeline(context, config, partDefinition, adlibServer, [
		CueType.Grafik,
		CueType.TargetEngine,
		CueType.VIZ
	])

	adLibPieces.push(adlibServer)

	AddScript(partDefinition, pieces, actualDuration, OfftubeSourceLayer.PgmScript)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
