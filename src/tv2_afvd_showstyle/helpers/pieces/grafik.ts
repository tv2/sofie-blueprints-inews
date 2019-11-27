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
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import {
	CueDefinitionDesign,
	CueDefinitionGrafik,
	CueDefinitionMOS,
	CueType
} from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { VizLLayer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'
import { EvaluateDesign } from './design'
import { CalculateTime, InfiniteMode } from './evaluateCues'

/**
 * @returns {true} If a cue is a grafik
 */
export function IsGrafik(rawString: string): boolean {
	return !!rawString.match(/^(?:kg |DIGI=)/)
}

export function EvaluateGrafik(
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionGrafik,
	adlib: boolean,
	isTlf?: boolean,
	rank?: number
) {
	if (config.showStyle.GFXTemplates) {
		const template = config.showStyle.GFXTemplates.find(
			templ =>
				templ.INewsName === parsedCue.template &&
				templ.INewsCode.toString()
					.replace(/=/g, '')
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
					}
				}
				EvaluateDesign(config, pieces, adlibPieces, partId, designCue)
				return
			}
		}
	}
	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: grafikName(config, parsedCue),
				sourceLayerId: isTlf
					? SourceLayer.PgmGraphicsTLF
					: GetSourceLayerForGrafik(config, GetTemplateName(config, parsedCue)),
				outputLayerId: 'overlay',
				...(isTlf ? {} : { expectedDuration: GetGrafikDuration(config, parsedCue) }),
				infiniteMode: isTlf
					? PieceLifespan.OutOnNextPart
					: parsedCue.end && parsedCue.end.infiniteMode
					? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
					: PieceLifespan.Normal,
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
								templateName: GetTemplateName(config, parsedCue),
								templateData: parsedCue.textFields,
								channelName: 'FULL1'
							}
						})
					])
				})
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: grafikName(config, parsedCue),
				...(isTlf
					? { enable: { start: 0 } }
					: {
							enable: {
								...CreateTimingGrafik(config, parsedCue)
							}
					  }),
				outputLayerId: 'overlay',
				sourceLayerId: isTlf
					? SourceLayer.PgmGraphicsTLF
					: GetSourceLayerForGrafik(config, GetTemplateName(config, parsedCue)),
				infiniteMode: isTlf
					? PieceLifespan.OutOnNextPart
					: parsedCue.end && parsedCue.end.infiniteMode
					? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
					: PieceLifespan.Normal,
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
								templateName: GetTemplateName(config, parsedCue),
								templateData: parsedCue.textFields,
								channelName: 'FULL1'
							}
						})
					])
				})
			})
		)
	}
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
			return SourceLayer.PgmGraphicsIdent
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
		default:
			return VizLLayer.VizLLayerOverlay
	}
}

export function grafikName(config: BlueprintConfig, parsedCue: CueDefinitionGrafik | CueDefinitionMOS): string {
	if (parsedCue.type === CueType.Grafik) {
		return `${parsedCue.template ? `${GetTemplateName(config, parsedCue)}` : ''}${parsedCue.textFields
			.filter(txt => !txt.match(/^;.\.../))
			.map(txt => ` - ${txt}`)}`.replace(/,/g, '')
	} else {
		return `${parsedCue.name ? parsedCue.name : ''}`
	}
}

export function CreateTimingGrafik(
	config: BlueprintConfig,
	cue: CueDefinitionGrafik | CueDefinitionMOS
): { start: number; end?: number } {
	const ret: { start: number; end?: number } = { start: 0, end: 0 }
	const start = cue.start ? CalculateTime(cue.start) : 0
	start !== undefined ? (ret.start = start) : (ret.start = 0)

	const end = cue.end ? CalculateTime(cue.end) : ret.start + GetGrafikDuration(config, cue)
	ret.end = end

	return ret
}

export function GetGrafikDuration(config: BlueprintConfig, cue: CueDefinitionGrafik | CueDefinitionMOS): number {
	if (config.showStyle.GFXTemplates) {
		if (cue.type === CueType.Grafik) {
			const template = config.showStyle.GFXTemplates.find(templ =>
				templ.INewsName ? templ.INewsName.toString().toUpperCase() === cue.template.toUpperCase() : false
			)
			if (template) {
				if (template.OutType && !template.OutType.toString().match(/default/i)) {
					return 0
				}
			}
		} else {
			const template = config.showStyle.GFXTemplates.find(templ =>
				templ.INewsName ? templ.INewsName.toString().toUpperCase() === cue.vcpid.toString().toUpperCase() : false
			)
			if (template) {
				if (template.OutType && !template.OutType.toString().match(/default/i)) {
					return 0
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
	if (config.showStyle.DefaultTemplateDuration! === undefined) {
		return Number(config.showStyle.DefaultTemplateDuration) * 1000
	}

	return 4 * 1000
}
