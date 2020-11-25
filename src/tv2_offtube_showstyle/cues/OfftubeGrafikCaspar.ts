import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionSelectFullGrafik,
	CalculateTime,
	CreateTimingEnable,
	CueDefinitionGraphic,
	GetFullGraphicTemplateNameFromCue,
	GetInfiniteModeForGraphic,
	GetTagForFull,
	GetTagForFullNext,
	GraphicDisplayName,
	GraphicInternal,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	GraphicLLayer,
	GraphicPilot,
	literal,
	PartContext2,
	PartDefinition,
	PartToParentClass,
	TranslateEngine
} from 'tv2-common'
import { AdlibActionType, AdlibTags, ControlClasses, Enablers, GraphicEngine, TallyTags } from 'tv2-constants'
import { OfftubeCasparLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateGrafikCaspar(
	config: OfftubeShowstyleBlueprintConfig,
	_context: PartContext2,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	_partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	_adlib: boolean,
	partDefinition: PartDefinition,
	rank?: number
) {
	let engine = parsedCue.target
	if (GraphicIsInternal(parsedCue)) {
		if (config.showStyle.GFXTemplates) {
			const templ = config.showStyle.GFXTemplates.find(
				t =>
					t.INewsName.toUpperCase() === parsedCue.graphic.template.toUpperCase() &&
					t.INewsCode.toString()
						.replace(/=/gi, '')
						.toUpperCase() === parsedCue.iNewsCommand.toUpperCase()
			)
			if (templ) {
				if (templ.IsDesign) {
					return
				}

				engine = TranslateEngine(templ.VizDestination)
			}
		}
	}

	const isIdentGrafik = GraphicIsInternal(parsedCue) && !!parsedCue.graphic.template.match(/direkte/i)

	if (GraphicIsPilot(parsedCue)) {
		const adLibPiece = CreateFullAdLib(config, partDefinition.externalId, parsedCue, partDefinition.segmentExternalId)

		actions.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.SELECT_FULL_GRAFIK,
				userData: literal<ActionSelectFullGrafik>({
					type: AdlibActionType.SELECT_FULL_GRAFIK,
					template: parsedCue.graphic.vcpid.toString(),
					segmentExternalId: partDefinition.segmentExternalId
				}),
				userDataManifest: {},
				display: {
					label: GetFullGraphicTemplateNameFromCue(config, parsedCue),
					sourceLayerId: OfftubeSourceLayer.PgmFull,
					outputLayerId: OfftubeOutputLayers.PGM,
					content: { ...adLibPiece.content, timelineObjects: [] },
					tags: [AdlibTags.ADLIB_KOMMENTATOR, AdlibTags.ADLIB_FLOW_PRODUCER],
					onAirTags: [GetTagForFull(partDefinition.segmentExternalId, parsedCue.graphic.vcpid.toString())],
					setNextTags: [GetTagForFullNext(partDefinition.segmentExternalId, parsedCue.graphic.vcpid.toString())]
				}
			})
		)

		const piece = CreateFullPiece(config, partDefinition.externalId, parsedCue, partDefinition.segmentExternalId)
		pieces.push(piece)
	} else if (GraphicIsInternal(parsedCue)) {
		// TODO: Wall

		if (parsedCue.adlib) {
			const adLibPiece = literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partDefinition.externalId,
				name: `${GraphicDisplayName(config, parsedCue)}`,
				sourceLayerId: GetSourceLayerForGrafik(config, GetFullGraphicTemplateNameFromCue(config, parsedCue)),
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
					sourceLayerId: GetSourceLayerForGrafik(config, GetFullGraphicTemplateNameFromCue(config, parsedCue)),
					outputLayerId: OfftubeOutputLayers.OVERLAY,
					lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue, isIdentGrafik),
					tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
					...(engine === 'TLF' || (parsedCue.end && parsedCue.end.infiniteMode)
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
				...(engine === 'TLF' || engine === 'WALL'
					? { enable: { start: 0 } }
					: {
							enable: {
								...CreateTimingGrafik(config, parsedCue)
							}
					  }),
				sourceLayerId: GetSourceLayerForGrafik(config, GetFullGraphicTemplateNameFromCue(config, parsedCue)),
				outputLayerId: OfftubeOutputLayers.OVERLAY,
				lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue, isIdentGrafik),
				...(engine === 'TLF' || (parsedCue.end && parsedCue.end.infiniteMode)
					? {}
					: { expectedDuration: CreateTimingGrafik(config, parsedCue).duration || GetDefaultOut(config) }),
				content: {
					timelineObjects: GetCasparOverlayTimeline(config, engine, parsedCue, isIdentGrafik, partDefinition)
				}
			})
			pieces.push(piece)
		}
	}
}

export function GetCasparOverlayTimeline(
	config: OfftubeShowstyleBlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	isIdentGrafik: boolean,
	partDefinition: PartDefinition,
	commentator?: boolean
): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: commentator
				? GetEnableForGrafikOfftube(config, engine, parsedCue, isIdentGrafik, partDefinition)
				: { while: `!.${Enablers.OFFTUBE_ENABLE_FULL}` },
			layer: GetTimelineLayerForGrafik(config, GetFullGraphicTemplateNameFromCue(config, parsedCue)),
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				// tslint:disable-next-line: prettier
				templateType: 'html',
				// tslint:disable-next-line: prettier
				name: 'sport-overlay/index',
				data: `<templateData>${encodeURI(
					JSON.stringify({
						// tslint:disable-next-line: prettier
						display: 'program',
						slots: createContentForGraphicTemplate(GetFullGraphicTemplateNameFromCue(config, parsedCue), parsedCue)
					})
				)}</templateData>`,
				useStopCommand: false
			}
		})
	]
}

export function createContentForGraphicTemplate(
	graphicName: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>
): Partial<any> {
	switch (graphicName.toLowerCase()) {
		// TODO: When creating new templates in the future
		// arkiv
		// ident
		// direkte
		// ident_nyhederne
		// ident_news
		// ident_tv2sport
		// billederfra_txt
		// billederfra_logo
		// tlfdirekte
		// topt
		// tlftopt
		// tlftoptlive
		// bund
		// vo
		// trompet
		// komm
		// kommentator

		case 'arkiv':
		case 'ident':
		case 'direkte':
		case 'ident_nyhederne':
		case 'ident_news':
		case 'ident_tv2sport':
		case 'billederfra_txt':
			return {
				'650_ident': {
					display: 'program',
					payload: {
						type: 'Ident',
						text1: parsedCue.graphic.textFields[0],
						text2: parsedCue.graphic.textFields[1]
					}
				}
			}
		case 'billederfra_logo':
			return {
				'650_ident': {
					display: 'program',
					payload: {
						type: 'BillederFra',
						logo: parsedCue.graphic.textFields[0]
					}
				}
			}
		case 'tlfdirekte':
			return {
				'650_ident': {
					display: 'program',
					payload: {
						type: 'Ident',
						text1: parsedCue.graphic.textFields[0],
						text2: parsedCue.graphic.textFields[1]
					}
				}
			}
		case 'topt':
			return {
				'660_topt': {
					display: 'program',
					payload: {
						type: 'Topt',
						name: parsedCue.graphic.textFields[0],
						title: parsedCue.graphic.textFields[1]
					}
				}
			}
		case 'tlftopt':
			return {
				'660_topt': {
					display: 'program',
					payload: {
						type: 'Topt',
						name: parsedCue.graphic.textFields[0],
						title: parsedCue.graphic.textFields[1]
					}
				}
			}
		case 'tlftoptlive':
			return {
				'660_topt': {
					display: 'program',
					payload: {
						type: 'Topt',
						name: parsedCue.graphic.textFields[0],
						title: parsedCue.graphic.textFields[1]
					}
				}
			}
		case 'bund':
			return {
				'450_lowerThird': {
					display: 'program',
					payload: {
						type: 'Bund',
						name: parsedCue.graphic.textFields[0],
						title: parsedCue.graphic.textFields[1]
					}
				}
			}
		case 'vo':
			return {
				'450_lowerThird': {
					display: 'program',
					payload: {
						type: 'Headline',
						headline: parsedCue.graphic.textFields[0],
						text1: parsedCue.graphic.textFields[1]
					}
				}
			}
		case 'trompet':
			return {
				'450_lowerThird': {
					display: 'program',
					payload: {
						type: 'Headline',
						headline: parsedCue.graphic.textFields[0],
						text1: parsedCue.graphic.textFields[1]
					}
				}
			}
		case 'komm':
			return {
				'450_lowerThird': {
					display: 'program',
					payload: {
						type: 'Headline',
						headline: parsedCue.graphic.textFields[0],
						text1: parsedCue.graphic.textFields[1]
					}
				}
			}
		case 'kommentator':
			return {
				'450_lowerThird': {
					display: 'program',
					payload: {
						type: 'Headline',
						headline: parsedCue.graphic.textFields[0],
						text1: parsedCue.graphic.textFields[1]
					}
				}
			}
		default:
			// Unknown template
			// Loactors are skipped right now
			/**
			 * TODO: Maybe we could return the following, to allow for custom templates?
			 * {
			 * 		[graphicName]: {
			 * 			payload: {
			 * 				text: parsedCue.textFields
			 * 			}
			 * 		}
			 * }
			 */
			return {}
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
			GetTagForFull(segmentExternalId, parsedCue.graphic.vcpid.toString()),
			GetTagForFullNext(segmentExternalId, parsedCue.graphic.vcpid.toString()),
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
		name: `${parsedCue.graphic.name}`,
		sourceLayerId: OfftubeSourceLayer.PgmFull,
		outputLayerId: OfftubeOutputLayers.PGM,
		toBeQueued: true,
		adlibPreroll: config.studio.CasparPrerollDuration,
		adlibTransitionKeepAlive: config.studio.FullKeepAliveDuration ? Number(config.studio.FullKeepAliveDuration) : 60000,
		lifespan: PieceLifespan.WithinPart,
		tags: [AdlibTags.ADLIB_FLOW_PRODUCER, AdlibTags.ADLIB_KOMMENTATOR],
		onAirTags: [GetTagForFull(segmentExternalId, parsedCue.graphic.vcpid.toString())],
		setNextTags: [GetTagForFullNext(segmentExternalId, parsedCue.graphic.vcpid.toString())],
		content: CreateFullContent(config, parsedCue)
	})
}

export function CreateFullContent(
	config: OfftubeShowstyleBlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicPilot>
): GraphicsContent {
	return {
		fileName: parsedCue.graphic.vcpid.toString(),
		path: `${config.studio.GraphicBasePath}\\${parsedCue.graphic.vcpid.toString()}.png`, // full path on the source network storage, TODO: File extension
		mediaFlowIds: [config.studio.GraphicFlowId],
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
					// tslint:disable-next-line: prettier
					templateType: 'html',
					// tslint:disable-next-line: prettier
					name: 'sport-overlay/index',
					data: `<templateData>${encodeURI(
						JSON.stringify({
							// tslint:disable-next-line: prettier
							display: 'program',
							slots: {
								'250_full': {
									payload: {
										type: 'Still',
										url: `http://${config.studio.FullGraphicURL}/${parsedCue.graphic.vcpid.toString()}.PNG`
									}
								}
							}
						})
					)}</templateData>`,
					useStopCommand: false
				}
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
	if (engine === 'WALL') {
		return {
			while: '1'
		}
	}
	if (isIdentGrafik) {
		return {
			while: `.${ControlClasses.ShowIdentGraphic} & !.full`
		}
	}

	if (cue.end && cue.end.infiniteMode && cue.end.infiniteMode === 'B' && partDefinition) {
		return { while: `.${PartToParentClass('studio0', partDefinition)} & !.adlib_deparent & !.full` }
	}

	const timing = CreateTimingEnable(cue, GetDefaultOut(config))

	if (!timing.lifespan) {
		return timing.enable
	}

	return {
		while: '!.full'
	}
}

function GetSourceLayerForGrafik(config: OfftubeShowstyleBlueprintConfig, name: string) {
	const conf = config.showStyle.GFXTemplates
		? config.showStyle.GFXTemplates.find(gfk => gfk.VizTemplate.toString() === name)
		: undefined

	if (!conf) {
		return OfftubeSourceLayer.PgmGraphicsOverlay
	}

	switch (conf.SourceLayer) {
		// TODO: When adding more sourcelayers
		// This is here to guard against bad user input
		case OfftubeSourceLayer.PgmGraphicsHeadline:
			return OfftubeSourceLayer.PgmGraphicsHeadline
		case OfftubeSourceLayer.PgmGraphicsIdent:
			return OfftubeSourceLayer.PgmGraphicsIdent
		case OfftubeSourceLayer.PgmGraphicsLower:
			return OfftubeSourceLayer.PgmGraphicsLower
		case OfftubeSourceLayer.PgmGraphicsOverlay:
			return OfftubeSourceLayer.PgmGraphicsOverlay
		case OfftubeSourceLayer.PgmGraphicsTLF:
			return OfftubeSourceLayer.PgmGraphicsTLF
		case OfftubeSourceLayer.PgmGraphicsTema:
			return OfftubeSourceLayer.PgmGraphicsTema
		case OfftubeSourceLayer.PgmGraphicsTop:
			return OfftubeSourceLayer.PgmGraphicsTop
		case OfftubeSourceLayer.WallGraphics:
			return OfftubeSourceLayer.WallGraphics
		default:
			return OfftubeSourceLayer.PgmGraphicsOverlay
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
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>
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

	return GetDefaultOut(config)
}

// TODO: This is copied from gallery D
export function CreateTimingGrafik(
	config: OfftubeShowstyleBlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>
): { start: number; duration?: number } {
	const ret: { start: number; duration?: number } = { start: 0, duration: 0 }
	const start = cue.start ? CalculateTime(cue.start) : 0
	start !== undefined ? (ret.start = start) : (ret.start = 0)

	const duration = GetGrafikDuration(config, cue)
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
