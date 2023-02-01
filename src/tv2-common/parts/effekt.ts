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
	EnableDSK,
	ExtendedShowStyleContext,
	GetTagForTransition,
	literal,
	PartDefinition,
	PieceMetaData,
	TimeFromFrames,
	TimelineBlueprintExt,
	TransitionStyle,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { TV2ShowStyleConfig } from '../blueprintConfig'
import { joinAssetToFolder, joinAssetToNetworkPath } from '../util'

/** Has to be executed before calling EvaluateCues, as some cues may depend on it */
export function CreateEffektForPartBase(
	context: ExtendedShowStyleContext<TV2ShowStyleConfig>,
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
		return CreateInTransitionForTransitionStyle(transition.duration)
	}

	if (transition.style === TransitionStyle.DIP) {
		const blueprintPiece: IBlueprintPiece =
			CreateDipTransitionBlueprintPieceForPart(partDefinition.externalId, transition.duration, layers.sourceLayer) ?? {}
		pieces.push(blueprintPiece)
		return CreateInTransitionForTransitionStyle(transition.duration)
	}

	return {}
}

export function CreateEffektForPartInner<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ExtendedShowStyleContext<ShowStyleConfig>,
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
	if (!context.config.showStyle.BreakerConfig) {
		context.core.notifyUserWarning(`Jingles have not been configured`)
		return false
	}

	const effektConfig = context.config.showStyle.BreakerConfig.find(
		conf =>
			conf.BreakerName.toString()
				.trim()
				.toUpperCase() === effekt.toUpperCase()
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

	pieces.push({
		externalId,
		name: label,
		enable: { start: 0, duration: TimeFromFrames(Number(effektConfig.Duration)) },
		outputLayerId: SharedOutputLayers.JINGLE,
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
			previewFrame: Number(effektConfig.StartAlpha),
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
				...EnableDSK(context, 'JINGLE', { start: Number(context.config.studio.CasparPrerollDuration) }),
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
		})
	})

	return {
		inTransition: {
			blockTakeDuration: TimeFromFrames(Number(effektConfig.Duration)) + context.config.studio.CasparPrerollDuration,
			previousPartKeepaliveDuration:
				TimeFromFrames(Number(effektConfig.StartAlpha)) + context.config.studio.CasparPrerollDuration,
			partContentDelayDuration:
				TimeFromFrames(Number(effektConfig.Duration)) -
				TimeFromFrames(Number(effektConfig.EndAlpha)) +
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
			duration: Math.max(TimeFromFrames(durationInFrames), 1000)
		},
		externalId,
		name: `${name.toUpperCase()} ${durationInFrames}`,
		sourceLayerId: sourceLayer,
		outputLayerId: SharedOutputLayers.JINGLE,
		lifespan: PieceLifespan.WithinPart,
		tags,
		content: {
			timelineObjects: [],
			ignoreMediaObjectStatus: true
		}
	}
}

export function CreateInTransitionForTransitionStyle(durationInFrames: number): Pick<IBlueprintPart, 'inTransition'> {
	const transitionDuration = TimeFromFrames(durationInFrames)
	return {
		inTransition: {
			previousPartKeepaliveDuration: transitionDuration,
			blockTakeDuration: transitionDuration,
			partContentDelayDuration: 0
		}
	}
}

export function CreateDipTransitionBlueprintPieceForPart(
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
