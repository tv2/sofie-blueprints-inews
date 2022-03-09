import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	TSR
} from '@tv2media/blueprints-integration'
import {
	CueDefinitionGraphic,
	GetDefaultOut,
	GraphicInternal,
	IsStickyIdent,
	literal,
	PartDefinition,
	PieceMetaData,
	TV2BlueprintConfig
} from 'tv2-common'
import { AbstractLLayer, AdlibTags, SharedOutputLayers, SharedSourceLayers } from 'tv2-constants'
import _ = require('underscore')
import {
	CreateTimingGraphic,
	GetFullGraphicTemplateNameFromCue,
	GetInfiniteModeForGraphic,
	GetSourceLayerForGraphic,
	GraphicDisplayName,
	IsTargetingOVL,
	IsTargetingTLF,
	IsTargetingWall
} from '..'
import { GetInternalGraphicContentCaspar } from '../caspar'
import { GetInternalGraphicContentVIZ } from '../viz'

export function CreateInternalGraphic(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
	part: Readonly<IBlueprintPart>,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	adlib: boolean,
	partDefinition: PartDefinition,
	rank?: number
) {
	// Whether this graphic "sticks" to the source it was first assigned to.
	// e.g. if this is attached to Live 1, when Live 1 is recalled later in a segment,
	//  this graphic should be shown again.
	const isStickyIdent = IsStickyIdent(parsedCue)

	const mappedTemplate = GetFullGraphicTemplateNameFromCue(config, parsedCue)

	if (!mappedTemplate || !mappedTemplate.length) {
		context.notifyUserWarning(`No valid template found for ${parsedCue.graphic.template}`)
		return
	}

	const engine = parsedCue.target

	const sourceLayerId = IsTargetingTLF(engine)
		? SharedSourceLayers.PgmGraphicsTLF
		: GetSourceLayerForGraphic(config, mappedTemplate, isStickyIdent)

	const outputLayerId = IsTargetingWall(engine) ? SharedOutputLayers.SEC : SharedOutputLayers.OVERLAY

	const name = GraphicDisplayName(config, parsedCue)

	const content =
		config.studio.GraphicsType === 'HTML'
			? GetInternalGraphicContentCaspar(
					config,
					part,
					engine,
					parsedCue,
					isStickyIdent,
					partDefinition,
					mappedTemplate,
					adlib
			  )
			: GetInternalGraphicContentVIZ(
					config,
					part,
					engine,
					parsedCue,
					isStickyIdent,
					partDefinition,
					mappedTemplate,
					adlib
			  )

	if (adlib) {
		if (IsTargetingOVL(engine)) {
			const adLibPiece = literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name,
				uniquenessId: `gfx_${name}_${sourceLayerId}_${outputLayerId}_commentator`,
				sourceLayerId,
				outputLayerId: SharedOutputLayers.OVERLAY,
				lifespan: PieceLifespan.WithinPart,
				metaData: literal<PieceMetaData>({
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					}
				}),
				expectedDuration: 5000,
				tags: [AdlibTags.ADLIB_KOMMENTATOR],
				content: _.clone(content),
				noHotKey: true
			})
			adlibPieces.push(adLibPiece)
		}

		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name,
				uniquenessId: `gfx_${name}_${sourceLayerId}_${outputLayerId}_flow`,
				sourceLayerId,
				outputLayerId,
				tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
				...(IsTargetingTLF(engine) || (parsedCue.end && parsedCue.end.infiniteMode)
					? {}
					: { expectedDuration: CreateTimingGraphic(config, parsedCue).duration || GetDefaultOut(config) }),
				lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue, isStickyIdent),
				metaData: literal<PieceMetaData>({
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					}
				}),
				content: _.clone(content)
			})
		)
	} else {
		const piece = literal<IBlueprintPiece>({
			externalId: partId,
			name,
			...(IsTargetingTLF(engine) || IsTargetingWall(engine)
				? { enable: { start: 0 } }
				: {
						enable: {
							...CreateTimingGraphic(config, parsedCue, !isStickyIdent)
						}
				  }),
			outputLayerId,
			sourceLayerId,
			lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue, isStickyIdent),
			metaData: literal<PieceMetaData>({
				sisyfosPersistMetaData: {
					sisyfosLayers: []
				}
			}),
			content: _.clone(content)
		})
		pieces.push(piece)

		if (
			sourceLayerId === SharedSourceLayers.PgmGraphicsIdentPersistent &&
			(piece.lifespan === PieceLifespan.OutOnSegmentEnd || piece.lifespan === PieceLifespan.OutOnShowStyleEnd) &&
			isStickyIdent
		) {
			// Special case for the ident. We want it to continue to exist in case the Live gets shown again, but we dont want the continuation showing in the ui.
			// So we create the normal object on a hidden layer, and then clone it on another layer without content for the ui
			pieces.push(
				literal<IBlueprintPiece>({
					...piece,
					enable: { ...CreateTimingGraphic(config, parsedCue, true) }, // Allow default out for visual representation
					sourceLayerId: SharedSourceLayers.PgmGraphicsIdent,
					lifespan: PieceLifespan.WithinPart,
					metaData: literal<PieceMetaData>({
						sisyfosPersistMetaData: {
							sisyfosLayers: []
						}
					}),
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
