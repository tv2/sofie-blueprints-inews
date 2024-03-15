import { GraphicsContent, IBlueprintPiece, PieceLifespan, TSR, WithTimeline } from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionGfxSchema,
	getHtmlTemplateName,
	literal,
	ShowStyleContext,
	TableConfigGfxSchema,
	TV2ShowStyleConfig
} from 'tv2-common'
import { CueType, SharedGraphicLLayer, SharedOutputLayer, SharedSourceLayer } from 'tv2-constants'
import { Tv2PieceType } from '../../tv2-constants/tv2-piece-type'
import { DveLoopGenerator } from '../helpers/graphics/caspar/dve-loop-generator'

interface CasparCgDesignValues {
	name: string
	properties: unknown
}

const NON_BASELINE_SCHEMA: string = 'NON_BASELINE_SCHEMA'
const VALID_EMPTY_SCHEMA_VALUE: string = 'N/A'

export class GfxSchemaGenerator {
	constructor(private dveLoopGenerator: DveLoopGenerator) {}

	public createBaselineTimelineObjectsFromGfxDefaults(context: ShowStyleContext): TSR.TSRTimelineObjBase[] {
		this.assertAllCasparCgDesignValues(context)

		const schemaId: string = context.config.showStyle.GfxDefaults[0].DefaultSchema.value
		if (VALID_EMPTY_SCHEMA_VALUE === schemaId) {
			return []
		}
		const schema: TableConfigGfxSchema | undefined = context.config.showStyle.GfxSchemaTemplates.find(
			(s) => s._id === schemaId
		)
		if (!schema || !schema.CasparCgDesignValues) {
			context.core.notifyUserError(
				`Unable to create baseline DVE loops for CasparCG. Check GfxDefaults Schema is configured.`
			)
			return []
		}
		const cue: CueDefinitionGfxSchema = {
			type: CueType.GraphicSchema,
			schema: schema.VizTemplate,
			CasparCgDesignValues: schema.CasparCgDesignValues ? JSON.parse(schema.CasparCgDesignValues) : [],
			iNewsCommand: ''
		}
		return this.createBaselineTimelineObjects(context, cue, 10)
	}

	private assertAllCasparCgDesignValues(context: ShowStyleContext): void {
		context.config.showStyle.GfxSchemaTemplates.forEach((schema) => {
			if (!schema.CasparCgDesignValues) {
				return
			}
			const casparCgDesignValues: CasparCgDesignValues[] = JSON.parse(schema.CasparCgDesignValues)
			casparCgDesignValues.forEach((designValues) => {
				if (designValues.name && designValues.name.includes(' ')) {
					context.core.notifyUserError(
						`Schema for ${schema.VizTemplate} has invalid CasparCgDesignValues. The Design ${designValues.name} has whitespace in it's name!`
					)
				}
			})
		})
	}

	public createBlueprintPieceFromGfxSchemaCue(
		context: ShowStyleContext,
		pieces: IBlueprintPiece[],
		partId: string,
		cue: CueDefinitionGfxSchema
	): void {
		if (!cue.schema) {
			context.core.notifyUserWarning(`No valid Schema found for ${cue.schema}`)
			return
		}

		const start = (cue.start ? calculateTime(cue.start) : 0) ?? 0
		pieces.push({
			externalId: partId,
			name: cue.schema,
			enable: {
				start
			},
			outputLayerId: SharedOutputLayer.SEC,
			sourceLayerId: SharedSourceLayer.PgmSchema,
			// @ts-ignore
			lifespan: cue.isFromField ? 'rundown-change-segment-lookback' : PieceLifespan.OutOnRundownChange,
			content: literal<WithTimeline<GraphicsContent>>({
				fileName: cue.schema,
				path: cue.schema,
				ignoreMediaObjectStatus: true,
				timelineObjects: this.createTimelineObjects(context, cue)
			}),
			metaData: {
				type: Tv2PieceType.GRAPHICS
			}
		})
	}

	private createTimelineObjects(
		context: ShowStyleContext,
		cue: CueDefinitionGfxSchema,
		priority?: number
	): TSR.TSRTimelineObjBase[] {
		switch (context.config.studio.GraphicsType) {
			case 'VIZ': {
				return [
					this.createVizSchemaTimelineObject(context.config, cue),
					...this.dveLoopGenerator.createCasparCgDveLoopsFromCue(context, cue, priority)
				]
			}
			case 'HTML': {
				return [
					this.createCasparCgSchemaTimelineObject(context, cue),
					...this.dveLoopGenerator.createCasparCgDveLoopsFromCue(context, cue, priority)
				]
			}
			default: {
				return []
			}
		}
	}

	private createBaselineTimelineObjects(
		context: ShowStyleContext,
		cue: CueDefinitionGfxSchema,
		priority?: number
	): TSR.TSRTimelineObjBase[] {
		switch (context.config.studio.GraphicsType) {
			case 'VIZ': {
				return [
					this.createBaselineVizSchemaTimelineObject(context.config, cue),
					...this.dveLoopGenerator.createCasparCgDveLoopsFromCue(context, cue, priority)
				]
			}
			case 'HTML': {
				return [
					this.createBaselineCasparCgSchemaTimelineObject(context, cue),
					...this.dveLoopGenerator.createCasparCgDveLoopsFromCue(context, cue, priority)
				]
			}
			default: {
				return []
			}
		}
	}

	private createBaselineVizSchemaTimelineObject(
		config: TV2ShowStyleConfig,
		cue: CueDefinitionGfxSchema
	): TSR.TimelineObjVIZMSEElementInternal {
		return {
			id: '',
			enable: { while: `!.${NON_BASELINE_SCHEMA}` },
			priority: 100,
			classes: [cue.schema],
			layer: SharedGraphicLLayer.GraphicLLayerSchema,
			content: {
				deviceType: TSR.DeviceType.VIZMSE,
				type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
				templateName: cue.schema,
				templateData: [],
				showName: config.selectedGfxSetup.OvlShowName ?? ''
			}
		}
	}

	private createVizSchemaTimelineObject(
		config: TV2ShowStyleConfig,
		cue: CueDefinitionGfxSchema
	): TSR.TimelineObjVIZMSEElementInternal {
		return {
			...this.createBaselineVizSchemaTimelineObject(config, cue),
			enable: { start: 0 },
			classes: [cue.schema, NON_BASELINE_SCHEMA]
		}
	}

	private createBaselineCasparCgSchemaTimelineObject(
		context: ShowStyleContext,
		cue: CueDefinitionGfxSchema
	): TSR.TimelineObjCCGTemplate {
		return {
			id: '',
			enable: { while: `!.${NON_BASELINE_SCHEMA}` },
			priority: 100,
			classes: [cue.schema],
			layer: SharedGraphicLLayer.GraphicLLayerSchema,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				templateType: 'html',
				name: getHtmlTemplateName(context.config),
				data: this.createCasparCgHtmlSchemaData(context, cue),
				useStopCommand: false
			}
		}
	}

	private createCasparCgSchemaTimelineObject(
		context: ShowStyleContext,
		cue: CueDefinitionGfxSchema
	): TSR.TimelineObjCasparCGBase {
		return literal<TSR.TimelineObjCCGTemplate>({
			...this.createBaselineCasparCgSchemaTimelineObject(context, cue),
			enable: { start: 0 },
			classes: [cue.schema, NON_BASELINE_SCHEMA]
		})
	}

	// TODO: Remove any from return type
	private createCasparCgHtmlSchemaData(context: ShowStyleContext, cue: CueDefinitionGfxSchema): any {
		if (!cue.CasparCgDesignValues || cue.CasparCgDesignValues.length === 0) {
			context.core.notifyUserError(
				`Unable to find Schema Design combination for "${cue.schema}". Design values will not be sent to CasparCG!`
			)
			return {}
		}
		return {
			designs: cue.CasparCgDesignValues,
			partialUpdate: true
		}
	}
}
