import {
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintPieceType,
	IShowStyleUserContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	VTContent,
	WithTimeline
} from '@tv2media/blueprints-integration'
import {
	ActionTakeWithTransitionVariantMix,
	EnableDSK,
	GetTagForTransition,
	literal,
	PartDefinition,
	TimeFromFrames,
	TimelineBlueprintExt,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { JoinAssetToFolder, JoinAssetToNetworkPath } from '../util'

/** Has to be executed before calling EvaluateCues, as some cues may depend on it */
export function CreateEffektForPartBase(
	context: IShowStyleUserContext,
	config: TV2BlueprintConfig,
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
			config,
			pieces,
			effekt.toString(),
			partDefinition.externalId,
			layers,
			`EFFEKT ${effekt}`
		)

		return ret ?? {}
	} else if (transition !== undefined && transition.duration !== undefined) {
		if (transition.style.match(/mix/i)) {
			return CreateMixForPartInner(pieces, partDefinition.externalId, transition.duration, layers) ?? {}
		} else {
			return {}
		}
	} else {
		return {}
	}
}

export function CreateEffektForPartInner<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: IShowStyleUserContext,
	config: ShowStyleConfig,
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
	if (!config.showStyle.BreakerConfig) {
		context.notifyUserWarning(`Jingles have not been configured`)
		return false
	}

	const effektConfig = config.showStyle.BreakerConfig.find(
		conf =>
			conf.BreakerName.toString()
				.trim()
				.toUpperCase() === effekt.toUpperCase()
	)
	if (!effektConfig) {
		context.notifyUserWarning(`Could not find effekt ${effekt}`)
		return false
	}

	const file = effektConfig.ClipName.toString()

	if (!file) {
		context.notifyUserWarning(`Could not find file for ${effekt}`)
		return false
	}

	const fileName = JoinAssetToFolder(config.studio.JingleFolder, file)

	pieces.push(
		literal<IBlueprintPiece>({
			externalId,
			name: label,
			enable: { start: 0, duration: TimeFromFrames(Number(effektConfig.Duration)) },
			outputLayerId: SharedOutputLayers.JINGLE,
			sourceLayerId: layers.sourceLayer,
			lifespan: PieceLifespan.WithinPart,
			pieceType: IBlueprintPieceType.InTransition,
			content: literal<WithTimeline<VTContent>>({
				fileName,
				path: JoinAssetToNetworkPath(
					config.studio.JingleNetworkBasePath,
					config.studio.JingleFolder,
					file,
					config.studio.JingleFileExtension
				), // full path on the source network storage
				mediaFlowIds: [config.studio.JingleMediaFlowId],
				previewFrame: Number(effektConfig.StartAlpha),
				ignoreMediaObjectStatus: config.studio.JingleIgnoreStatus,
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
					...EnableDSK(config, 'JINGLE', { start: Number(config.studio.CasparPrerollDuration) }),
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
	)

	return {
		inTransition: {
			blockTakeDuration: TimeFromFrames(Number(effektConfig.Duration)) + config.studio.CasparPrerollDuration,
			previousPartKeepaliveDuration:
				TimeFromFrames(Number(effektConfig.StartAlpha)) + config.studio.CasparPrerollDuration,
			partContentDelayDuration:
				TimeFromFrames(Number(effektConfig.Duration)) -
				TimeFromFrames(Number(effektConfig.EndAlpha)) +
				config.studio.CasparPrerollDuration
		},
		autoNext: false
	}
}

export function CreateMixForPartInner(
	pieces: IBlueprintPiece[],
	externalId: string,
	durationInFrames: number,
	layers: {
		sourceLayer: string
		casparLayer: string
		sisyfosLayer: string
	}
): Pick<IBlueprintPart, 'inTransition'> {
	pieces.push(
		literal<IBlueprintPiece>({
			enable: {
				start: 0,
				duration: Math.max(TimeFromFrames(durationInFrames), 1000)
			},
			externalId,
			name: `MIX ${durationInFrames}`,
			sourceLayerId: layers.sourceLayer,
			outputLayerId: SharedOutputLayers.JINGLE,
			lifespan: PieceLifespan.WithinPart,
			tags: [
				GetTagForTransition(
					literal<ActionTakeWithTransitionVariantMix>({
						type: 'mix',
						frames: durationInFrames
					})
				)
			],
			content: {
				timelineObjects: [],
				ignoreMediaObjectStatus: true
			}
		})
	)

	const transitionDuration = TimeFromFrames(durationInFrames)

	return {
		inTransition: {
			previousPartKeepaliveDuration: transitionDuration,
			blockTakeDuration: transitionDuration,
			partContentDelayDuration: 0
		}
	}
}
