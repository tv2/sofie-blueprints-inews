import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext,
	PieceLifespan
} from '@tv2media/blueprints-integration'
import {
	ActionSelectJingle,
	CreateJingleContentBase,
	CueDefinitionJingle,
	generateExternalId,
	GetTagForJingle,
	GetTagForJingleNext,
	literal,
	PartDefinition,
	t,
	TimeFromFrames
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayers, TallyTags } from 'tv2-constants'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'

export function EvaluateJingle(
	context: ISegmentUserContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	_adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	parsedCue: CueDefinitionJingle,
	part: PartDefinition,
	adlib?: boolean,
	rank?: number,
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

	if (adlib) {
		const userData = literal<ActionSelectJingle>({
			type: AdlibActionType.SELECT_JINGLE,
			clip: parsedCue.clip,
			segmentExternalId: part.segmentExternalId
		})
		actions.push(
			literal<IBlueprintActionManifest>({
				externalId: generateExternalId(context, userData),
				actionId: AdlibActionType.SELECT_JINGLE,
				userData,
				userDataManifest: {},
				display: {
					_rank: rank ?? 0,
					label: t(effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip),
					sourceLayerId: SourceLayer.PgmJingle,
					outputLayerId: SharedOutputLayers.JINGLE,
					content: {
						...createJingleContentAFVD(
							config,
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
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				externalId: `${part.externalId}-JINGLE`,
				name: effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip,
				enable: {
					start: 0
				},
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.JINGLE,
				sourceLayerId: SourceLayer.PgmJingle,
				prerollDuration: config.studio.CasparPrerollDuration + TimeFromFrames(Number(jingle.StartAlpha)),
				tags: [!effekt ? TallyTags.JINGLE : ''],
				content: createJingleContentAFVD(
					config,
					file,
					jingle.StartAlpha,
					jingle.LoadFirstFrame,
					jingle.Duration,
					jingle.EndAlpha
				)
			})
		)
	}
}

export function createJingleContentAFVD(
	config: BlueprintConfig,
	file: string,
	alphaAtStart: number,
	loadFirstFrame: boolean,
	duration: number,
	alphaAtEnd: number
) {
	const content = CreateJingleContentBase(config, file, alphaAtStart, loadFirstFrame, duration, alphaAtEnd, {
		Caspar: {
			PlayerJingle: CasparLLayer.CasparPlayerJingle
		},
		ATEM: {
			USKCleanEffekt: AtemLLayer.AtemCleanUSKEffect
		},
		Sisyfos: {
			PlayerJingle: SisyfosLLAyer.SisyfosSourceJingle
		}
	})

	return content
}
