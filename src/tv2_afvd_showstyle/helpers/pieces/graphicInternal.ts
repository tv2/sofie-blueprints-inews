import { SourceLayer } from '../../layers'
import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	CueDefinitionGraphic,
	GetDefaultOut,
	GetFullGraphicTemplateNameFromCue,
	GetInfiniteModeForGraphic,
	GraphicDisplayName,
	GraphicInternal,
	literal,
	PartContext2,
	PartDefinition
} from 'tv2-common'
import { BlueprintConfig } from '../config'
import { CreateTimingGrafik, GetEnableForGrafik, GetSourceLayerForGrafik, GetTimelineLayerForGrafik } from './graphic'

export function EvaluateCueGraphicInternal(
	config: BlueprintConfig,
	context: PartContext2,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	adlib: boolean,
	partDefinition?: PartDefinition,
	rank?: number
) {
	// Whether this graphic "sticks" to the source it was first assigned to.
	// e.g. if this is attached to Live 1, when Live 1 is recalled later in a segment,
	//  this graphic should be shown again.
	const isStickyIdent = !!parsedCue.graphic.template.match(/direkte/i)

	const mappedTemplate = GetFullGraphicTemplateNameFromCue(config, parsedCue)

	if (!mappedTemplate || !mappedTemplate.length) {
		context.warning(`No valid template found for ${parsedCue.graphic.template}`)
		return
	}

	const engine = parsedCue.target

	const sourceLayerId =
		engine === 'TLF'
			? SourceLayer.PgmGraphicsTLF
			: GetSourceLayerForGrafik(config, GetFullGraphicTemplateNameFromCue(config, parsedCue), isStickyIdent)

	const outputLayerId = engine === 'WALL' ? 'sec' : 'overlay'

	const name = GraphicDisplayName(config, parsedCue)

	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name,
				sourceLayerId,
				outputLayerId,
				...(engine === 'TLF' || (parsedCue.end && parsedCue.end.infiniteMode)
					? {}
					: { expectedDuration: CreateTimingGrafik(config, parsedCue).duration || GetDefaultOut(config) }),
				lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue, isStickyIdent),
				content: literal<GraphicsContent>({
					fileName: parsedCue.graphic.template,
					path: parsedCue.graphic.template,
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: GetEnableForGrafik(config, engine, parsedCue, isStickyIdent, partDefinition),
							priority: 1,
							layer: GetTimelineLayerForGrafik(config, GetFullGraphicTemplateNameFromCue(config, parsedCue)),
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: mappedTemplate,
								templateData: parsedCue.graphic.textFields,
								channelName: engine === 'WALL' ? 'WALL1' : 'OVL1' // TODO: TranslateEngine
							}
						})
					])
				})
			})
		)
	} else {
		const piece = literal<IBlueprintPiece>({
			externalId: partId,
			name,
			...(engine === 'TLF' || engine === 'WALL'
				? { enable: { start: 0 } }
				: {
						enable: {
							...CreateTimingGrafik(config, parsedCue, !isStickyIdent)
						}
				  }),
			outputLayerId,
			sourceLayerId,
			lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue, isStickyIdent),
			content: literal<GraphicsContent>({
				fileName: parsedCue.graphic.template,
				path: parsedCue.graphic.template,
				ignoreMediaObjectStatus: true,
				timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
					literal<TSR.TimelineObjVIZMSEElementInternal>({
						id: '',
						enable: GetEnableForGrafik(config, engine, parsedCue, isStickyIdent, partDefinition),
						priority: 1,
						layer: GetTimelineLayerForGrafik(config, GetFullGraphicTemplateNameFromCue(config, parsedCue)),
						content: {
							deviceType: TSR.DeviceType.VIZMSE,
							type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
							templateName: mappedTemplate,
							templateData: parsedCue.graphic.textFields,
							channelName: engine === 'WALL' ? 'WALL1' : 'OVL1' // TODO: TranslateEngine
						}
					})
				])
			})
		})
		pieces.push(piece)

		if (
			sourceLayerId === SourceLayer.PgmGraphicsIdentPersistent &&
			(piece.lifespan === PieceLifespan.OutOnSegmentEnd || piece.lifespan === PieceLifespan.OutOnRundownEnd) &&
			isStickyIdent
		) {
			// Special case for the ident. We want it to continue to exist in case the Live gets shown again, but we dont want the continuation showing in the ui.
			// So we create the normal object on a hidden layer, and then clone it on another layer without content for the ui
			pieces.push(
				literal<IBlueprintPiece>({
					...piece,
					enable: { ...CreateTimingGrafik(config, parsedCue, true) }, // Allow default out for visual representation
					sourceLayerId: SourceLayer.PgmGraphicsIdent,
					lifespan: PieceLifespan.WithinPart,
					content: undefined
				})
			)
		}
	}
}
