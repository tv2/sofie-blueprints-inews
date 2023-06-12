import { TSR } from '@sofie-automation/blueprints-integration'
import { CasparCgGfxDesignValues, CueDefinitionGfxSchema, ShowStyleContext } from 'tv2-common'
import { SharedCasparLLayer } from 'tv2-constants'

export class DveLoopGenerator {
	public createCasparCgDveLoopsFromCue(
		context: ShowStyleContext,
		cue: CueDefinitionGfxSchema,
		priority?: number
	): TSR.TimelineObjCCGMedia[] {
		if (!cue.CasparCgDesignValues || !cue.CasparCgDesignValues.length || cue.CasparCgDesignValues.length === 0) {
			const errorMessage = `No CasparCgDesignValues configured for Schema {${cue.schema}}`
			context.core.notifyUserError(errorMessage)
			throw new Error(errorMessage)
		}
		return cue.CasparCgDesignValues.map((designValues) =>
			this.createDveLoopTimelineObject(cue.schema, designValues, priority)
		)
	}

	private createDveLoopTimelineObject(
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
}
