import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPiece, PieceLifespan } from 'blueprints-integration'
import {
	ActionSelectJingle,
	CreateJingleContentBase,
	CueDefinitionJingle,
	ExtendedSegmentContext,
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
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateJingle(
	context: ExtendedSegmentContext<OfftubeBlueprintConfig>,
	pieces: Array<IBlueprintPiece<PieceMetaData>>,
	_adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	parsedCue: CueDefinitionJingle,
	part: PartDefinition,
	_adlib?: boolean,
	_rank?: number,
	effekt?: boolean
) {
	if (!context.config.showStyle.BreakerConfig) {
		context.core.notifyUserWarning(`Jingles have not been configured`)
		return
	}

	let file = ''

	const jingle = context.config.showStyle.BreakerConfig.find(brkr =>
		brkr.BreakerName ? brkr.BreakerName.toString().toUpperCase() === parsedCue.clip.toUpperCase() : false
	)
	if (!jingle) {
		context.core.notifyUserWarning(`Jingle ${parsedCue.clip} is not configured`)
		return
	} else {
		file = jingle.ClipName.toString()
	}

	const p = GetJinglePartProperties(context, part)

	if (JSON.stringify(p) === JSON.stringify({})) {
		context.core.notifyUserWarning(`Could not create adlib for ${parsedCue.clip}`)
		return
	}

	const userData: ActionSelectJingle = {
		type: AdlibActionType.SELECT_JINGLE,
		clip: parsedCue.clip,
		segmentExternalId: part.segmentExternalId
	}
	actions.push({
		externalId: generateExternalId(context.core, userData),
		actionId: AdlibActionType.SELECT_JINGLE,
		userData,
		userDataManifest: {},
		display: {
			label: t(effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip),
			sourceLayerId: OfftubeSourceLayer.PgmJingle,
			outputLayerId: OfftubeOutputLayers.JINGLE,
			content: {
				...createJingleContentOfftube(
					context,
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
		prerollDuration: context.config.studio.CasparPrerollDuration + TimeFromFrames(Number(jingle.StartAlpha)),
		content: createJingleContentOfftube(
			context,
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
	context: ExtendedSegmentContext<OfftubeBlueprintConfig>,
	file: string,
	alphaAtStart: number,
	loadFirstFrame: boolean,
	duration: number,
	alphaAtEnd: number
) {
	return CreateJingleContentBase(context, file, alphaAtStart, loadFirstFrame, duration, alphaAtEnd, {
		Caspar: {
			PlayerJingle: OfftubeCasparLLayer.CasparPlayerJingle,
			PlayerJinglePreload: OfftubeCasparLLayer.CasparPlayerJinglePreload
		},
		Sisyfos: {
			PlayerJingle: OfftubeSisyfosLLayer.SisyfosSourceJingle
		}
	})
}
