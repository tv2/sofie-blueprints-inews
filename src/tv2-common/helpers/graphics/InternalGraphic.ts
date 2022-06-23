import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ICommonContext,
	PieceLifespan,
	TSR
} from '@tv2media/blueprints-integration'
import _ = require('underscore')
import {
	AbstractLLayer,
	AdlibActionType,
	AdlibTags,
	GraphicEngine,
	SharedOutputLayers,
	SharedSourceLayers
} from '../../../tv2-constants'
import { ActionPlayGraphics } from '../../actions'
import { TV2BlueprintConfig } from '../../blueprintConfig'
import { GetDefaultOut } from '../../cueTiming'
import { CueDefinitionGraphic, GraphicInternal, IsStickyIdent, PartDefinition } from '../../inewsConversion'
import { PieceMetaData } from '../../onTimelineGenerate'
import { generateExternalId, literal } from '../../util'
import { t } from '../translation'
import { GetInternalGraphicContentCaspar } from './caspar'
import { GetSourceLayerForGraphic } from './layers'
import { GetFullGraphicTemplateNameFromCue, GraphicDisplayName } from './name'
import { IsTargetingOVL, IsTargetingTLF, IsTargetingWall } from './target'
import { CreateTimingGraphic, GetInfiniteModeForGraphic } from './timing'
import { GetInternalGraphicContentVIZ } from './viz'

export class InternalGraphic {
	public mappedTemplate: string
	private readonly config: TV2BlueprintConfig
	private readonly parsedCue: CueDefinitionGraphic<GraphicInternal>
	private readonly partDefinition?: PartDefinition
	private readonly adlib: boolean
	private readonly isStickyIdent: boolean
	private readonly engine: GraphicEngine
	private readonly name: string
	private readonly sourceLayerId: SharedSourceLayers
	private readonly outputLayerId: SharedOutputLayers
	private readonly partId?: string
	private readonly rank?: number
	private readonly content: IBlueprintPiece['content']

	public constructor(
		config: TV2BlueprintConfig,
		parsedCue: CueDefinitionGraphic<GraphicInternal>,
		adlib: boolean,
		partId?: string,
		partDefinition?: PartDefinition,
		rank?: number
	) {
		const isStickyIdent = IsStickyIdent(parsedCue)

		const engine = parsedCue.target

		const mappedTemplate = GetFullGraphicTemplateNameFromCue(config, parsedCue)

		const sourceLayerId = GetSourceLayerForGraphic(config, mappedTemplate, isStickyIdent)

		this.config = config
		this.parsedCue = parsedCue
		this.partDefinition = partDefinition
		this.adlib = adlib
		this.mappedTemplate = mappedTemplate
		this.isStickyIdent = isStickyIdent
		this.engine = parsedCue.target
		this.name = GraphicDisplayName(config, parsedCue)
		this.sourceLayerId = sourceLayerId
		this.outputLayerId = IsTargetingWall(engine) ? SharedOutputLayers.SEC : SharedOutputLayers.OVERLAY
		this.partId = partId
		this.rank = rank
		this.content = this.getInternalGraphicContent()
	}

	public createAdlibTargetingOVL(
		context: ICommonContext,
		actions: IBlueprintActionManifest[],
		adlibPieces: IBlueprintAdLibPiece[]
	): void {
		if (IsTargetingOVL(this.engine) && this.isStickyIdent) {
			const userData = literal<ActionPlayGraphics>({
				type: AdlibActionType.PLAY_GRAPHICS,
				graphic: this.parsedCue
			})
			actions.push(
				literal<IBlueprintActionManifest>({
					externalId: generateExternalId(context, userData),
					actionId: AdlibActionType.PLAY_GRAPHICS,
					userData,
					userDataManifest: {},
					display: {
						_rank: this.rank || 0,
						label: t(this.name),
						uniquenessId: `gfx_${this.name}_${this.sourceLayerId}_${this.outputLayerId}_commentator`,
						sourceLayerId: this.sourceLayerId,
						outputLayerId: SharedOutputLayers.OVERLAY,
						tags: [AdlibTags.ADLIB_KOMMENTATOR],
						content: _.clone(this.content)
					}
				})
			)
		} else if (IsTargetingOVL(this.engine)) {
			const adLibPiece = literal<IBlueprintAdLibPiece>({
				_rank: this.rank || 0,
				externalId: this.partId ?? '',
				name: this.name,
				uniquenessId: `gfx_${this.name}_${this.sourceLayerId}_${this.outputLayerId}_commentator`,
				sourceLayerId: this.sourceLayerId,
				outputLayerId: SharedOutputLayers.OVERLAY,
				lifespan: PieceLifespan.WithinPart,
				metaData: literal<PieceMetaData>({
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					}
				}),
				expectedDuration: 5000,
				tags: [AdlibTags.ADLIB_KOMMENTATOR],
				content: _.clone(this.content)
			})
			adlibPieces.push(adLibPiece)
		}
	}

	public createAdlib(
		context: ICommonContext,
		actions: IBlueprintActionManifest[],
		adlibPieces: IBlueprintAdLibPiece[]
	): void {
		if (this.isStickyIdent) {
			const userData = literal<ActionPlayGraphics>({
				type: AdlibActionType.PLAY_GRAPHICS,
				graphic: this.parsedCue
			})
			actions.push(
				literal<IBlueprintActionManifest>({
					externalId: generateExternalId(context, userData),
					actionId: AdlibActionType.PLAY_GRAPHICS,
					userData,
					userDataManifest: {},
					display: {
						_rank: this.rank || 0,
						label: t(this.name),
						uniquenessId: `gfx_${this.name}_${this.sourceLayerId}_${this.outputLayerId}_flow`,
						sourceLayerId: this.sourceLayerId,
						outputLayerId: SharedOutputLayers.OVERLAY,
						tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
						content: _.clone(this.content)
					}
				})
			)
		} else {
			adlibPieces.push(
				literal<IBlueprintAdLibPiece>({
					_rank: this.rank || 0,
					externalId: this.partId ?? '',
					name: this.name,
					uniquenessId: `gfx_${this.name}_${this.sourceLayerId}_${this.outputLayerId}_flow`,
					sourceLayerId: this.sourceLayerId,
					outputLayerId: this.outputLayerId,
					tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
					...(IsTargetingTLF(this.engine) || (this.parsedCue.end && this.parsedCue.end.infiniteMode)
						? {}
						: {
								expectedDuration:
									CreateTimingGraphic(this.config, this.parsedCue).duration || GetDefaultOut(this.config)
						  }),
					lifespan: GetInfiniteModeForGraphic(this.engine, this.config, this.parsedCue, this.isStickyIdent),
					metaData: literal<PieceMetaData>({
						sisyfosPersistMetaData: {
							sisyfosLayers: []
						}
					}),
					content: _.clone(this.content)
				})
			)
		}
	}

	public createPiece(pieces: IBlueprintPiece[]): void {
		const piece = literal<IBlueprintPiece>({
			externalId: this.partId ?? '',
			name: this.name,
			...(IsTargetingTLF(this.engine) || IsTargetingWall(this.engine)
				? { enable: { start: 0 } }
				: {
						enable: {
							...CreateTimingGraphic(this.config, this.parsedCue, !this.isStickyIdent)
						}
				  }),
			outputLayerId: this.outputLayerId,
			sourceLayerId: this.sourceLayerId,
			lifespan: GetInfiniteModeForGraphic(this.engine, this.config, this.parsedCue, this.isStickyIdent),
			metaData: literal<PieceMetaData>({
				sisyfosPersistMetaData: {
					sisyfosLayers: []
				}
			}),
			content: _.clone(this.content)
		})
		pieces.push(piece)

		if (
			this.sourceLayerId === SharedSourceLayers.PgmGraphicsIdentPersistent &&
			(piece.lifespan === PieceLifespan.OutOnSegmentEnd || piece.lifespan === PieceLifespan.OutOnShowStyleEnd) &&
			this.isStickyIdent
		) {
			// Special case for the ident. We want it to continue to exist in case the Live gets shown again, but we dont want the continuation showing in the ui.
			// So we create the normal object on a hidden layer, and then clone it on another layer without content for the ui
			pieces.push(this.createIndicatorPieceForIdentPersistent(piece))
		}
	}

	public createIndicatorPieceForIdentPersistent(piece: IBlueprintPiece): IBlueprintPiece {
		return literal<IBlueprintPiece>({
			...piece,
			enable: { ...CreateTimingGraphic(this.config, this.parsedCue, true) }, // Allow default out for visual representation
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
	}

	private getInternalGraphicContent(): IBlueprintPiece['content'] {
		return this.config.studio.GraphicsType === 'HTML'
			? GetInternalGraphicContentCaspar(
					this.config,
					this.engine,
					this.parsedCue,
					this.isStickyIdent,
					this.partDefinition,
					this.mappedTemplate,
					this.adlib
			  )
			: GetInternalGraphicContentVIZ(
					this.config,
					this.engine,
					this.parsedCue,
					this.isStickyIdent,
					this.partDefinition,
					this.mappedTemplate,
					this.adlib
			  )
	}
}
