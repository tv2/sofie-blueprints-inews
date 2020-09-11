import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	CalculateTime,
	CueDefinition,
	CueDefinitionDesign,
	CueDefinitionGrafik,
	CueDefinitionMOS,
	GetDefaultOut,
	GetFullGrafikTemplateNameFromCue,
	GraphicLLayer,
	LifeSpan,
	literal,
	PartContext2,
	PartDefinition,
	PartToParentClass
} from 'tv2-common'
import { ControlClasses, CueType, GraphicEngine } from 'tv2-constants'
import { SourceLayer } from '../../layers'
import { BlueprintConfig } from '../config'
import { EvaluateDesign } from './design'

export function EvaluateGrafikViz(
	config: BlueprintConfig,
	context: PartContext2,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGrafik,
	engine: GraphicEngine,
	adlib: boolean,
	partDefinition?: PartDefinition,
	isTlfPrimary?: boolean,
	rank?: number
) {
	if (config.showStyle.GFXTemplates) {
		const template = config.showStyle.GFXTemplates.find(
			templ =>
				templ.INewsName === parsedCue.template &&
				templ.INewsCode.toString()
					.replace(/=/gi, '')
					.toUpperCase() === parsedCue.cue.toUpperCase()
		)
		if (template) {
			if (template.IsDesign) {
				const designCue: CueDefinitionDesign = {
					type: CueType.Design,
					design: parsedCue.template,
					start: {
						...parsedCue.start
					},
					end: {
						...parsedCue.end
					},
					iNewsCommand: '#KG'
				}
				EvaluateDesign(config, context, pieces, adlibPieces, actions, partId, designCue)
				return
			}
		}
	}

	const isIdentGrafik = !!parsedCue.template.match(/direkte/i)

	const mappedTemplate = GetFullGrafikTemplateNameFromCue(config, parsedCue)

	if (!mappedTemplate || !mappedTemplate.length) {
		context.warning(`No valid template found for ${parsedCue.template}`)
		return
	}

	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: grafikName(config, parsedCue),
				sourceLayerId: isTlfPrimary
					? SourceLayer.PgmGraphicsTLF
					: GetSourceLayerForGrafik(config, GetFullGrafikTemplateNameFromCue(config, parsedCue)),
				outputLayerId: engine === 'WALL' ? 'sec' : 'overlay',
				...(isTlfPrimary || (parsedCue.end && parsedCue.end.infiniteMode)
					? {}
					: { expectedDuration: CreateTimingGrafik(config, parsedCue).duration || GetDefaultOut(config) }),
				lifespan: GetInfiniteModeForGrafik(engine, config, parsedCue, isTlfPrimary, isIdentGrafik),
				content: literal<GraphicsContent>({
					fileName: parsedCue.template,
					path: parsedCue.template,
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: GetTimelineLayerForGrafik(config, GetFullGrafikTemplateNameFromCue(config, parsedCue)),
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: mappedTemplate,
								templateData: parsedCue.textFields,
								channelName: engine.match(/WALL/i) ? 'WALL1' : 'OVL1'
							}
						})
					])
				})
			})
		)
	} else {
		const sourceLayer = isTlfPrimary
			? SourceLayer.PgmGraphicsTLF
			: GetSourceLayerForGrafik(config, GetFullGrafikTemplateNameFromCue(config, parsedCue))

		const piece = literal<IBlueprintPiece>({
			externalId: partId,
			name: grafikName(config, parsedCue),
			...(isTlfPrimary || engine === 'WALL'
				? { enable: { start: 0 } }
				: {
						enable: {
							...CreateTimingGrafik(config, parsedCue)
						}
				  }),
			outputLayerId: engine === 'WALL' ? 'sec' : 'overlay',
			sourceLayerId: sourceLayer,
			lifespan: GetInfiniteModeForGrafik(engine, config, parsedCue, isTlfPrimary, isIdentGrafik),
			content: literal<GraphicsContent>({
				fileName: parsedCue.template,
				path: parsedCue.template,
				ignoreMediaObjectStatus: true,
				timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
					literal<TSR.TimelineObjVIZMSEElementInternal>({
						id: '',
						enable: GetEnableForGrafik(engine, parsedCue, isIdentGrafik, partDefinition),
						priority: 1,
						layer: GetTimelineLayerForGrafik(config, GetFullGrafikTemplateNameFromCue(config, parsedCue)),
						content: {
							deviceType: TSR.DeviceType.VIZMSE,
							type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
							templateName: mappedTemplate,
							templateData: parsedCue.textFields,
							channelName: !!engine.match(/WALL/i) ? 'WALL1' : 'OVL1'
						}
					})
				])
			})
		})
		pieces.push(piece)

		if (
			sourceLayer === SourceLayer.PgmGraphicsIdentPersistent &&
			(piece.lifespan === PieceLifespan.OutOnSegmentEnd || piece.lifespan === PieceLifespan.OutOnRundownEnd)
		) {
			// Special case for the ident. We want it to continue to exist in case the Live gets shown again, but we dont want the continuation showing in the ui.
			// So we create the normal object on a hidden layer, and then clone it on another layer without content for the ui
			pieces.push(
				literal<IBlueprintPiece>({
					...piece,
					sourceLayerId: SourceLayer.PgmGraphicsIdent,
					lifespan: PieceLifespan.WithinPart,
					content: undefined
				})
			)
		}
	}
}

export function GetEnableForGrafik(
	engine: GraphicEngine,
	cue: CueDefinition,
	isIdentGrafik: boolean,
	partDefinition?: PartDefinition
): { while: string } | { start: number } {
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

	return {
		while: '!.full'
	}
}

export function GetInfiniteModeForGrafik(
	engine: GraphicEngine,
	config: BlueprintConfig,
	parsedCue: CueDefinitionGrafik,
	isTlf?: boolean,
	isIdent?: boolean
): PieceLifespan {
	return engine === 'WALL'
		? PieceLifespan.OutOnRundownEnd
		: isTlf
		? PieceLifespan.WithinPart
		: isIdent
		? PieceLifespan.OutOnSegmentEnd
		: parsedCue.end && parsedCue.end.infiniteMode
		? LifeSpan(parsedCue.end.infiniteMode, PieceLifespan.WithinPart)
		: FindInfiniteModeFromConfig(config, parsedCue)
}

export function FindInfiniteModeFromConfig(config: BlueprintConfig, parsedCue: CueDefinitionGrafik): PieceLifespan {
	if (config.showStyle.GFXTemplates) {
		const template = GetFullGrafikTemplateNameFromCue(config, parsedCue)
		const conf = config.showStyle.GFXTemplates.find(cnf =>
			cnf.VizTemplate ? cnf.VizTemplate.toString().toUpperCase() === template.toUpperCase() : false
		)

		if (!conf) {
			return PieceLifespan.WithinPart
		}

		if (!conf.OutType || !conf.OutType.toString().length) {
			return PieceLifespan.WithinPart
		}

		const type = conf.OutType.toString().toUpperCase()

		if (type !== 'B' && type !== 'S' && type !== 'O') {
			return PieceLifespan.WithinPart
		}

		return LifeSpan(type, PieceLifespan.WithinPart)
	}

	return PieceLifespan.WithinPart
}

export function GetSourceLayerForGrafik(config: BlueprintConfig, name: string) {
	const conf = config.showStyle.GFXTemplates
		? config.showStyle.GFXTemplates.find(gfk => gfk.VizTemplate.toString() === name)
		: undefined

	if (!conf) {
		return SourceLayer.PgmGraphicsOverlay
	}

	switch (conf.SourceLayer) {
		// TODO: When adding more sourcelayers
		// This is here to guard against bad user input
		case SourceLayer.PgmGraphicsHeadline:
			return SourceLayer.PgmGraphicsHeadline
		case SourceLayer.PgmGraphicsIdent:
			return SourceLayer.PgmGraphicsIdentPersistent
		case SourceLayer.PgmGraphicsLower:
			return SourceLayer.PgmGraphicsLower
		case SourceLayer.PgmGraphicsOverlay:
			return SourceLayer.PgmGraphicsOverlay
		case SourceLayer.PgmGraphicsTLF:
			return SourceLayer.PgmGraphicsTLF
		case SourceLayer.PgmGraphicsTema:
			return SourceLayer.PgmGraphicsTema
		case SourceLayer.PgmGraphicsTop:
			return SourceLayer.PgmGraphicsTop
		case SourceLayer.WallGraphics:
			return SourceLayer.WallGraphics
		default:
			return SourceLayer.PgmGraphicsOverlay
	}
}

export function GetTimelineLayerForGrafik(config: BlueprintConfig, name: string) {
	const conf = config.showStyle.GFXTemplates
		? config.showStyle.GFXTemplates.find(gfk => gfk.VizTemplate.toString() === name)
		: undefined

	if (!conf) {
		return GraphicLLayer.GraphicLLayerDesign
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

export function grafikName(config: BlueprintConfig, parsedCue: CueDefinitionGrafik | CueDefinitionMOS): string {
	if (parsedCue.type === CueType.Grafik) {
		return `${
			parsedCue.template ? `${GetFullGrafikTemplateNameFromCue(config, parsedCue)}` : ''
		}${parsedCue.textFields.filter(txt => !txt.match(/^;.\.../i)).map(txt => ` - ${txt}`)}`.replace(/,/gi, '')
	} else {
		return `${parsedCue.name ? parsedCue.name : ''}`
	}
}

export function CreateTimingGrafik(
	config: BlueprintConfig,
	cue: CueDefinitionGrafik | CueDefinitionMOS,
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

export function GetGrafikDuration(
	config: BlueprintConfig,
	cue: CueDefinitionGrafik | CueDefinitionMOS,
	defaultTime: boolean
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

	return defaultTime ? GetDefaultOut(config) : undefined
}
