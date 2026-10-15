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
} from 'blueprints-integration'
import {
	ActionTakeWithTransitionVariantDip,
	ActionTakeWithTransitionVariantMix,
	EnableDSK,
	GetTagForTransition,
	literal,
	MixTransitionSettings,
	PartDefinition,
	PieceMetaData,
	TableConfigItemBreakers,
	TableConfigItemUnderlyingTransition,
	TimeFromFrames,
	TimelineBlueprintExt,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { joinAssetToFolder, joinAssetToNetworkPath } from '../util'

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
	},
	allowUnderlyingTransition: boolean = false
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
			`EFFEKT ${effekt}`,
			allowUnderlyingTransition
		)

		return ret ?? {}
	}

	if (transition === undefined || transition.duration === undefined) {
		return {}
	}

	if (transition.style === TSR.AtemTransitionStyle.MIX) {
		const blueprintPiece: IBlueprintPiece =
			CreateMixTransitionBlueprintPieceForPart(partDefinition.externalId, transition.duration, layers.sourceLayer) ?? {}

		pieces.push(blueprintPiece)
		return CreateInTransitionForAtemTransitionStyle(transition.duration)
	}

	if (transition.style === TSR.AtemTransitionStyle.DIP) {
		const blueprintPiece: IBlueprintPiece =
			CreateDipTransitionBlueprintPieceForPart(partDefinition.externalId, transition.duration, layers.sourceLayer) ?? {}
		pieces.push(blueprintPiece)
		return CreateInTransitionForAtemTransitionStyle(transition.duration)
	}

	return {}
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
	label: string,
	allowUnderlyingTransition: boolean = false
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

	const underlyingTransition =
		allowUnderlyingTransition && effektConfig.EnableUnderlyingTransition
			? getUnderlyingTransition(
					context,
					effektConfig,
					config.showStyle.UnderlyingTransitions,
					config.studio.CasparPrerollDuration
			  )
			: undefined
	if (underlyingTransition === false) {
		return false
	}

	const fileName = joinAssetToFolder(config.studio.JingleFolder, file)

	const piece: IBlueprintPiece<PieceMetaData> = {
		externalId,
		name: label,
		enable: { start: 0, duration: TimeFromFrames(Number(effektConfig.Duration)) },
		outputLayerId: SharedOutputLayers.JINGLE,
		sourceLayerId: layers.sourceLayer,
		lifespan: PieceLifespan.WithinPart,
		pieceType: IBlueprintPieceType.InTransition,
		...(underlyingTransition
			? {
					metaData: {
						underlyingTransition: {
							breaker: effektConfig.BreakerName,
							durationFrames: underlyingTransition.duration,
							style: underlyingTransition.style,
							settings: underlyingTransition.settings
						}
					}
			  }
			: {}),
		content: literal<WithTimeline<VTContent>>({
			fileName,
			path: joinAssetToNetworkPath(
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
	}
	pieces.push(piece)

	return {
		inTransition: {
			blockTakeDuration: underlyingTransition
				? Math.max(
						TimeFromFrames(Number(effektConfig.Duration)) + config.studio.CasparPrerollDuration,
						underlyingTransition.end
				  )
				: TimeFromFrames(Number(effektConfig.Duration)) + config.studio.CasparPrerollDuration,
			previousPartKeepaliveDuration: underlyingTransition
				? underlyingTransition.end
				: TimeFromFrames(Number(effektConfig.StartAlpha)) + config.studio.CasparPrerollDuration,
			partContentDelayDuration: underlyingTransition
				? underlyingTransition.start
				: TimeFromFrames(Number(effektConfig.Duration)) -
				  TimeFromFrames(Number(effektConfig.EndAlpha)) +
				  config.studio.CasparPrerollDuration
		},
		autoNext: false
	}
}

function getUnderlyingTransition(
	context: IShowStyleUserContext,
	breaker: TableConfigItemBreakers,
	presets: TableConfigItemUnderlyingTransition[] | undefined,
	preroll: number
):
	| {
			start: number
			end: number
			duration: number
			style: TSR.AtemTransitionStyle.MIX | TSR.AtemTransitionStyle.WIPE
			settings: TSR.AtemTransitionSettings
	  }
	| false {
	const reference = breaker.UnderlyingTransition
	const label = typeof reference === 'string' ? reference : reference?.label
	const selectedName = typeof label === 'string' ? label.trim() : ''
	const selectedId = typeof reference === 'object' && reference !== null ? reference.value : undefined
	const matchesById = selectedId ? (presets ?? []).filter(candidate => candidate._id === selectedId) : []
	const matches = matchesById.length
		? matchesById
		: (presets ?? []).filter(
				candidate =>
					typeof candidate.Name === 'string' && candidate.Name.trim().toUpperCase() === selectedName.toUpperCase()
		  )
	if (
		matches.length !== 1 ||
		typeof matches[0].Name !== 'string' ||
		!matches[0].Name.trim() ||
		(presets ?? []).filter(
			candidate =>
				typeof candidate.Name === 'string' &&
				candidate.Name.trim().toUpperCase() === matches[0].Name.trim().toUpperCase()
		).length !== 1
	) {
		context.notifyUserWarning(
			`Invalid underlying transition for breaker ${
				breaker.BreakerName
			}: select a unique name from Underlying transitions (selected "${selectedName || selectedId || ''}")`
		)
		return false
	}
	const preset = matches[0]
	const name = preset.Name.trim()
	if (preset.Type !== 'Mix' && preset.Type !== 'Dot wipe') {
		context.notifyUserWarning(
			`Invalid underlying transition for breaker ${breaker.BreakerName}: "${name}" must use Mix or Dot wipe`
		)
		return false
	}
	const duration = optionalFrameValue(breaker.Duration, NaN)
	const alphaStart = optionalFrameValue(breaker.StartAlpha, NaN)
	const alphaEnd = optionalFrameValue(breaker.EndAlpha, NaN)
	const startFrame = optionalFrameValue(preset.StartFrame, duration - alphaEnd)
	const transitionDuration = optionalFrameValue(preset.Duration, 4)
	const maxDuration = preset.Type === 'Dot wipe' ? 250 : 255
	if (
		![duration, alphaStart, alphaEnd, startFrame, transitionDuration].every(Number.isSafeInteger) ||
		duration <= 0 ||
		alphaStart < 0 ||
		alphaEnd < 0 ||
		alphaStart + alphaEnd > duration ||
		startFrame < 0 ||
		startFrame > duration ||
		transitionDuration < 1 ||
		transitionDuration > maxDuration ||
		!Number.isFinite(preroll) ||
		preroll < 0
	) {
		context.notifyUserWarning(
			`Invalid underlying transition for breaker ${breaker.BreakerName}: check duration/alpha timings, start frame (0 to Duration) and transition duration (1 to ${maxDuration} frames) for "${name}"`
		)
		return false
	}

	let settings: TSR.AtemTransitionSettings = MixTransitionSettings(transitionDuration)
	if (preset.Type === 'Dot wipe') {
		const wipe = {
			rate: transitionDuration,
			// ATEM Pattern.CircleIris. The installed TSR types expose only numeric pattern IDs.
			pattern: 7,
			borderWidth: preset.BorderWidth === undefined ? 0 : preset.BorderWidth,
			borderInput: preset.BorderInput === undefined ? 0 : preset.BorderInput,
			symmetry: preset.Symmetry === undefined ? 5000 : preset.Symmetry,
			borderSoftness: preset.BorderSoftness === undefined ? 0 : preset.BorderSoftness,
			xPosition: preset.XPosition === undefined ? 5000 : preset.XPosition,
			yPosition: preset.YPosition === undefined ? 5000 : preset.YPosition,
			reverseDirection: preset.ReverseDirection === undefined ? false : preset.ReverseDirection,
			flipFlop: preset.FlipFlop === undefined ? false : preset.FlipFlop
		}
		if (
			![wipe.borderWidth, wipe.symmetry, wipe.borderSoftness, wipe.xPosition, wipe.yPosition].every(
				value => Number.isSafeInteger(value) && value >= 0 && value <= 10000
			) ||
			!Number.isSafeInteger(wipe.borderInput) ||
			wipe.borderInput < 0 ||
			wipe.borderInput > 65535 ||
			typeof wipe.reverseDirection !== 'boolean' ||
			typeof wipe.flipFlop !== 'boolean'
		) {
			context.notifyUserWarning(
				`Invalid underlying transition for breaker ${breaker.BreakerName}: "${name}" requires whole-number dot controls (0 to 10000), an ATEM border source ID (0 to 65535), and boolean reverse/flip-flop values`
			)
			return false
		}
		settings = { wipe }
	}

	const start = TimeFromFrames(startFrame) + preroll
	return {
		start,
		end: start + TimeFromFrames(transitionDuration),
		duration: transitionDuration,
		style: preset.Type === 'Mix' ? TSR.AtemTransitionStyle.MIX : TSR.AtemTransitionStyle.WIPE,
		settings
	}
}

function optionalFrameValue(value: unknown, fallback: number): number {
	if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
		return fallback
	}
	return typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value.trim())) ? Number(value) : NaN
}

export function ApplyUnderlyingTransitionToPieces(pieces: IBlueprintPiece[], atemLayer: string): void {
	const transition = pieces
		.filter(p => p.pieceType === IBlueprintPieceType.InTransition)
		.map(p => (p.metaData as PieceMetaData | undefined)?.underlyingTransition)
		.find(value => value !== undefined)
	if (transition === undefined) {
		return
	}

	for (const piece of pieces) {
		if (piece.outputLayerId !== SharedOutputLayers.PGM || piece.enable.start !== 0) {
			continue
		}
		for (const obj of (piece.content?.timelineObjects ?? []) as TSR.TSRTimelineObj[]) {
			if (
				obj.layer === atemLayer &&
				obj.content.deviceType === TSR.DeviceType.ATEM &&
				obj.content.type === TSR.TimelineContentTypeAtem.ME &&
				obj.content.me.input !== undefined
			) {
				obj.content.me.transition = transition.style
				obj.content.me.transitionSettings = {
					...(transition.settings.mix ? { mix: { ...transition.settings.mix } } : {}),
					...(transition.settings.wipe ? { wipe: { ...transition.settings.wipe } } : {})
				}
			}
		}
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

export function CreateInTransitionForAtemTransitionStyle(
	durationInFrames: number
): Pick<IBlueprintPart, 'inTransition'> {
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
