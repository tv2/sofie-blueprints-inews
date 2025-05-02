import { VTContent, WithTimeline } from '@sofie-automation/blueprints-integration'
import { IBlueprintActionManifest, IBlueprintPiece, PieceLifespan } from 'blueprints-integration'
import {
	ActionSelectJingle,
	CreateJingleContentBase,
	CueDefinitionJingle,
	generateExternalId,
	GetJinglePartProperties,
	GetTagForJingle,
	GetTagForJingleNext,
	getTimeFromFrames,
	PartDefinition,
	PieceMetaData,
	SegmentContext,
	t,
	TableConfigItemBreaker
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayer, TallyTags } from 'tv2-constants'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { PlayoutContentType } from '../../tv2-constants/tv2-playout-content'
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateJingle(
	context: SegmentContext<OfftubeBlueprintConfig>,
	pieces: Array<IBlueprintPiece<PieceMetaData>>,
	actions: IBlueprintActionManifest[],
	parsedCue: CueDefinitionJingle,
	part: PartDefinition,
	_adlib?: boolean,
	_rank?: number,
	effekt?: boolean
) {
	let file = ''

	const jingle = context.config.showStyle.BreakerConfig.find((brkr) =>
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
				...createJingleContentOfftube(context, file, jingle)
			},
			tags: [AdlibTags.OFFTUBE_100pc_SERVER, AdlibTags.ADLIB_KOMMENTATOR],
			currentPieceTags: [GetTagForJingle(part.segmentExternalId, parsedCue.clip)],
			nextPieceTags: [GetTagForJingleNext(part.segmentExternalId, parsedCue.clip)]
		}
	})

	const jingleContent: WithTimeline<VTContent> = createJingleContentOfftube(context, file, jingle)
	pieces.push({
		externalId: `${part.externalId}-JINGLE`,
		name: effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip,
		enable: {
			start: 0
		},
		lifespan: PieceLifespan.WithinPart,
		outputLayerId: SharedOutputLayer.JINGLE,
		sourceLayerId: OfftubeSourceLayer.PgmJingle,
		prerollDuration: context.config.studio.CasparPrerollDuration + getTimeFromFrames(Number(jingle.StartAlpha)),
		content: jingleContent,
		tags: [
			GetTagForJingle(part.segmentExternalId, parsedCue.clip),
			GetTagForJingleNext(part.segmentExternalId, parsedCue.clip),
			TallyTags.JINGLE_IS_LIVE,
			!effekt ? TallyTags.JINGLE : ''
		],
		metaData: {
			playoutContent: {
				type: PlayoutContentType.JINGLE
			},
			outputLayer: Tv2OutputLayer.JINGLE,
			sourceName: jingleContent.fileName
		}
	})
}

export function createJingleContentOfftube(
	context: SegmentContext<OfftubeBlueprintConfig>,
	file: string,
	breakerConfig: TableConfigItemBreaker
) {
	return CreateJingleContentBase(context, file, breakerConfig, {
		Caspar: {
			PlayerJingle: OfftubeCasparLLayer.CasparPlayerJingle,
			PlayerJinglePreload: OfftubeCasparLLayer.CasparPlayerJinglePreload
		},
		Sisyfos: {
			PlayerJingle: OfftubeSisyfosLLayer.SisyfosSourceJingle
		}
	})
}
