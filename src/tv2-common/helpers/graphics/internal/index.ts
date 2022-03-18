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
	ActionPlayGraphics,
	CueDefinitionGraphic,
	GetDefaultOut,
	GraphicInternal,
	IsStickyIdent,
	literal,
	PartDefinition,
	t,
	TV2BlueprintConfig
} from 'tv2-common'
import {
	AbstractLLayer,
	AdlibActionType,
	AdlibTags,
	GraphicEngine,
	SharedOutputLayers,
	SharedSourceLayers
} from 'tv2-constants'
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

export interface InternalGraphic {
	config: TV2BlueprintConfig
	part?: Readonly<IBlueprintPart>
	parsedCue: CueDefinitionGraphic<GraphicInternal>
	partDefinition?: PartDefinition
	adlib: boolean
	mappedTemplate: string
	isStickyIdent: boolean
	engine: GraphicEngine
	name: string
	sourceLayerId: SharedSourceLayers
	outputLayerId: SharedOutputLayers
	partId?: string
	rank?: number
}

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
	const internalGraphic: InternalGraphic = getInternalGraphic(
		config,
		parsedCue,
		adlib,
		part,
		partId,
		partDefinition,
		rank
	)

	if (!internalGraphic.mappedTemplate || !internalGraphic.mappedTemplate.length) {
		context.notifyUserWarning(`No valid template found for ${parsedCue.graphic.template}`)
		return
	}

	const content: IBlueprintPiece['content'] = getInternalGraphicContent(internalGraphic)

	if (adlib) {
		createAdlibTargetingOVL(internalGraphic, _actions, adlibPieces, content)
		createAdlib(internalGraphic, _actions, adlibPieces, content)
	} else {
		createPiece(internalGraphic, pieces, content)
	}
}

export function getInternalGraphic(
	config: TV2BlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	adlib: boolean,
	part?: Readonly<IBlueprintPart>,
	partId?: string,
	partDefinition?: PartDefinition,
	rank?: number
): InternalGraphic {
	// Whether this graphic "sticks" to the source it was first assigned to.
	// e.g. if this is attached to Live 1, when Live 1 is recalled later in a segment,
	//  this graphic should be shown again.
	const isStickyIdent = IsStickyIdent(parsedCue)

	const engine = parsedCue.target

	const mappedTemplate = GetFullGraphicTemplateNameFromCue(config, parsedCue)

	const sourceLayerId = IsTargetingTLF(engine)
		? SharedSourceLayers.PgmGraphicsTLF
		: GetSourceLayerForGraphic(config, mappedTemplate, isStickyIdent)

	const outputLayerId = IsTargetingWall(engine) ? SharedOutputLayers.SEC : SharedOutputLayers.OVERLAY

	const name = GraphicDisplayName(config, parsedCue)
	return {
		config,
		part,
		parsedCue,
		partDefinition,
		adlib,
		mappedTemplate,
		isStickyIdent,
		engine: parsedCue.target,
		name,
		sourceLayerId,
		outputLayerId,
		partId,
		rank
	}
}

export function getInternalGraphicContent(internalGraphic: InternalGraphic): IBlueprintPiece['content'] {
	return internalGraphic.config.studio.GraphicsType === 'HTML'
		? GetInternalGraphicContentCaspar(
				internalGraphic.config,
				internalGraphic.part,
				internalGraphic.engine,
				internalGraphic.parsedCue,
				internalGraphic.isStickyIdent,
				internalGraphic.partDefinition,
				internalGraphic.mappedTemplate,
				internalGraphic.adlib
		  )
		: GetInternalGraphicContentVIZ(
				internalGraphic.config,
				internalGraphic.part,
				internalGraphic.engine,
				internalGraphic.parsedCue,
				internalGraphic.isStickyIdent,
				internalGraphic.partDefinition,
				internalGraphic.mappedTemplate,
				internalGraphic.adlib
		  )
}

function createAdlibTargetingOVL(
	internalGraphic: InternalGraphic,
	_actions: IBlueprintActionManifest[],
	adlibPieces: IBlueprintAdLibPiece[],
	content: IBlueprintPiece['content']
): void {
	if (IsTargetingOVL(internalGraphic.engine) && internalGraphic.isStickyIdent) {
		_actions.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.PLAY_GRAPHICS,
				userData: literal<ActionPlayGraphics>({
					type: AdlibActionType.PLAY_GRAPHICS,
					graphic: internalGraphic.parsedCue
				}),
				userDataManifest: {},
				display: {
					_rank: internalGraphic.rank || 0,
					label: t(internalGraphic.name),
					uniquenessId: `gfx_${internalGraphic.name}_${internalGraphic.sourceLayerId}_${internalGraphic.outputLayerId}_commentator`,
					sourceLayerId: internalGraphic.sourceLayerId,
					outputLayerId: SharedOutputLayers.OVERLAY,
					tags: [AdlibTags.ADLIB_KOMMENTATOR],
					content: _.clone(content),
					noHotKey: true
				}
			})
		)
	} else if (IsTargetingOVL(internalGraphic.engine)) {
		const adLibPiece = literal<IBlueprintAdLibPiece>({
			_rank: internalGraphic.rank || 0,
			externalId: internalGraphic.partId ?? '',
			name: internalGraphic.name,
			uniquenessId: `gfx_${internalGraphic.name}_${internalGraphic.sourceLayerId}_${internalGraphic.outputLayerId}_commentator`,
			sourceLayerId: internalGraphic.sourceLayerId,
			outputLayerId: SharedOutputLayers.OVERLAY,
			lifespan: PieceLifespan.WithinPart,
			expectedDuration: 5000,
			tags: [AdlibTags.ADLIB_KOMMENTATOR],
			content: _.clone(content),
			noHotKey: true
		})
		adlibPieces.push(adLibPiece)
	}
}

function createAdlib(
	internalGraphic: InternalGraphic,
	_actions: IBlueprintActionManifest[],
	adlibPieces: IBlueprintAdLibPiece[],
	content: IBlueprintPiece['content']
): void {
	if (internalGraphic.isStickyIdent) {
		_actions.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.PLAY_GRAPHICS,
				userData: literal<ActionPlayGraphics>({
					type: AdlibActionType.PLAY_GRAPHICS,
					graphic: internalGraphic.parsedCue
				}),
				userDataManifest: {},
				display: {
					_rank: internalGraphic.rank || 0,
					label: t(internalGraphic.name),
					uniquenessId: `gfx_${internalGraphic.name}_${internalGraphic.sourceLayerId}_${internalGraphic.outputLayerId}_flow`,
					sourceLayerId: internalGraphic.sourceLayerId,
					outputLayerId: SharedOutputLayers.OVERLAY,
					tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
					content: _.clone(content)
				}
			})
		)
	} else {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: internalGraphic.rank || 0,
				externalId: internalGraphic.partId ?? '',
				name: internalGraphic.name,
				uniquenessId: `gfx_${internalGraphic.name}_${internalGraphic.sourceLayerId}_${internalGraphic.outputLayerId}_flow`,
				sourceLayerId: internalGraphic.sourceLayerId,
				outputLayerId: internalGraphic.outputLayerId,
				tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
				...(IsTargetingTLF(internalGraphic.engine) ||
				(internalGraphic.parsedCue.end && internalGraphic.parsedCue.end.infiniteMode)
					? {}
					: {
							expectedDuration:
								CreateTimingGraphic(internalGraphic.config, internalGraphic.parsedCue).duration ||
								GetDefaultOut(internalGraphic.config)
					  }),
				lifespan: GetInfiniteModeForGraphic(
					internalGraphic.engine,
					internalGraphic.config,
					internalGraphic.parsedCue,
					internalGraphic.isStickyIdent
				),
				content: _.clone(content)
			})
		)
	}
}

function createPiece(
	internalGraphic: InternalGraphic,
	pieces: IBlueprintPiece[],
	content: IBlueprintPiece['content']
): void {
	const piece = literal<IBlueprintPiece>({
		externalId: internalGraphic.partId ?? '',
		name: internalGraphic.name,
		...(IsTargetingTLF(internalGraphic.engine) || IsTargetingWall(internalGraphic.engine)
			? { enable: { start: 0 } }
			: {
					enable: {
						...CreateTimingGraphic(internalGraphic.config, internalGraphic.parsedCue, !internalGraphic.isStickyIdent)
					}
			  }),
		outputLayerId: internalGraphic.outputLayerId,
		sourceLayerId: internalGraphic.sourceLayerId,
		lifespan: GetInfiniteModeForGraphic(
			internalGraphic.engine,
			internalGraphic.config,
			internalGraphic.parsedCue,
			internalGraphic.isStickyIdent
		),
		content: _.clone(content)
	})
	pieces.push(piece)

	if (
		internalGraphic.sourceLayerId === SharedSourceLayers.PgmGraphicsIdentPersistent &&
		(piece.lifespan === PieceLifespan.OutOnSegmentEnd || piece.lifespan === PieceLifespan.OutOnShowStyleEnd) &&
		internalGraphic.isStickyIdent
	) {
		// Special case for the ident. We want it to continue to exist in case the Live gets shown again, but we dont want the continuation showing in the ui.
		// So we create the normal object on a hidden layer, and then clone it on another layer without content for the ui
		pieces.push(CreateContinuationPieceForIdentPersistent(piece, internalGraphic))
	}
}

export function CreateContinuationPieceForIdentPersistent(
	piece: IBlueprintPiece,
	internalGraphic: InternalGraphic
): IBlueprintPiece {
	return literal<IBlueprintPiece>({
		...piece,
		enable: { ...CreateTimingGraphic(internalGraphic.config, internalGraphic.parsedCue, true) }, // Allow default out for visual representation
		sourceLayerId: SharedSourceLayers.PgmGraphicsIdent,
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
}
