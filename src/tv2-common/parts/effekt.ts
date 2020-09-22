import {
	IBlueprintPart,
	IBlueprintPiece,
	NotesContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import {
	literal,
	PartDefinition,
	TimeFromFrames,
	TimelineBlueprintExt,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'

export function CreateEffektForPartBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: NotesContext,
	config: ShowStyleConfig,
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[],
	layers: {
		sourceLayer: string
		atemLayer: string
		casparLayer: string
		sisyfosLayer: string
	}
):
	| Pick<
			IBlueprintPart,
			'transitionDuration' | 'transitionKeepaliveDuration' | 'transitionPrerollDuration' | 'autoNext'
	  >
	| {} {
	const effekt = partDefinition.effekt
	if (effekt === undefined) {
		return {}
	}

	const ret = CreateEffektForPartInner(
		context,
		config,
		pieces,
		effekt.toString(),
		`${partDefinition.externalId}-EFFEKT-${effekt}`,
		layers,
		`EFFEKT ${effekt}`
	)

	return ret ?? {}
}

export function CreateEffektForPartInner<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: NotesContext,
	config: ShowStyleConfig,
	pieces: IBlueprintPiece[],
	effekt: string,
	externalId: string,
	layers: {
		sourceLayer: string
		atemLayer: string
		casparLayer: string
		sisyfosLayer: string
	},
	label: string
):
	| Pick<
			IBlueprintPart,
			'transitionDuration' | 'transitionKeepaliveDuration' | 'transitionPrerollDuration' | 'autoNext'
	  >
	| false {
	if (!config.showStyle.BreakerConfig) {
		context.warning(`Jingles have not been configured`)
		return false
	}

	const effektConfig = config.showStyle.BreakerConfig.find(
		conf =>
			conf.BreakerName.toString()
				.trim()
				.toUpperCase() === effekt.toUpperCase()
	)
	if (!effektConfig) {
		context.warning(`Could not find effekt ${effekt}`)
		return false
	}

	const file = effektConfig.ClipName.toString()

	if (!file) {
		context.warning(`Could not find file for ${effekt}`)
		return false
	}

	pieces.push(
		literal<IBlueprintPiece>({
			externalId,
			name: label,
			enable: { start: 0, duration: TimeFromFrames(Number(effektConfig.Duration)) },
			outputLayerId: 'jingle',
			sourceLayerId: layers.sourceLayer,
			lifespan: PieceLifespan.WithinPart,
			isTransition: true,
			content: literal<VTContent>({
				studioLabel: '',
				fileName: file,
				path: file,
				firstWords: '',
				lastWords: '',
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
							file
						}
					}),
					literal<TSR.TimelineObjAtemDSK>({
						id: '',
						enable: {
							start: Number(config.studio.CasparPrerollDuration)
						},
						priority: 1,
						layer: layers.atemLayer,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.DSK,
							dsk: {
								onAir: true,
								sources: {
									fillSource: config.studio.AtemSource.JingleFill,
									cutSource: config.studio.AtemSource.JingleKey
								},
								properties: {
									tie: false,
									preMultiply: false,
									clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000,
									gain: config.studio.AtemSettings.CCGGain * 10, // input is percents (0-100), atem uses 1-000,
									mask: {
										enabled: false
									}
								}
							}
						}
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
			})
		})
	)

	return {
		transitionDuration: TimeFromFrames(Number(effektConfig.Duration)) + config.studio.CasparPrerollDuration,
		transitionKeepaliveDuration: TimeFromFrames(Number(effektConfig.StartAlpha)) + config.studio.CasparPrerollDuration,
		transitionPrerollDuration:
			TimeFromFrames(Number(effektConfig.Duration)) -
			TimeFromFrames(Number(effektConfig.EndAlpha)) +
			config.studio.CasparPrerollDuration,
		autoNext: false
	}
}
