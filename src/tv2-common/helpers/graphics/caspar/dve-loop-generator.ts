import { TSR } from 'blueprints-integration'
import { CasparCgGfxDesignValues, CueDefinitionGfxSchema, ShowStyleContext } from 'tv2-common'
import { SharedCasparLLayer } from 'tv2-constants'

export class DveLoopGenerator {
	public createCasparCgDveLoopsFromCue(
		context: ShowStyleContext,
		cue: CueDefinitionGfxSchema,
		priority?: number
	): TSR.TimelineObjCCGMedia[] {
		if (!cue.CasparCgDesignValues?.length) {
			const errorMessage = `No CasparCG Design Values configured for Schema "${cue.schema}"`
			context.core.notifyUserError(errorMessage)
			return []
		}
		return cue.CasparCgDesignValues.map((designValues) =>
			this.createDveLoopTimelineObjectForSchema(cue.schema, designValues, priority)
		)
	}

	private createDveLoopTimelineObjectForSchema(
		schemaName: string,
		design: CasparCgGfxDesignValues,
		priority?: number
	): TSR.TimelineObjCCGMedia {
		return {
			id: '',
			enable: {
				while: `.${schemaName} & .${design.name}`
			},
			priority: priority ?? 100,
			layer: SharedCasparLLayer.CasparCGDVELoop,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.MEDIA,
				file: `dve/${design.backgroundLoop}`,
				loop: true
			}
		}
	}

	public createDveLoopTimelineObject(fileName: string): TSR.TimelineObjCCGMedia[] {
		return [
			{
				id: '',
				enable: { start: 0 },
				priority: 100,
				layer: SharedCasparLLayer.CasparCGDVELoop,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file: `dve/${fileName}`,
					loop: true
				}
			}
		]
	}
}
