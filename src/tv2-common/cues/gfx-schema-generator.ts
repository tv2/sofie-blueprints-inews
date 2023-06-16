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
import { DveLoopGenerator } from '../helpers/graphics/caspar/dve-loop-generator'

export class GfxSchemaGenerator {
	constructor(private dveLoopGenerator: DveLoopGenerator) {}

	public createTimelineObjectsFromGfxDefaults(context: ShowStyleContext): TSR.TSRTimelineObjBase[] {
		const schemaName = context.config.showStyle.GfxDefaults[0].DefaultSchema.label
		const schema: TableConfigGfxSchema | undefined = context.config.showStyle.GfxSchemaTemplates.find(
			(s) => s.GfxSchemaTemplatesName === schemaName
		)
		if (!schema || !schema.CasparCgDesignValues) {
			context.core.notifyUserError(
				`Unable to create baseline DVE loops for CasparCG. Check GfxDefaults Schema is configured.`
			)
			throw new Error(`Incorrectly configured GfxDefaults.schema`)
		}

		const cue: CueDefinitionGfxSchema = {
			type: CueType.GraphicSchema,
			schema: schema.VizTemplate,
			CasparCgDesignValues: schema.CasparCgDesignValues ? JSON.parse(schema.CasparCgDesignValues) : [],
			iNewsCommand: ''
		}
		return this.createTimelineObjects(context, cue, 10)
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
			lifespan: PieceLifespan.OutOnRundownChange,
			content: literal<WithTimeline<GraphicsContent>>({
				fileName: cue.schema,
				path: cue.schema,
				ignoreMediaObjectStatus: true,
				timelineObjects: this.createTimelineObjects(context, cue)
			})
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

	private createVizSchemaTimelineObject(
		config: TV2ShowStyleConfig,
		cue: CueDefinitionGfxSchema
	): TSR.TimelineObjVIZMSEElementInternal {
		return literal<TSR.TimelineObjVIZMSEElementInternal>({
			id: '',
			enable: { start: 0 },
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
		})
	}

	private createCasparCgSchemaTimelineObject(
		context: ShowStyleContext,
		cue: CueDefinitionGfxSchema
	): TSR.TimelineObjCasparCGBase {
		return literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: { start: 0 },
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
		})
	}

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
