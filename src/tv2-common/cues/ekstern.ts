import {
	IBlueprintPart,
	PieceLifespan,
	RemoteContent,
	TimelineObjectCoreExt,
	WithTimeline
} from 'blueprints-integration'
import {
	CueDefinitionEkstern,
	EvaluateCueResult,
	literal,
	PartDefinition,
	ShowStyleContext,
	TransitionStyle,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { ControlClasses, SharedOutputLayer, SourceType } from 'tv2-constants'
import { GetSisyfosTimelineObjForRemote } from '../helpers'
import { GetTagForLive } from '../pieces'
import { findSourceInfo } from '../sources'

interface EksternLayers {
	SourceLayer: {
		PgmLive: string
	}
}

export function EvaluateEksternBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ShowStyleContext<ShowStyleConfig>,
	part: IBlueprintPart,
	partId: string,
	parsedCue: CueDefinitionEkstern,
	partDefinition: PartDefinition,
	layersEkstern: EksternLayers,
	adlib?: boolean,
	rank?: number
): EvaluateCueResult {
	const result = new EvaluateCueResult()
	const sourceInfoEkstern = findSourceInfo(context.config.sources, parsedCue.sourceDefinition)
	if (parsedCue.sourceDefinition.sourceType !== SourceType.REMOTE || sourceInfoEkstern === undefined) {
		context.core.notifyUserWarning(`EKSTERN source is not valid: "${parsedCue.sourceDefinition.raw}"`)
		part.invalid = true
		return result
	}
	const switcherInput = sourceInfoEkstern.port

	if (adlib) {
		result.adlibPieces.push({
			_rank: rank || 0,
			externalId: partId,
			name: parsedCue.sourceDefinition.name,
			outputLayerId: SharedOutputLayer.PGM,
			sourceLayerId: layersEkstern.SourceLayer.PgmLive,
			toBeQueued: true,
			lifespan: PieceLifespan.WithinPart,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: sourceInfoEkstern.sisyfosLayers ?? [],
					wantsToPersistAudio: sourceInfoEkstern.wantsToPersistAudio,
					acceptPersistAudio: sourceInfoEkstern.acceptPersistAudio
				}
			},
			content: literal<WithTimeline<RemoteContent>>({
				studioLabel: '',
				switcherInput,
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					...context.videoSwitcher.getOnAirTimelineObjects({
						priority: 1,
						content: {
							input: switcherInput,
							transition: partDefinition.transition?.style ?? TransitionStyle.CUT,
							transitionDuration: partDefinition.transition?.duration
						},
						classes: [ControlClasses.OVERRIDDEN_ON_MIX_MINUS]
					}),

					...GetSisyfosTimelineObjForRemote(context.config, sourceInfoEkstern)
				])
			})
		})
		return result
	}
	result.pieces.push({
		externalId: partId,
		name: parsedCue.sourceDefinition.name,
		enable: {
			start: 0
		},
		outputLayerId: SharedOutputLayer.PGM,
		sourceLayerId: layersEkstern.SourceLayer.PgmLive,
		lifespan: PieceLifespan.WithinPart,
		toBeQueued: true,
		metaData: {
			sisyfosPersistMetaData: {
				sisyfosLayers: sourceInfoEkstern.sisyfosLayers ?? [],
				wantsToPersistAudio: sourceInfoEkstern.wantsToPersistAudio,
				acceptPersistAudio: sourceInfoEkstern.acceptPersistAudio
			}
		},
		tags: [GetTagForLive(parsedCue.sourceDefinition)],
		content: literal<WithTimeline<RemoteContent>>({
			studioLabel: '',
			switcherInput,
			timelineObjects: literal<TimelineObjectCoreExt[]>([
				...context.videoSwitcher.getOnAirTimelineObjects({
					priority: 1,
					content: {
						input: switcherInput,
						transition: partDefinition.transition?.style ?? TransitionStyle.CUT,
						transitionDuration: partDefinition.transition?.duration
					},
					classes: [ControlClasses.OVERRIDDEN_ON_MIX_MINUS]
				}),

				...GetSisyfosTimelineObjForRemote(context.config, sourceInfoEkstern)
			])
		})
	})
	return result
}
