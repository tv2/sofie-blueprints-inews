import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	SegmentContext,
	TSR
} from '@sofie-automation/blueprints-integration'
import {
	AbstractLLayer,
	ActionSelectFullGrafik,
	CalculateTime,
	CreateTimingEnable,
	CueDefinitionGraphic,
	GetFullGraphicTemplateNameFromCue,
	GetInfiniteModeForGraphic,
	GetSourceLayerForGrafik,
	GetTagForFull,
	GetTagForFullNext,
	GraphicDisplayName,
	GraphicInternal,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	GraphicLLayer,
	GraphicPilot,
	IsTargetingTLF,
	IsTargetingWall,
	literal,
	PartDefinition,
	PartToParentClass,
	TimeFromFrames,
	TimelineBlueprintExt
} from 'tv2-common'
import { AdlibActionType, AdlibTags, ControlClasses, GraphicEngine, TallyTags } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer } from '../../tv2_offtube_studio/layers'
import { AtemSourceIndex } from '../../types/atem'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { layerToHTMLGraphicSlot, Slots } from '../helpers/html_graphics'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateGrafikCaspar(
	config: OfftubeShowstyleBlueprintConfig,
	_context: SegmentContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	_partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	_adlib: boolean,
	partDefinition: PartDefinition,
	rank?: number
) {
	const engine = parsedCue.target

	const isIdentGrafik = GraphicIsInternal(parsedCue) && !!parsedCue.graphic.template.match(/direkte/i)

	if (GraphicIsPilot(parsedCue)) {
		const adLibPiece = CreateFullAdLib(config, partDefinition.externalId, parsedCue, partDefinition.segmentExternalId)

		actions.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.SELECT_FULL_GRAFIK,
				userData: literal<ActionSelectFullGrafik>({
					type: AdlibActionType.SELECT_FULL_GRAFIK,
					segmentExternalId: partDefinition.segmentExternalId,
					name: parsedCue.graphic.name,
					vcpid: parsedCue.graphic.vcpid
				}),
				userDataManifest: {},
				display: {
					label: GetFullGraphicTemplateNameFromCue(config, parsedCue),
					sourceLayerId: OfftubeSourceLayer.PgmFull,
					outputLayerId: OfftubeOutputLayers.PGM,
					content: { ...adLibPiece.content, timelineObjects: [] },
					tags: [AdlibTags.ADLIB_KOMMENTATOR, AdlibTags.ADLIB_FLOW_PRODUCER],
					currentPieceTags: [GetTagForFull(partDefinition.segmentExternalId, parsedCue.graphic.vcpid)],
					nextPieceTags: [GetTagForFullNext(partDefinition.segmentExternalId, parsedCue.graphic.vcpid)]
				}
			})
		)

		const piece = CreateFullPiece(config, partDefinition.externalId, parsedCue, partDefinition.segmentExternalId)
		pieces.push(piece)
	} else if (GraphicIsInternal(parsedCue)) {
		// TODO: Wall

		const sourceLayerId = GetSourceLayerForGrafik(
			config,
			GetFullGraphicTemplateNameFromCue(config, parsedCue),
			isIdentGrafik
		)

		if (parsedCue.adlib) {
			const adLibPiece = literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partDefinition.externalId,
				name: `${GraphicDisplayName(config, parsedCue)}`,
				sourceLayerId,
				outputLayerId: OfftubeOutputLayers.OVERLAY,
				lifespan: PieceLifespan.WithinPart,
				expectedDuration: 5000,
				tags: [AdlibTags.ADLIB_KOMMENTATOR],
				content: {
					timelineObjects: GetCasparOverlayTimeline(config, engine, parsedCue, isIdentGrafik, partDefinition)
				}
			})
			adlibPieces.push(adLibPiece)

			adlibPieces.push(
				literal<IBlueprintAdLibPiece>({
					_rank: rank || 0,
					externalId: partDefinition.externalId,
					name: `${GraphicDisplayName(config, parsedCue)}`,
					sourceLayerId,
					outputLayerId: OfftubeOutputLayers.OVERLAY,
					lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue, isIdentGrafik),
					tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
					...(IsTargetingTLF(engine) || (parsedCue.end && parsedCue.end.infiniteMode)
						? {}
						: { expectedDuration: CreateTimingGrafik(config, parsedCue).duration || GetDefaultOut(config) }),
					content: {
						timelineObjects: GetCasparOverlayTimeline(config, engine, parsedCue, isIdentGrafik, partDefinition)
					}
				})
			)
		} else {
			const piece = literal<IBlueprintPiece>({
				externalId: partDefinition.externalId,
				name: `${GraphicDisplayName(config, parsedCue)}`,
				...(IsTargetingTLF(engine) || IsTargetingWall(engine)
					? { enable: { start: 0 } }
					: {
							enable: {
								...CreateTimingGrafik(config, parsedCue)
							}
					  }),
				sourceLayerId,
				outputLayerId: OfftubeOutputLayers.OVERLAY,
				lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue, isIdentGrafik),
				...(IsTargetingTLF(engine) || (parsedCue.end && parsedCue.end.infiniteMode)
					? {}
					: { expectedDuration: CreateTimingGrafik(config, parsedCue).duration || GetDefaultOut(config) }),
				content: {
					timelineObjects: GetCasparOverlayTimeline(config, engine, parsedCue, isIdentGrafik, partDefinition)
				}
			})
			pieces.push(piece)

			if (
				sourceLayerId === OfftubeSourceLayer.PgmGraphicsIdentPersistent &&
				(piece.lifespan === PieceLifespan.OutOnSegmentEnd || piece.lifespan === PieceLifespan.OutOnRundownEnd) &&
				isIdentGrafik
			) {
				// Special case for the ident. We want it to continue to exist in case the Live gets shown again, but we dont want the continuation showing in the ui.
				// So we create the normal object on a hidden layer, and then clone it on another layer without content for the ui
				pieces.push(
					literal<IBlueprintPiece>({
						...piece,
						enable: { ...CreateTimingGrafik(config, parsedCue, true) }, // Allow default out for visual representation
						sourceLayerId: OfftubeSourceLayer.PgmGraphicsIdent,
						lifespan: PieceLifespan.WithinPart,
						content: {
							timelineObjects: [
								literal<TSR.TimelineObjAbstractAny>({
									id: '',
									enable: {
										while: '1'
									},
									layer: AbstractLLayer.IdentMarker,
									content: {
										deviceType: TSR.DeviceType.ABSTRACT
									}
								})
							]
						}
					})
				)
			}
		}
	}
}

export function GetCasparOverlayTimeline(
	config: OfftubeShowstyleBlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	isIdentGrafik: boolean,
	partDefinition: PartDefinition
): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: GetEnableForGrafikOfftube(config, engine, parsedCue, isIdentGrafik, partDefinition),
			priority: 1,
			layer: GetTimelineLayerForGrafik(config, GetFullGraphicTemplateNameFromCue(config, parsedCue)),
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				templateType: 'html',
				name: 'sport-overlay/index',
				data: `<templateData>${encodeURI(
					JSON.stringify({
						display: 'program',
						slots: createContentForGraphicTemplate(
							config,
							GetFullGraphicTemplateNameFromCue(config, parsedCue),
							parsedCue
						),
						partialUpdate: true
					})
				)}</templateData>`,
				useStopCommand: false
			}
		})
	]
}

export function createContentForGraphicTemplate(
	config: OfftubeShowstyleBlueprintConfig,
	graphicTemplate: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>
): Partial<Slots> {
	const conf = config.showStyle.GFXTemplates.find(g => g.VizTemplate.toLowerCase() === graphicTemplate.toLowerCase())

	if (!conf) {
		return {}
	}

	const layer = conf.LayerMapping

	const slot = layerToHTMLGraphicSlot[layer]

	if (!slot) {
		return {}
	}

	return {
		[slot]: {
			display: 'program',
			payload: {
				type: graphicTemplate,
				...parsedCue.graphic.textFields
			}
		}
	}
}

export function CreateFullPiece(
	config: OfftubeShowstyleBlueprintConfig,
	externalId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	segmentExternalId: string
): IBlueprintPiece {
	return literal<IBlueprintPiece>({
		enable: {
			start: 0 // TODO: Time
		},
		externalId,
		name: `${parsedCue.graphic.name}`,
		sourceLayerId: OfftubeSourceLayer.PgmFull,
		outputLayerId: OfftubeOutputLayers.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: CreateFullContent(config, parsedCue),
		tags: [
			GetTagForFull(segmentExternalId, parsedCue.graphic.vcpid),
			GetTagForFullNext(segmentExternalId, parsedCue.graphic.vcpid),
			TallyTags.FULL_IS_LIVE
		]
	})
}

function CreateFullAdLib(
	config: OfftubeShowstyleBlueprintConfig,
	externalId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	segmentExternalId: string
): IBlueprintAdLibPiece {
	return literal<IBlueprintAdLibPiece>({
		_rank: 0,
		externalId,
		name: `${parsedCue.graphic.name.replace(/_/g, ' ')}`,
		sourceLayerId: OfftubeSourceLayer.PgmFull,
		outputLayerId: OfftubeOutputLayers.PGM,
		toBeQueued: true,
		adlibPreroll: config.studio.CasparPrerollDuration,
		adlibTransitionKeepAlive: config.studio.FullKeepAliveDuration ? Number(config.studio.FullKeepAliveDuration) : 60000,
		lifespan: PieceLifespan.WithinPart,
		tags: [AdlibTags.ADLIB_FLOW_PRODUCER, AdlibTags.ADLIB_KOMMENTATOR],
		currentPieceTags: [GetTagForFull(segmentExternalId, parsedCue.graphic.vcpid)],
		nextPieceTags: [GetTagForFullNext(segmentExternalId, parsedCue.graphic.vcpid)],
		content: CreateFullContent(config, parsedCue)
	})
}

export function CreateFullContent(
	config: OfftubeShowstyleBlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicPilot>
): GraphicsContent {
	return {
		fileName: parsedCue.graphic.name,
		path: `${config.studio.NetworkBasePathGraphic}\\${parsedCue.graphic.name}${config.studio.GraphicFileExtension}`, // full path on the source network storage, TODO: File extension
		mediaFlowIds: [config.studio.GraphicMediaFlowId],
		timelineObjects: [
			literal<TSR.TimelineObjCCGTemplate>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 100,
				layer: OfftubeCasparLLayer.CasparGraphicsFull,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
					templateType: 'html',
					name: 'sport-overlay/index',
					data: `<templateData>${encodeURI(
						JSON.stringify({
							display: 'program',
							slots: {
								'250_full': {
									payload: {
										type: 'still',
										url: `${config.studio.FullGraphicURL}/${parsedCue.graphic.name}${config.studio.GraphicFileExtension}`
									}
								}
							}
						})
					)}</templateData>`,
					useStopCommand: false,
					mixer: {
						opacity: 100
					}
				}
			}),
			literal<TSR.TimelineObjAtemDSK>({
				id: '',
				enable: {
					start: Number(config.studio.CasparPrerollDuration)
				},
				priority: 1,
				layer: OfftubeAtemLLayer.AtemDSKGraphics,
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
							preMultiply: true,
							clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000,
							gain: config.studio.AtemSettings.CCGGain * 10, // input is percents (0-100), atem uses 1-000,
							mask: {
								enabled: false
							}
						}
					}
				},
				classes: ['MIX_MINUS_OVERRIDE_DSK']
			}),
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: {
					start: Number(config.studio.CasparPrerollDuration)
				},
				priority: 1,
				layer: OfftubeAtemLLayer.AtemMEClean,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						input: config.studio.AtemSource.SplitBackground,
						transition: TSR.AtemTransitionStyle.WIPE,
						transitionSettings: {
							wipe: {
								rate: Number(config.studio.FullTransitionSettings.wipeRate),
								pattern: 1,
								reverseDirection: true,
								borderSoftness: config.studio.FullTransitionSettings.borderSoftness
							}
						}
					}
				}
			}),
			literal<TSR.TimelineObjCasparCGAny>({
				id: '',
				enable: {
					start:
						Number(config.studio.CasparPrerollDuration) +
						TimeFromFrames(Number(config.studio.FullTransitionSettings.wipeRate))
				},
				priority: 1,
				layer: OfftubeCasparLLayer.CasparGraphicsFullLoop,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.ROUTE,
					mappedLayer: OfftubeCasparLLayer.CasparCGDVELoop,
					transitions: {
						outTransition: {
							type: TSR.Transition.MIX,
							duration: config.studio.FullTransitionSettings.loopOutTransitionDuration
						}
					}
				}
			}),
			literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
				id: '',
				enable: { start: 0 },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemMENext,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						previewInput: AtemSourceIndex.Blk
					}
				},
				metaData: {},
				classes: ['ab_on_preview']
			})
		]
	}
}

// TODO: All of the below was copy-pasted and then adapted from AFVD blueprints, can they be made generic?

// TODO: Is this valid for offtubes?
function GetEnableForGrafikOfftube(
	config: OfftubeShowstyleBlueprintConfig,
	engine: GraphicEngine,
	cue: CueDefinitionGraphic<GraphicInternal>,
	isIdentGrafik: boolean,
	partDefinition?: PartDefinition
): TSR.TSRTimelineObj['enable'] {
	if (IsTargetingWall(engine)) {
		return {
			while: '1'
		}
	}

	if (
		((cue.end && cue.end.infiniteMode && cue.end.infiniteMode === 'B') ||
			GetInfiniteModeForGraphic(engine, config, cue, isIdentGrafik) === PieceLifespan.OutOnSegmentEnd) &&
		partDefinition
	) {
		return { while: `.${PartToParentClass('studio0', partDefinition)} & !.adlib_deparent & !.full` }
	}

	if (isIdentGrafik) {
		return {
			while: `.${ControlClasses.ShowIdentGraphic} & !.full`
		}
	}

	const timing = CreateTimingEnable(cue, GetDefaultOut(config))

	if (!timing.lifespan) {
		return timing.enable
	}

	return {
		while: '!.full'
	}
}

export function GetTimelineLayerForGrafik(config: OfftubeShowstyleBlueprintConfig, name: string) {
	const conf = config.showStyle.GFXTemplates
		? config.showStyle.GFXTemplates.find(gfk => gfk.VizTemplate.toString() === name)
		: undefined

	if (!conf) {
		return GraphicLLayer.GraphicLLayerOverlay
	}

	switch (conf.LayerMapping) {
		// TODO: When adding more output layers
		case GraphicLLayer.GraphicLLayerOverlayIdent:
			return GraphicLLayer.GraphicLLayerOverlayIdent
		case GraphicLLayer.GraphicLLayerOverlayTopt:
			return GraphicLLayer.GraphicLLayerOverlayTopt
		case GraphicLLayer.GraphicLLayerOverlayLower:
			return GraphicLLayer.GraphicLLayerOverlayLower
		case GraphicLLayer.GraphicLLayerOverlayHeadline:
			return GraphicLLayer.GraphicLLayerOverlayHeadline
		case GraphicLLayer.GraphicLLayerOverlayTema:
			return GraphicLLayer.GraphicLLayerOverlayTema
		case GraphicLLayer.GraphicLLayerWall:
			return GraphicLLayer.GraphicLLayerWall
		default:
			return GraphicLLayer.GraphicLLayerOverlay
	}
}

export function GetGrafikDuration(
	config: OfftubeShowstyleBlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	defaultTime: boolean
): number | undefined {
	if (config.showStyle.GFXTemplates) {
		if (GraphicIsInternal(cue)) {
			const template = config.showStyle.GFXTemplates.find(templ =>
				templ.INewsName ? templ.INewsName.toString().toUpperCase() === cue.graphic.template.toUpperCase() : false
			)
			if (template) {
				if (template.OutType && !template.OutType.toString().match(/default/i)) {
					return undefined
				}
			}
		} else if (GraphicIsPilot(cue)) {
			const template = config.showStyle.GFXTemplates.find(templ =>
				templ.INewsName
					? templ.INewsName.toString().toUpperCase() === cue.graphic.vcpid.toString().toUpperCase()
					: false
			)
			if (template) {
				if (template.OutType && !template.OutType.toString().match(/default/i)) {
					return undefined
				}
			}
		}
	}

	return defaultTime ? GetDefaultOut(config) : undefined
}

export function CreateTimingGrafik(
	config: OfftubeShowstyleBlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	defaultTime: boolean = true
): { start: number; duration?: number } {
	const ret: { start: number; duration?: number } = { start: 0, duration: 0 }
	const start = cue.start ? CalculateTime(cue.start) : 0
	start !== undefined ? (ret.start = start) : (ret.start = 0)

	const duration = GetGrafikDuration(config, cue, defaultTime)
	const end = cue.end
		? cue.end.infiniteMode
			? undefined
			: CalculateTime(cue.end)
		: duration
		? ret.start + duration
		: undefined
	ret.duration = end ? end - ret.start : undefined

	return ret
}

function GetDefaultOut(config: OfftubeShowstyleBlueprintConfig): number {
	if (config.showStyle.DefaultTemplateDuration !== undefined) {
		return Number(config.showStyle.DefaultTemplateDuration) * 1000
	}

	return 4 * 1000
}
