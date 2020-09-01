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
	CueDefinitionGrafik,
	CueDefinitionMOS,
	GetFullGrafikTemplateNameFromCue,
	GetTagForFull,
	GetTagForFullNext,
	GraphicLLayer,
	LifeSpan,
	literal,
	PartContext2,
	PartDefinition,
	PartToParentClass,
	TimelineBlueprintExt,
	TranslateEngine
} from 'tv2-common'
import { AdlibActionType, AdlibTags, ControlClasses, CueType, Enablers, GraphicEngine, TallyTags } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer } from '../../tv2_offtube_studio/layers'
import { AtemSourceIndex } from '../../types/atem'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateGrafikCaspar(
	config: OfftubeShowstyleBlueprintConfig,
	_context: PartContext2,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
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
		const grafikTemplateName = GetFullGrafikTemplateNameFromCue(config, parsedCue)
		const adLibPiece = CreateFullAdLib(
			config,
			partDefinition.externalId,
			grafikTemplateName,
			partDefinition.segmentExternalId
		)

		actions.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.SELECT_FULL_GRAFIK,
				userData: literal<ActionSelectFullGrafik>({
					type: AdlibActionType.SELECT_FULL_GRAFIK,
					template: parsedCue.template,
					segmentExternalId: partDefinition.segmentExternalId
				}),
				userDataManifest: {},
				display: {
					label: GetFullGrafikTemplateNameFromCue(config, parsedCue),
					sourceLayerId: OfftubeSourceLayer.PgmFull,
					outputLayerId: OfftubeOutputLayers.PGM,
					content: { ...adLibPiece.content, timelineObjects: [] },
					tags: [AdlibTags.ADLIB_KOMMENTATOR, AdlibTags.ADLIB_FLOW_PRODUCER],
					onAirTags: [GetTagForFull(partDefinition.segmentExternalId, grafikTemplateName)],
					setNextTags: [GetTagForFullNext(partDefinition.segmentExternalId, grafikTemplateName)]
				}
			})
		)

		const piece = CreateFullPiece(
			config,
			partDefinition.externalId,
			GetFullGrafikTemplateNameFromCue(config, parsedCue),
			partDefinition.segmentExternalId
		)
		pieces.push(piece)
	} else {
		// TODO: Wall

		if (parsedCue.adlib) {
			const adLibPiece = literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partDefinition.externalId,
				name: `${grafikName(config, parsedCue)}`,
				sourceLayerId: GetSourceLayerForGrafik(config, GetFullGrafikTemplateNameFromCue(config, parsedCue)),
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
					name: `${grafikName(config, parsedCue)}`,
					sourceLayerId: GetSourceLayerForGrafik(config, GetFullGrafikTemplateNameFromCue(config, parsedCue)),
					outputLayerId: OfftubeOutputLayers.OVERLAY,
					lifespan: GetInfiniteModeForGrafik(engine, config, parsedCue, isTlfPrimary, isIdentGrafik),
					tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
					...(isTlfPrimary || (parsedCue.end && parsedCue.end.infiniteMode)
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
				name: `${grafikName(config, parsedCue)}`,
				...(isTlfPrimary || engine === 'WALL'
					? { enable: { start: 0 } }
					: {
							enable: {
								...CreateTimingGrafik(config, parsedCue)
							}
					  }),
				sourceLayerId: GetSourceLayerForGrafik(config, GetFullGrafikTemplateNameFromCue(config, parsedCue)),
				outputLayerId: OfftubeOutputLayers.OVERLAY,
				lifespan: GetInfiniteModeForGrafik(engine, config, parsedCue, isTlfPrimary, isIdentGrafik),
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
}

export function GetCasparOverlayTimeline(
	config: OfftubeShowstyleBlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGrafik,
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
			layer: GetTimelineLayerForGrafik(config, GetFullGrafikTemplateNameFromCue(config, parsedCue)),
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				// tslint:disable-next-line: prettier
				templateType: "html",
				// tslint:disable-next-line: prettier
				name: "sport-overlay/index",
				data: `<templateData>${encodeURI(
					JSON.stringify({
						// tslint:disable-next-line: prettier
						display: "program",
						slots: createContentForGraphicTemplate(GetFullGrafikTemplateNameFromCue(config, parsedCue), parsedCue)
					})
				)}</templateData>`,
				useStopCommand: false
			}
		})
	]
}

export function createContentForGraphicTemplate(graphicName: string, parsedCue: CueDefinitionGrafik): Partial<Slots> {
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
		case 'lowerThird':
			return {
				lowerThird: {
					display: 'program',
					payload: {
						type: GraphicName.BUND,
						trompet: parsedCue.textFields[1], // TODO: Should be text:
						name: parsedCue.textFields[0]
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
		case 'headline':
			return {
				lowerThird: {
					display: 'program',
					payload: {
						type: GraphicName.HEADLINE,
						trompet: parsedCue.textFields[1],
						text: parsedCue.textFields[0]
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
					payload: literal<Topt>({
						type: GraphicName.TOPT,
						name: parsedCue.textFields[0],
						title: parsedCue.textFields[1]
					})
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
	template: string,
	segmentExternalId: string
): IBlueprintPiece {
	return literal<IBlueprintPiece>({
		enable: {
			start: 0 // TODO: Time
		},
		externalId,
		name: `${template}`,
		sourceLayerId: OfftubeSourceLayer.PgmFull,
		outputLayerId: OfftubeOutputLayers.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: CreateFullContent(config, template),
		tags: [
			GetTagForFull(segmentExternalId, template),
			GetTagForFullNext(segmentExternalId, template),
			TallyTags.FULL_IS_LIVE
		]
	})
}

function CreateFullAdLib(
	config: OfftubeShowstyleBlueprintConfig,
	externalId: string,
	template: string,
	segmentExternalId: string
): IBlueprintAdLibPiece {
	return literal<IBlueprintAdLibPiece>({
		_rank: 0,
		externalId,
		name: `${template}`,
		sourceLayerId: OfftubeSourceLayer.PgmFull,
		outputLayerId: OfftubeOutputLayers.PGM,
		toBeQueued: true,
		adlibPreroll: config.studio.CasparPrerollDuration,
		adlibTransitionKeepAlive: config.studio.FullKeepAliveDuration ? Number(config.studio.FullKeepAliveDuration) : 60000,
		lifespan: PieceLifespan.WithinPart,
		tags: [AdlibTags.ADLIB_FLOW_PRODUCER, AdlibTags.ADLIB_KOMMENTATOR],
		onAirTags: [GetTagForFull(segmentExternalId, template)],
		setNextTags: [GetTagForFullNext(segmentExternalId, template)],
		content: CreateFullContent(config, template)
	})
}

export function CreateFullContent(config: OfftubeShowstyleBlueprintConfig, template: string): GraphicsContent {
	return {
		fileName: template,
		path: `${config.studio.NetworkBasePath}\\${template}.png`, // full path on the source network storage, TODO: File extension
		mediaFlowIds: [config.studio.MediaFlowId],
		timelineObjects: [
			literal<TSR.TimelineObjCCGMedia>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 100,
				layer: OfftubeCasparLLayer.CasparGraphicsFull,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					playing: true,
					file: `${template}`,
					loop: true,
					mixer: {
						opacity: 100
					}
				}
			}),
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: {
					start: config.studio.CasparPrerollDuration
				},
				priority: 100,
				layer: OfftubeAtemLLayer.AtemMEClean,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						input: config.studio.AtemSource.GFXFull,
						transition: TSR.AtemTransitionStyle.WIPE,
						transitionSettings: {
							wipe: {
								// TODO: Expose to settings
								rate: 25, // 1s
								pattern: 1, // Vertical wipe
								borderSoftness: 7000,
								reverseDirection: true
							}
						}
					}
				},
				classes: [ControlClasses.NOLookahead]
			}),
			literal<TSR.TimelineObjAtemDSK>({
				id: '',
				enable: {
					start: config.studio.CasparPrerollDuration
				},
				priority: 100,
				layer: OfftubeAtemLLayer.AtemDSKGraphics,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.DSK,
					dsk: {
						onAir: false
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

	const timing = CreateTimingEnable(cue, GetDefaultOut(config))

	if (!timing.lifespan) {
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
		? PieceLifespan.OutOnRundownEnd
		: isTlf
		? PieceLifespan.WithinPart
		: isIdent
		? PieceLifespan.OutOnSegmentEnd
		: parsedCue.end && parsedCue.end.infiniteMode
		? LifeSpan(parsedCue.end.infiniteMode, PieceLifespan.WithinPart)
		: FindInfiniteModeFromConfig(config, parsedCue)
}

export function FindInfiniteModeFromConfig(
	config: OfftubeShowstyleBlueprintConfig,
	parsedCue: CueDefinitionGrafik
): PieceLifespan {
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
		return `${
			parsedCue.template
				? `${GetFullGrafikTemplateNameFromCue(config, parsedCue)}${parsedCue.textFields.length ? ' - ' : ''}`
				: ''
		}${parsedCue.textFields.filter(txt => !txt.match(/^;.\.../i)).join('\n - ')}`.replace(/,/gi, '')
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

function GetDefaultOut(config: OfftubeShowstyleBlueprintConfig): number {
	if (config.showStyle.DefaultTemplateDuration !== undefined) {
		return Number(config.showStyle.DefaultTemplateDuration) * 1000
	}

	return 4 * 1000
}
