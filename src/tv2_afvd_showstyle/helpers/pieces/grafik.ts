import {
	DeviceType,
	TimelineContentTypeVizMSE,
	TimelineObjVIZMSEAny,
	TimelineObjVIZMSEElementInternal
} from 'timeline-state-resolver-types'
import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import {
	CueDefinitionDesign,
	CueDefinitionGrafik,
	CueDefinitionMOS,
	CueType,
	PartToParentClass
} from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { ControlClasses, SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { VizLLayer } from '../../../tv2_afvd_studio/layers'
import { VizEngine } from '../../../types/constants'
import { BlueprintConfig } from '../config'
import { EvaluateDesign } from './design'
import { CalculateTime, InfiniteMode } from './evaluateCues'

export function EvaluateGrafik(
	config: BlueprintConfig,
	context: PartContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionGrafik,
	engine: VizEngine,
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
				EvaluateDesign(config, context, pieces, adlibPieces, partId, designCue)
				return
			}
		}
	}

	const isIdentGrafik = !!parsedCue.template.match(/direkte/i)

	const mappedTemplate = GetTemplateName(config, parsedCue)

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
					: GetSourceLayerForGrafik(config, GetTemplateName(config, parsedCue)),
				outputLayerId: engine === 'WALL' ? 'sec' : 'overlay',
				...(isTlfPrimary ? {} : { expectedDuration: GetGrafikDuration(config, parsedCue) }),
				infiniteMode: GetInfiniteModeForGrafik(engine, config, parsedCue, isTlfPrimary, isIdentGrafik),
				content: literal<GraphicsContent>({
					fileName: parsedCue.template,
					path: parsedCue.template,
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: GetTimelineLayerForGrafik(config, GetTemplateName(config, parsedCue)),
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
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
			: GetSourceLayerForGrafik(config, GetTemplateName(config, parsedCue))

		const piece = literal<IBlueprintPiece>({
			_id: '',
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
			infiniteMode: GetInfiniteModeForGrafik(engine, config, parsedCue, isTlfPrimary, isIdentGrafik),
			content: literal<GraphicsContent>({
				fileName: parsedCue.template,
				path: parsedCue.template,
				timelineObjects: literal<TimelineObjVIZMSEAny[]>([
					literal<TimelineObjVIZMSEElementInternal>({
						id: '',
						enable: GetEnableForGrafik(engine, parsedCue, isIdentGrafik, partDefinition),
						priority: 1,
						layer: GetTimelineLayerForGrafik(config, GetTemplateName(config, parsedCue)),
						content: {
							deviceType: DeviceType.VIZMSE,
							type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
							templateName: mappedTemplate,
							templateData: parsedCue.textFields,
							channelName: engine.match(/WALL/i) ? 'WALL1' : 'OVL1'
						}
					})
				])
			})
		})
		pieces.push(piece)

		if (
			sourceLayer === SourceLayer.PgmGraphicsIdentPersistent &&
			(piece.infiniteMode === PieceLifespan.OutOnNextSegment || piece.infiniteMode === PieceLifespan.Infinite)
		) {
			// Special case for the ident. We want it to continue to exist in case the Live gets shown again, but we dont want the continuation showing in the ui.
			// So we create the normal object on a hidden layer, and then clone it on another layer without content for the ui
			pieces.push(
				literal<IBlueprintPiece>({
					...piece,
					_id: '',
					sourceLayerId: SourceLayer.PgmGraphicsIdent,
					infiniteMode: PieceLifespan.OutOnNextPart,
					content: undefined
				})
			)
		}
	}
}

function GetEnableForGrafik(
	engine: VizEngine,
	cue: CueDefinitionGrafik,
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
	engine: VizEngine,
	config: BlueprintConfig,
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

export function FindInfiniteModeFromConfig(config: BlueprintConfig, parsedCue: CueDefinitionGrafik): PieceLifespan {
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
		return VizLLayer.VizLLayerOverlay
	}

	switch (conf.LayerMapping) {
		// TODO: When adding more output layers
		case VizLLayer.VizLLayerOverlayIdent:
			return VizLLayer.VizLLayerOverlayIdent
		case VizLLayer.VizLLayerOverlayTopt:
			return VizLLayer.VizLLayerOverlayTopt
		case VizLLayer.VizLLayerOverlayLower:
			return VizLLayer.VizLLayerOverlayLower
		case VizLLayer.VizLLayerOverlayHeadline:
			return VizLLayer.VizLLayerOverlayHeadline
		case VizLLayer.VizLLayerOverlayTema:
			return VizLLayer.VizLLayerOverlayTema
		case VizLLayer.VizLLayerWall:
			return VizLLayer.VizLLayerWall
		default:
			return VizLLayer.VizLLayerOverlay
	}
}

export function grafikName(config: BlueprintConfig, parsedCue: CueDefinitionGrafik | CueDefinitionMOS): string {
	if (parsedCue.type === CueType.Grafik) {
		return `${parsedCue.template ? `${GetTemplateName(config, parsedCue)}` : ''}${parsedCue.textFields
			.filter(txt => !txt.match(/^;.\.../i))
			.map(txt => ` - ${txt}`)}`.replace(/,/gi, '')
	} else {
		return `${parsedCue.name ? parsedCue.name : ''}`
	}
}

export function CreateTimingGrafik(
	config: BlueprintConfig,
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

export function GetGrafikDuration(
	config: BlueprintConfig,
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

export function GetTemplateName(config: BlueprintConfig, cue: CueDefinitionGrafik): string {
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

export function GetDefaultOut(config: BlueprintConfig): number {
	if (config.showStyle.DefaultTemplateDuration !== undefined) {
		return Number(config.showStyle.DefaultTemplateDuration) * 1000
	}

	return 4 * 1000
}
