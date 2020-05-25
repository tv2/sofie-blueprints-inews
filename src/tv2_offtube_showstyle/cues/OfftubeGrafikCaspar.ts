import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	CalculateTime,
	CreateTimingEnable,
	CueDefinitionGrafik,
	CueDefinitionMOS,
	GraphicLLayer,
	InfiniteMode,
	literal,
	PartDefinition,
	PartToParentClass,
	TranslateEngine
} from 'tv2-common'
import { AdlibTags, ControlClasses, CueType, Enablers, GraphicEngine } from 'tv2-constants'
import { OfftubeAbstractLLayer, OfftubeAtemLLayer, OfftubeCasparLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateGrafikCaspar(
	config: OfftubeShowstyleBlueprintConfig,
	_context: PartContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_partid: string,
	parsedCue: CueDefinitionGrafik,
	_engine: GraphicEngine,
	_adlib: boolean,
	partDefinition: PartDefinition,
	isTlfPrimary?: boolean,
	rank?: number
) {
	let engine = _engine
	if (config.showStyle.GFXTemplates) {
		const templ = config.showStyle.GFXTemplates.find(
			t =>
				t.INewsName.toUpperCase() === parsedCue.template.toUpperCase() &&
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

	const isIdentGrafik = !!parsedCue.template.match(/direkte/i)

	if (engine === 'FULL') {
		let adLibPiece = CreateFullAdLib(config, partDefinition, GetTemplateName(config, parsedCue), false)
		adlibPieces.push(adLibPiece)
		// Repeat for flow producer
		adLibPiece = CreateFullAdLib(config, partDefinition, GetTemplateName(config, parsedCue), true)
		adlibPieces.push(adLibPiece)

		const piece = CreateFullPiece(config, partDefinition, GetTemplateName(config, parsedCue))
		pieces.push(piece)
	} else {
		// TODO: Wall
		const adLibPiece = literal<IBlueprintAdLibPiece>({
			_rank: rank || 0,
			externalId: partDefinition.externalId,
			name: `${grafikName(config, parsedCue)}`,
			sourceLayerId: GetSourceLayerForGrafik(config, GetTemplateName(config, parsedCue)),
			outputLayerId: OfftubeOutputLayers.OVERLAY,
			infiniteMode: PieceLifespan.Infinite,
			tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
			content: {
				timelineObjects: GetCasparOverlayTimeline(config, engine, parsedCue, isIdentGrafik, partDefinition)
			}
		})
		adlibPieces.push(adLibPiece)

		const piece = literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: `${grafikName(config, parsedCue)}`,
			...(isTlfPrimary || engine === 'WALL'
				? { enable: { start: 0 } }
				: {
						enable: {
							...CreateTimingGrafik(config, parsedCue)
						}
				  }),
			sourceLayerId: GetSourceLayerForGrafik(config, GetTemplateName(config, parsedCue)),
			outputLayerId: OfftubeOutputLayers.OVERLAY,
			infiniteMode: GetInfiniteModeForGrafik(engine, config, parsedCue, isTlfPrimary, isIdentGrafik),
			...(isTlfPrimary || (parsedCue.end && parsedCue.end.infiniteMode)
				? {}
				: { expectedDuration: CreateTimingGrafik(config, parsedCue).duration || GetDefaultOut(config) }),
			content: {
				timelineObjects: GetCasparOverlayTimeline(config, engine, parsedCue, isIdentGrafik, partDefinition)
			}
		})
		pieces.push(piece)
	}
}

export function GetCasparOverlayTimeline(
	config: OfftubeShowstyleBlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGrafik,
	isIdentGrafik: boolean,
	partDefinition: PartDefinition
): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: GetEnableForGrafikOfftube(engine, parsedCue, isIdentGrafik, partDefinition),
			layer: GetTimelineLayerForGrafik(config, GetTemplateName(config, parsedCue)),
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				templateType: 'html',
				name: GetTemplateName(config, parsedCue),
				data: literal<RendererStatePartial>({
					partialUpdate: true,
					rendererDisplay: 'program',
					slots: createContentForGraphicTemplate(GetTemplateName(config, parsedCue), parsedCue)
				}),
				useStopCommand: false
			}
		})
	]
}

function createContentForGraphicTemplate(graphicName: string, parsedCue: CueDefinitionGrafik): Partial<Slots> {
	switch (graphicName.toLowerCase()) {
		// TODO: When creating new templates in the future
		case 'arkiv':
			return {
				[graphicName]: {
					display: 'program',
					payload: {
						type: GraphicName.ARKIV,
						text: parsedCue.textFields[0]
					}
				}
			}
		case 'billederfra_logo':
			return {
				[graphicName]: {
					display: 'program',
					payload: {
						type: GraphicName.BILLEDERFRA_LOGO,
						logo: parsedCue.textFields[0]
					}
				}
			}
		case 'bund':
			return {
				[graphicName]: {
					display: 'program',
					payload: {
						type: GraphicName.BUND,
						firstLine: parsedCue.textFields[0], // TODO: Should this be more generic?
						secondLine: parsedCue.textFields[1]
					}
				}
			}
		case 'direkte':
			return {
				[graphicName]: {
					display: 'program',
					payload: {
						type: GraphicName.DIREKTE,
						location: parsedCue.textFields[0]
					}
				}
			}
		case 'ident_nyhederne':
			return {
				[graphicName]: {
					display: 'program',
					payload: {
						type: GraphicName.IDENT,
						variant: 'ident_nyhederne',
						text: parsedCue.textFields[0]
					}
				}
			}
		case 'ident_news':
			return {
				[graphicName]: {
					display: 'program',
					payload: {
						type: GraphicName.IDENT,
						variant: 'ident_news',
						text: parsedCue.textFields[0]
					}
				}
			}
		case 'ident_tv2sport':
			return {
				[graphicName]: {
					display: 'program',
					payload: {
						type: GraphicName.IDENT,
						variant: 'ident_tv2sport',
						text: parsedCue.textFields[0]
					}
				}
			}
		case 'ident_blank':
			return {
				[graphicName]: {
					display: 'program',
					payload: {
						type: GraphicName.IDENT,
						variant: 'ident_blank',
						text: parsedCue.textFields[0]
					}
				}
			}
		case 'topt':
			return {
				[graphicName]: {
					display: 'program',
					payload: {
						type: GraphicName.TOPT,
						text: parsedCue.textFields[0] // TODO: Should indexing be pulled from config?
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

function CreateFullPiece(
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	template: string
): IBlueprintPiece {
	return literal<IBlueprintPiece>({
		_id: '',
		enable: {
			start: 0 // TODO: Time
		},
		externalId: partDefinition.externalId,
		name: `${template}`,
		sourceLayerId: OfftubeSourceLayer.SelectedAdlibGraphicsFull, // TODO: Something else?
		outputLayerId: OfftubeOutputLayers.SELECTED_ADLIB, // TODO: PGM
		infiniteMode: PieceLifespan.OutOnNextPart,
		content: CreateFullContent(config, partDefinition, template, true)
	})
}

function CreateFullAdLib(
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	template: string,
	flowProducer: boolean
): IBlueprintAdLibPiece {
	return literal<IBlueprintAdLibPiece>({
		_rank: 0,
		externalId: partDefinition.externalId,
		name: `${template}`,
		sourceLayerId: flowProducer ? OfftubeSourceLayer.PgmFull : OfftubeSourceLayer.SelectedAdlibGraphicsFull,
		outputLayerId: flowProducer ? OfftubeOutputLayers.PGM : OfftubeOutputLayers.SELECTED_ADLIB,
		toBeQueued: true,
		canCombineQueue: !flowProducer,
		infiniteMode: flowProducer ? PieceLifespan.OutOnNextPart : PieceLifespan.OutOnNextSegment,
		tags: flowProducer ? [AdlibTags.ADLIB_FLOW_PRODUCER] : [],
		content: CreateFullContent(config, partDefinition, template, flowProducer)
	})
}

function CreateFullContent(
	config: OfftubeShowstyleBlueprintConfig,
	_partDefinition: PartDefinition,
	template: string,
	flowProducer: boolean
): GraphicsContent {
	return {
		fileName: template,
		path: `${config.studio.ClipSourcePath}\\${template}${config.studio.ClipFileExtension}`, // full path on the source network storage
		mediaFlowIds: [config.studio.MediaFlowId],
		timelineObjects: [
			literal<TSR.TimelineObjCCGMedia>({
				id: '',
				enable: {
					while: `.${Enablers.OFFTUBE_ENABLE_FULL}`
				},
				priority: 100,
				layer: OfftubeCasparLLayer.CasparGraphicsFull,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file: template,
					loop: true,
					mixer: {
						opacity: 100
					}
				}
			}),
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: {
					while: `.${Enablers.OFFTUBE_ENABLE_FULL}`
				},
				priority: 100,
				layer: OfftubeAtemLLayer.AtemMEClean,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						input: config.studio.AtemSource.GFXFull,
						transition: TSR.AtemTransitionStyle.CUT
					}
				}
			}),
			...(flowProducer
				? [
						literal<TSR.TimelineObjAbstractAny>({
							id: '',
							enable: {
								while: '1'
							},
							priority: 100, // TODO: Fix priority
							layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
							content: {
								deviceType: TSR.DeviceType.ABSTRACT
							},
							classes: [Enablers.OFFTUBE_ENABLE_FULL]
						})
				  ]
				: [])
		]
	}
}

// TODO: All of the below was copy-pasted and then adapted from AFVD blueprints, can they be made generic?

// TODO: Is this valid for offtubes?
function GetEnableForGrafikOfftube(
	engine: GraphicEngine,
	cue: CueDefinitionGrafik,
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

	const timing = CreateTimingEnable(cue)

	if (!timing.infiniteMode) {
		return timing.enable
	}

	return {
		while: '!.full'
	}
}

export function GetInfiniteModeForGrafik(
	engine: GraphicEngine,
	config: OfftubeShowstyleBlueprintConfig,
	parsedCue: CueDefinitionGrafik,
	isTlf?: boolean,
	isIdent?: boolean
): PieceLifespan {
	return engine === 'WALL'
		? PieceLifespan.Infinite
		: isTlf
		? PieceLifespan.OutOnNextPart
		: isIdent
		? PieceLifespan.OutOnNextSegment
		: parsedCue.end && parsedCue.end.infiniteMode
		? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
		: FindInfiniteModeFromConfig(config, parsedCue)
}

export function FindInfiniteModeFromConfig(
	config: OfftubeShowstyleBlueprintConfig,
	parsedCue: CueDefinitionGrafik
): PieceLifespan {
	if (config.showStyle.GFXTemplates) {
		const template = GetTemplateName(config, parsedCue)
		const conf = config.showStyle.GFXTemplates.find(cnf =>
			cnf.VizTemplate ? cnf.VizTemplate.toString().toUpperCase() === template.toUpperCase() : false
		)

		if (!conf) {
			return PieceLifespan.Normal
		}

		if (!conf.OutType || !conf.OutType.toString().length) {
			return PieceLifespan.Normal
		}

		const type = conf.OutType.toString().toUpperCase()

		if (type !== 'B' && type !== 'S' && type !== 'O') {
			return PieceLifespan.Normal
		}

		return InfiniteMode(type, PieceLifespan.Normal)
	}

	return PieceLifespan.Normal
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

function grafikName(
	config: OfftubeShowstyleBlueprintConfig,
	parsedCue: CueDefinitionGrafik | CueDefinitionMOS
): string {
	if (parsedCue.type === CueType.Grafik) {
		return `${parsedCue.template ? `${GetTemplateName(config, parsedCue)}` : ''}${parsedCue.textFields
			.filter(txt => !txt.match(/^;.\.../i))
			.map(txt => ` - ${txt}`)}`.replace(/,/gi, '')
	} else {
		return `${parsedCue.name ? parsedCue.name : ''}`
	}
}

export function GetGrafikDuration(
	config: OfftubeShowstyleBlueprintConfig,
	cue: CueDefinitionGrafik | CueDefinitionMOS
): number | undefined {
	if (config.showStyle.GFXTemplates) {
		if (cue.type === CueType.Grafik) {
			const template = config.showStyle.GFXTemplates.find(templ =>
				templ.INewsName ? templ.INewsName.toString().toUpperCase() === cue.template.toUpperCase() : false
			)
			if (template) {
				if (template.OutType && !template.OutType.toString().match(/default/i)) {
					return undefined
				}
			}
		} else {
			const template = config.showStyle.GFXTemplates.find(templ =>
				templ.INewsName ? templ.INewsName.toString().toUpperCase() === cue.vcpid.toString().toUpperCase() : false
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
	cue: CueDefinitionGrafik | CueDefinitionMOS
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

function GetTemplateName(config: OfftubeShowstyleBlueprintConfig, cue: CueDefinitionGrafik): string {
	if (config.showStyle.GFXTemplates) {
		const template = config.showStyle.GFXTemplates.find(templ =>
			templ.INewsName ? templ.INewsName.toString().toUpperCase() === cue.template.toUpperCase() : false
		)
		if (template && template.VizTemplate.toString().length) {
			return template.VizTemplate.toString()
		}
	}

	// This means unconfigured templates will still be supported, with default out.
	return cue.template
}

function GetDefaultOut(config: OfftubeShowstyleBlueprintConfig): number {
	if (config.showStyle.DefaultTemplateDuration !== undefined) {
		return Number(config.showStyle.DefaultTemplateDuration) * 1000
	}

	return 4 * 1000
}
