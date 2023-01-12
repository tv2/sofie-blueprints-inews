import {
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	RemoteContent,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import {
	CueDefinitionEkstern,
	literal,
	PartDefinition,
	PieceMetaData,
	TransitionSettings,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { ControlClasses, SharedOutputLayers, SourceType } from 'tv2-constants'
import { GetSisyfosTimelineObjForRemote } from '../helpers'
import { GetTagForLive } from '../pieces'
import { findSourceInfo } from '../sources'

interface EksternLayers {
	SourceLayer: {
		PgmLive: string
	}
	ATEM: {
		MEProgram: string
	}
}

export function EvaluateEksternBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: IShowStyleUserContext,
	config: ShowStyleConfig,
	part: IBlueprintPart,
	pieces: Array<IBlueprintPiece<PieceMetaData>>,
	adlibPieces: Array<IBlueprintAdLibPiece<PieceMetaData>>,
	partId: string,
	parsedCue: CueDefinitionEkstern,
	partDefinition: PartDefinition,
	layersEkstern: EksternLayers,
	adlib?: boolean,
	rank?: number
) {
	const sourceInfoEkstern = findSourceInfo(config.sources, parsedCue.sourceDefinition)
	if (parsedCue.sourceDefinition.sourceType !== SourceType.REMOTE || sourceInfoEkstern === undefined) {
		context.notifyUserWarning(`EKSTERN source is not valid: "${parsedCue.sourceDefinition.raw}"`)
		part.invalid = true
		return
	}
	const atemInput = sourceInfoEkstern.port

	if (adlib) {
		adlibPieces.push({
			_rank: rank || 0,
			externalId: partId,
			name: parsedCue.sourceDefinition.name,
			outputLayerId: SharedOutputLayers.PGM,
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
				switcherInput: atemInput,
				timelineObjects: literal<Array<TimelineObjectCoreExt<TSR.TSRTimelineContent>>>([
					literal<TSR.TSRTimelineObj<TSR.TimelineContentAtemME>>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: layersEkstern.ATEM.MEProgram,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.ME,
							me: {
								input: atemInput,
								transition: partDefinition.transition ? partDefinition.transition.style : TSR.AtemTransitionStyle.CUT,
								transitionSettings: TransitionSettings(config, partDefinition)
							}
						},
						classes: [ControlClasses.LiveSourceOnAir]
					}),

					...GetSisyfosTimelineObjForRemote(config, sourceInfoEkstern)
				])
			})
		})
	} else {
		pieces.push({
			externalId: partId,
			name: parsedCue.sourceDefinition.name,
			enable: {
				start: 0
			},
			outputLayerId: SharedOutputLayers.PGM,
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
				switcherInput: atemInput,
				timelineObjects: literal<Array<TimelineObjectCoreExt<TSR.TSRTimelineContent>>>([
					literal<TSR.TSRTimelineObj<TSR.TimelineContentAtemME>>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: layersEkstern.ATEM.MEProgram,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.ME,
							me: {
								input: atemInput,
								transition: partDefinition.transition ? partDefinition.transition.style : TSR.AtemTransitionStyle.CUT,
								transitionSettings: TransitionSettings(config, partDefinition)
							}
						}
					}),

					...GetSisyfosTimelineObjForRemote(config, sourceInfoEkstern)
				])
			})
		})
	}
}
