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
			templ => templ.iNewsName === parsedCue.template && templ.INewsCode.toString().replace(/=/g, '') === parsedCue.cue
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
				name: grafikName(parsedCue),
				sourceLayerId: isTlf ? SourceLayer.PgmGraphicsTLF : GetSourceLayerForGrafik(parsedCue.template),
				outputLayerId: 'pgm',
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
							layer: VizLLayer.VizLLayerOverlay,
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
				name: grafikName(parsedCue),
				...(isTlf
					? { enable: { start: 0 } }
					: {
							enable: {
								...CreateTimingGrafik(config, parsedCue)
							}
					  }),
				outputLayerId: 'pgm',
				sourceLayerId: isTlf ? SourceLayer.PgmGraphicsTLF : GetSourceLayerForGrafik(parsedCue.template),
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
							layer: VizLLayer.VizLLayerOverlay,
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

export function GetSourceLayerForGrafik(name: string) {
	// TODO: When new cues need adding
	switch (name) {
		case 'arkiv':
		case 'ident':
		case 'direkte':
		case 'billederfra_txt':
		case 'billederfra_logo':
		case 'ident_nyhederne':
		case 'ident_news':
		case 'ident_tv2sport':
		case 'tlfdirekte':
			return SourceLayer.PgmGraphicsIdent
		case 'topt':
		case 'tlftopt':
		case 'tlfoptlive':
			return SourceLayer.PgmGraphicsTop
		case 'bund':
		case 'vaerter':
			return SourceLayer.PgmGraphicsLower
		case 'vo':
		case 'trompet':
			return SourceLayer.PgmGraphicsHeadline
		case 'bundright':
		case 'TEMA_Default':
		case 'TEMA_UPDATE':
			return SourceLayer.PgmGraphicsTema
		case 'DESIGN_AFTERAAR_CYKEL':
		case 'DESIGN_HANDBOLD':
		case 'DESIGN_ISHOCKEY':
		case 'DESIGN_KONTRA':
		case 'DESIGN_NBA':
		case 'DESIGN_SPORTS-LAB':
		case 'DESIGN_WTA':
		case 'DESIGN_VUELTA':
		case 'DESIGN_VM':
		case 'DESIGN_WIMBLEDON':
		case 'DESIGN_TDF':
		case 'DESIGN_ESPORT':
			return SourceLayer.PgmDesign
		case 'BG_DVE_BADMINTON':
		case 'BG_DVE_KONTRA':
		case 'BG_DVE_NBA':
		case 'BG_DVE_WTA17':
		case 'BG_DVE_SPORTCENTER':
			return SourceLayer.PgmDVEBackground
		case 'altud':
		case 'OUT_LOWER':
		case 'OUT_HEADLINE':
		case 'OUT_IDENT':
		case 'OUT_TOP':
		case 'OUT_TEMA_H':
		case 'OUT_TRUMPET':
		case 'OUT_TEMA_GFX':
		case 'CLEAR_FULL':
		case 'CLEAR_LAYER':
		case 'CLEAR_RESET':
		case 'CLEAR_TROMPET':
		case 'CLEAR_WALL':
		case 'CLEAR_FULL_BACK':
			return SourceLayer.PgmAdlibVizCmd
		case 'FRONTLAYER_CONTINUE':
		case 'FRONT_LAYER_CONTINUE':
			return SourceLayer.PgmAdlibVizCmd
	}

	return SourceLayer.PgmPilot // TODO: Maybe some better default?
}

export function grafikName(parsedCue: CueDefinitionGrafik | CueDefinitionMOS): string {
	if (parsedCue.type === CueType.Grafik) {
		return `${parsedCue.template ? `${parsedCue.template}` : ''}${parsedCue.textFields
			.filter(txt => !txt.match(/^;.\.../))
			.map(txt => ` - ${txt}`)}`.replace(/,/g, '')
	} else {
		return `${parsedCue.name ? parsedCue.name : ''}`
	}
}

export function CreateTimingGrafik(
	config: BlueprintConfig,
	cue: CueDefinitionGrafik | CueDefinitionMOS
): { start: number; end: number } {
	const ret: { start: number; end: number } = { start: 0, end: 0 }
	cue.start ? (ret.start = CalculateTime(cue.start)) : (ret.start = 0)

	cue.end ? (ret.end = ret.start + CalculateTime(cue.end)) : (ret.end = ret.start + GetGrafikDuration(config, cue))

	return ret
}

export function GetGrafikDuration(config: BlueprintConfig, cue: CueDefinitionGrafik | CueDefinitionMOS): number {
	if (config.showStyle.GFXTemplates) {
		if (cue.type === CueType.Grafik) {
			const template = config.showStyle.GFXTemplates.find(templ => templ.iNewsName === cue.template)
			if (template) {
				if (template.OutType && !template.OutType.toString().match(/default/i)) {
					return 0
				}
			}
		} else {
			const template = config.showStyle.GFXTemplates.find(templ => templ.iNewsName === cue.vcpid)
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
		const template = config.showStyle.GFXTemplates.find(templ => templ.iNewsName === cue.template)
		if (template) {
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
