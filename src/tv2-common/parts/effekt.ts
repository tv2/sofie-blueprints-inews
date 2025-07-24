import {
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintPieceType,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	VTContent,
	WithTimeline
} from 'blueprints-integration'
import {
	ActionTakeWithTransitionVariantDip,
	ActionTakeWithTransitionVariantMix,
	doesBreakerHaveAlphaForItsEntireDuration,
	findDskJingle,
	getBreakerMixEffectCutEnable,
	getDskOnAirTimelineObjects,
	GetTagForTransition,
	getTimeFromFrames,
	literal,
	PartDefinition,
	PieceMetaData,
	ShowStyleContext,
	TimelineBlueprintExt,
	TransitionStyle,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { DskRole, SharedOutputLayer } from 'tv2-constants'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { PlayoutContentType } from '../../tv2-constants/tv2-playout-content'
import { TV2ShowStyleConfig } from '../blueprintConfig'
import { joinAssetToFolder, joinAssetToNetworkPath } from '../util'

/** Has to be executed before calling EvaluateCues, as some cues may depend on it */
export function CreateEffektForPartBase(
	context: ShowStyleContext<TV2ShowStyleConfig>,
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[],
	layers: {
		sourceLayer: string
		casparLayer: string
		sisyfosLayer: string
	}
): Pick<IBlueprintPart, 'autoNext' | 'inTransition'> | {} {
	const effekt = partDefinition.effekt
	const transition = partDefinition.transition

	if (effekt !== undefined) {
		const ret = CreateEffektForPartInner(
			context,
			pieces,
			effekt.toString(),
			partDefinition.externalId,
			layers,
			`EFFEKT ${effekt}`
		)

		return ret ?? {}
	}

	if (transition === undefined || transition.duration === undefined) {
		return {}
	}

	if (transition.style === TransitionStyle.MIX) {
		const blueprintPiece: IBlueprintPiece =
			CreateMixTransitionBlueprintPieceForPart(partDefinition.externalId, transition.duration, layers.sourceLayer) ?? {}

		pieces.push(blueprintPiece)
		return createInTransitionForTransitionStyle(transition.duration)
	}

	if (transition.style === TransitionStyle.DIP) {
		const blueprintPiece: IBlueprintPiece =
			createDipTransitionBlueprintPieceForPart(partDefinition.externalId, transition.duration, layers.sourceLayer) ?? {}
		pieces.push(blueprintPiece)
		return createInTransitionForTransitionStyle(transition.duration)
	}

	return {}
}

export function CreateEffektForPartInner<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ShowStyleContext<ShowStyleConfig>,
	pieces: IBlueprintPiece[],
	effekt: string,
	externalId: string,
	layers: {
		sourceLayer: string
		casparLayer: string
		sisyfosLayer: string
	},
	label: string
): Pick<IBlueprintPart, 'autoNext' | 'inTransition'> | false {
	const effektConfig = context.config.showStyle.BreakerConfig.find(
		(conf) => conf.BreakerName.toString().trim().toUpperCase() === effekt.toUpperCase()
	)
	if (!effektConfig) {
		context.core.notifyUserWarning(`Could not find effekt ${effekt}`)
		return false
	}

	const file = effektConfig.ClipName.toString()

	if (!file) {
		context.core.notifyUserWarning(`Could not find file for ${effekt}`)
		return false
	}

	const fileName = joinAssetToFolder(context.config.studio.JingleFolder, file)

	const jingleDsk = findDskJingle(context.config)

	pieces.push({
		externalId,
		name: label,
		enable: {
			start: 0,
			duration: getTimeFromFrames(effektConfig.Duration) + context.config.studio.CasparPrerollDuration
		},
		outputLayerId: SharedOutputLayer.JINGLE,
		sourceLayerId: layers.sourceLayer,
		lifespan: PieceLifespan.WithinPart,
		pieceType: IBlueprintPieceType.InTransition,
		content: literal<WithTimeline<VTContent>>({
			fileName,
			path: joinAssetToNetworkPath(
				context.config.studio.JingleNetworkBasePath,
				context.config.studio.JingleFolder,
				file,
				context.config.studio.JingleFileExtension
			), // full path on the source network storage
			mediaFlowIds: [context.config.studio.JingleMediaFlowId],
			previewFrame: effektConfig.StartAlpha,
			ignoreMediaObjectStatus: context.config.studio.JingleIgnoreStatus,
			ignoreBlackFrames: true,
			ignoreFreezeFrame: true,
			timelineObjects: literal<TimelineObjectCoreExt[]>([
				literal<TSR.TimelineObjCCGMedia & TimelineBlueprintExt>({
					id: '',
					enable: {
						start: 0
					},
					priority: 1,
					layer: layers.casparLayer,
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.MEDIA,
						file: fileName
					}
				}),
				// Only add the cut to Jingle Fill if the BreakerEffect takes up the entire screen at some point during its duration
				...(doesBreakerHaveAlphaForItsEntireDuration(context, effekt)
					? []
					: context.videoSwitcher.getOnAirTimelineObjects({
							enable: getBreakerMixEffectCutEnable(effektConfig, context.config.studio.CasparPrerollDuration),
							priority: 1,
							content: {
								input: jingleDsk.Fill,
								transition: TransitionStyle.CUT
							}
					  })),
				...getDskOnAirTimelineObjects(context, DskRole.JINGLE, {
					start: context.config.studio.CasparPrerollDuration
				}),
				literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
					id: '',
					enable: {
						start: 0
					},
					priority: 1,
					layer: layers.sisyfosLayer,
					content: {
						deviceType: TSR.DeviceType.SISYFOS,
						type: TSR.TimelineContentTypeSisyfos.CHANNEL,
						isPgm: 1
					}
				})
			])
		}),
		metaData: {
			playoutContent: {
				type: PlayoutContentType.JINGLE
			},
			outputLayer: Tv2OutputLayer.JINGLE,
			sourceName: fileName
		}
	})

	return {
		inTransition: {
			blockTakeDuration: getTimeFromFrames(Number(effektConfig.Duration)) + context.config.studio.CasparPrerollDuration,
			previousPartKeepaliveDuration:
				getTimeFromFrames(Number(effektConfig.StartAlpha)) + context.config.studio.CasparPrerollDuration,
			partContentDelayDuration:
				getTimeFromFrames(Number(effektConfig.Duration)) -
				getTimeFromFrames(Number(effektConfig.EndAlpha)) +
				context.config.studio.CasparPrerollDuration
		},
		autoNext: false
	}
}

export function CreateMixTransitionBlueprintPieceForPart(
	externalId: string,
	durationInFrames: number,
	sourceLayer: string
): IBlueprintPiece<PieceMetaData> {
	const tags = [
		GetTagForTransition(
			literal<ActionTakeWithTransitionVariantMix>({
				type: 'mix',
				frames: durationInFrames
			})
		)
	]
	const effectName: string = 'mix'
	return createEffectBlueprintPiece(durationInFrames, externalId, effectName, sourceLayer, tags)
}

function createEffectBlueprintPiece(
	durationInFrames: number,
	externalId: string,
	name: string,
	sourceLayer: string,
	tags: string[]
): IBlueprintPiece<PieceMetaData> {
	return {
		enable: {
			start: 0,
			duration: Math.max(getTimeFromFrames(durationInFrames), 1000)
		},
		externalId,
		name: `${name.toUpperCase()} ${durationInFrames}`,
		sourceLayerId: sourceLayer,
		outputLayerId: SharedOutputLayer.JINGLE,
		lifespan: PieceLifespan.WithinPart,
		tags,
		content: {
			timelineObjects: [],
			ignoreMediaObjectStatus: true
		},
		metaData: {
			playoutContent: {
				type: PlayoutContentType.TRANSITION
			},
			outputLayer: Tv2OutputLayer.SECONDARY
		}
	}
}

export function createInTransitionForTransitionStyle(durationInFrames: number): Pick<IBlueprintPart, 'inTransition'> {
	const transitionDuration = getTimeFromFrames(durationInFrames)
	return {
		inTransition: {
			previousPartKeepaliveDuration: transitionDuration,
			blockTakeDuration: transitionDuration,
			partContentDelayDuration: 0
		}
	}
}

export function createDipTransitionBlueprintPieceForPart(
	externalId: string,
	durationInFrames: number,
	sourceLayer: string
): IBlueprintPiece<PieceMetaData> {
	const tags = [
		GetTagForTransition(
			literal<ActionTakeWithTransitionVariantDip>({
				type: 'dip',
				frames: durationInFrames
			})
		)
	]
	const effectName: string = 'dip'
	return createEffectBlueprintPiece(durationInFrames, externalId, effectName, sourceLayer, tags)
}
