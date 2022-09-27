import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext,
	PieceLifespan
} from 'blueprints-integration'
import {
	ActionSelectJingle,
	CreateJingleContentBase,
	CueDefinitionJingle,
	generateExternalId,
	GetJinglePartProperties,
	GetTagForJingle,
	GetTagForJingleNext,
	PartDefinition,
	PieceMetaData,
	t,
	TimeFromFrames
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayers, TallyTags } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateJingle(
	context: ISegmentUserContext,
	config: OfftubeShowstyleBlueprintConfig,
	pieces: Array<IBlueprintPiece<PieceMetaData>>,
	_adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	parsedCue: CueDefinitionJingle,
	part: PartDefinition,
	_adlib?: boolean,
	_rank?: number,
	effekt?: boolean
) {
	if (!config.showStyle.BreakerConfig) {
		context.notifyUserWarning(`Jingles have not been configured`)
		return
	}

	let file = ''

	const jingle = config.showStyle.BreakerConfig.find(brkr =>
		brkr.BreakerName ? brkr.BreakerName.toString().toUpperCase() === parsedCue.clip.toUpperCase() : false
	)
	if (!jingle) {
		context.notifyUserWarning(`Jingle ${parsedCue.clip} is not configured`)
		return
	} else {
		file = jingle.ClipName.toString()
	}

	const p = GetJinglePartProperties(context, config, part)

	if (JSON.stringify(p) === JSON.stringify({})) {
		context.notifyUserWarning(`Could not create adlib for ${parsedCue.clip}`)
		return
	}

	const userData: ActionSelectJingle = {
		type: AdlibActionType.SELECT_JINGLE,
		clip: parsedCue.clip,
		segmentExternalId: part.segmentExternalId
	}
	actions.push({
		externalId: generateExternalId(context, userData),
		actionId: AdlibActionType.SELECT_JINGLE,
		userData,
		userDataManifest: {},
		display: {
			label: t(effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip),
			sourceLayerId: OfftubeSourceLayer.PgmJingle,
			outputLayerId: OfftubeOutputLayers.JINGLE,
			content: {
				...createJingleContentOfftube(
					config,
					file,
					jingle.StartAlpha,
					jingle.LoadFirstFrame,
					jingle.Duration,
					jingle.EndAlpha
				)
			},
			tags: [AdlibTags.OFFTUBE_100pc_SERVER, AdlibTags.ADLIB_KOMMENTATOR],
			currentPieceTags: [GetTagForJingle(part.segmentExternalId, parsedCue.clip)],
			nextPieceTags: [GetTagForJingleNext(part.segmentExternalId, parsedCue.clip)]
		}
	})

	pieces.push({
		externalId: `${part.externalId}-JINGLE`,
		name: effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip,
		enable: {
			start: 0
		},
		lifespan: PieceLifespan.WithinPart,
		outputLayerId: SharedOutputLayers.JINGLE,
		sourceLayerId: OfftubeSourceLayer.PgmJingle,
		metaData: {
			sisyfosPersistMetaData: {
				sisyfosLayers: []
			}
		},
		prerollDuration: config.studio.CasparPrerollDuration + TimeFromFrames(Number(jingle.StartAlpha)),
		content: createJingleContentOfftube(
			config,
			file,
			jingle.StartAlpha,
			jingle.LoadFirstFrame,
			jingle.Duration,
			jingle.EndAlpha
		),
		tags: [
			GetTagForJingle(part.segmentExternalId, parsedCue.clip),
			GetTagForJingleNext(part.segmentExternalId, parsedCue.clip),
			TallyTags.JINGLE_IS_LIVE,
			!effekt ? TallyTags.JINGLE : ''
		]
	})
}

export function createJingleContentOfftube(
	config: OfftubeShowstyleBlueprintConfig,
	file: string,
	alphaAtStart: number,
	loadFirstFrame: boolean,
	duration: number,
	alphaAtEnd: number
) {
	return CreateJingleContentBase(config, file, alphaAtStart, loadFirstFrame, duration, alphaAtEnd, {
		Caspar: {
			PlayerJingle: OfftubeCasparLLayer.CasparPlayerJingle,
			PlayerJinglePreload: OfftubeCasparLLayer.CasparPlayerJinglePreload
		},
		ATEM: {
			USKJinglePreview: OfftubeAtemLLayer.AtemMENextJingle
		},
		Sisyfos: {
			PlayerJingle: OfftubeSisyfosLLayer.SisyfosSourceJingle
		}
	})
}
