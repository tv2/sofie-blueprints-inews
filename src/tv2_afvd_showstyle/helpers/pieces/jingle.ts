import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPiece, PieceLifespan } from 'blueprints-integration'
import {
	ActionSelectJingle,
	CreateJingleContentBase,
	CueDefinitionJingle,
	generateExternalId,
	GetTagForJingle,
	GetTagForJingleNext,
	getTimeFromFrames,
	PartDefinition,
	ShowStyleContext,
	t
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayer, TallyTags } from 'tv2-constants'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { GalleryBlueprintConfig } from '../config'

export function EvaluateJingle(
	context: ShowStyleContext<GalleryBlueprintConfig>,
	pieces: IBlueprintPiece[],
	_adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	parsedCue: CueDefinitionJingle,
	part: PartDefinition,
	adlib?: boolean,
	rank?: number,
	effekt?: boolean
) {
	if (!context.config.showStyle.BreakerConfig) {
		context.core.notifyUserWarning(`Jingles have not been configured`)
		return
	}

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

	if (adlib) {
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
				_rank: rank ?? 0,
				label: t(effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip),
				sourceLayerId: SourceLayer.PgmJingle,
				outputLayerId: SharedOutputLayer.JINGLE,
				content: {
					...createJingleContentAFVD(
						context,
						file,
						jingle.StartAlpha,
						jingle.LoadFirstFrame,
						jingle.Duration,
						jingle.EndAlpha
					)
				},
				tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
				currentPieceTags: [GetTagForJingle(part.segmentExternalId, parsedCue.clip)],
				nextPieceTags: [GetTagForJingleNext(part.segmentExternalId, parsedCue.clip)]
			}
		})
	} else {
		pieces.push({
			externalId: `${part.externalId}-JINGLE`,
			name: effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip,
			enable: {
				start: 0
			},
			lifespan: PieceLifespan.WithinPart,
			outputLayerId: SharedOutputLayer.JINGLE,
			sourceLayerId: SourceLayer.PgmJingle,
			prerollDuration: context.config.studio.CasparPrerollDuration + getTimeFromFrames(Number(jingle.StartAlpha)),
			tags: [!effekt ? TallyTags.JINGLE : ''],
			content: createJingleContentAFVD(
				context,
				file,
				jingle.StartAlpha,
				jingle.LoadFirstFrame,
				jingle.Duration,
				jingle.EndAlpha
			)
		})
	}
}

export function createJingleContentAFVD(
	context: ShowStyleContext<GalleryBlueprintConfig>,
	file: string,
	alphaAtStart: number,
	loadFirstFrame: boolean,
	duration: number,
	alphaAtEnd: number
) {
	return CreateJingleContentBase(context, file, alphaAtStart, loadFirstFrame, duration, alphaAtEnd, {
		Caspar: {
			PlayerJingle: CasparLLayer.CasparPlayerJingle
		},
		Sisyfos: {
			PlayerJingle: SisyfosLLAyer.SisyfosSourceJingle
		}
	})
}
