import {
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	RemoteContent,
	SourceLayerType,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from '@sofie-automation/blueprints-integration'
import {
	AddParentClass,
	createEmptyObject,
	CueDefinitionEkstern,
	EksternParentClass,
	FindSourceInfoStrict,
	GetEksternMetaData,
	GetLayersForEkstern,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	literal,
	PartDefinition,
	PartToParentClass,
	TransitionFromString,
	TransitionSettings,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { ControlClasses, SharedOutputLayers } from 'tv2-constants'
import { GetTagForLive } from '../pieces'

interface EksternLayers {
	SourceLayer: {
		PgmLive: string
	}
	ATEM: {
		MEProgram: string
	}
	Sisyfos: {
		StudioMics: string
	}
}

export function EvaluateEksternBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: IShowStyleUserContext,
	config: ShowStyleConfig,
	part: IBlueprintPart,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionEkstern,
	partDefinition: PartDefinition,
	layersEkstern: EksternLayers,
	adlib?: boolean,
	rank?: number
) {
	const matchesEksternSource = /^(?:LIVE|SKYPE|FEED) ?([^\s]+)(?: (.+))?$/i
	const eksternProps = parsedCue.source.match(matchesEksternSource)
	if (!eksternProps) {
		context.notifyUserWarning(`No source entered for EKSTERN`)
		part.invalid = true
		return
	}
	const source = eksternProps[1]
	if (!source) {
		context.notifyUserWarning(`Could not find live source for ${parsedCue.source}`)
		part.invalid = true
		return
	}
	const sourceInfoEkstern = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, parsedCue.source)
	if (sourceInfoEkstern === undefined) {
		context.notifyUserWarning(`${parsedCue.source} does not exist in this studio`)
		part.invalid = true
		return
	}
	const atemInput = sourceInfoEkstern.port

	const layers = GetLayersForEkstern(context, config.sources, parsedCue.source)

	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: eksternProps[0],
				outputLayerId: SharedOutputLayers.PGM,
				sourceLayerId: layersEkstern.SourceLayer.PgmLive,
				toBeQueued: true,
				lifespan: PieceLifespan.WithinPart,
				metaData: GetEksternMetaData(config.stickyLayers, config.studio.StudioMics, layers),
				content: literal<WithTimeline<RemoteContent>>({
					studioLabel: '',
					switcherInput: atemInput,
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TSR.TimelineObjAtemME>({
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
									transition: partDefinition.transition
										? TransitionFromString(partDefinition.transition.style)
										: TSR.AtemTransitionStyle.CUT,
									transitionSettings: TransitionSettings(partDefinition)
								}
							}
						}),

						...GetSisyfosTimelineObjForEkstern(context, config.sources, parsedCue.source, GetLayersForEkstern),
						GetSisyfosTimelineObjForCamera(context, config, 'telefon', layersEkstern.Sisyfos.StudioMics)
					])
				})
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				externalId: partId,
				name: eksternProps[0],
				enable: {
					start: 0
				},
				outputLayerId: SharedOutputLayers.PGM,
				sourceLayerId: layersEkstern.SourceLayer.PgmLive,
				lifespan: PieceLifespan.WithinPart,
				toBeQueued: true,
				metaData: GetEksternMetaData(config.stickyLayers, config.studio.StudioMics, layers),
				tags: [GetTagForLive(sourceInfoEkstern.id)],
				content: literal<WithTimeline<RemoteContent>>({
					studioLabel: '',
					switcherInput: atemInput,
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						createEmptyObject({
							// Only want the ident for original versions (or clones)
							enable: { start: 0 },
							layer: 'ekstern_enable_ident',
							classes: [ControlClasses.ShowIdentGraphic, PartToParentClass('studio0', partDefinition) ?? '']
						}),
						literal<TSR.TimelineObjAtemME>({
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
									transition: partDefinition.transition
										? TransitionFromString(partDefinition.transition.style)
										: TSR.AtemTransitionStyle.CUT,
									transitionSettings: TransitionSettings(partDefinition)
								}
							},
							...(AddParentClass(config, partDefinition)
								? { classes: [EksternParentClass('studio0', parsedCue.source)] }
								: {})
						}),

						...GetSisyfosTimelineObjForEkstern(context, config.sources, parsedCue.source, GetLayersForEkstern),
						GetSisyfosTimelineObjForCamera(context, config, 'telefon', layersEkstern.Sisyfos.StudioMics)
					])
				})
			})
		)
	}
}
