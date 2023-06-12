import { Timeline, TSR } from '@sofie-automation/blueprints-integration'
import { mock } from 'ts-mockito'
import { CueDefinitionGfxSchema, ShowStyleContext } from 'tv2-common'
import { CueType, SharedCasparLLayer } from 'tv2-constants'
import { DveLoopGenerator } from '../dve-loop-generator'

describe('DveLoopGenerator', () => {
	describe('createCasparCgDveLoopsFromCue', () => {
		it('does not have any CasparCgDesignValues configured - throws error', () => {
			const context = mock<ShowStyleContext>()
			const cue: CueDefinitionGfxSchema = {
				type: CueType.GraphicSchema,
				schema: 'randomSchema',
				iNewsCommand: ''
			}

			const testee: DveLoopGenerator = new DveLoopGenerator()
			expect(() => {
				testee.createCasparCgDveLoopsFromCue(context, cue)
			}).toThrow()
		})

		it('has an empty CasparCgDesignValues array configured - throws error', () => {
			const context = mock<ShowStyleContext>()
			const cue: CueDefinitionGfxSchema = {
				type: CueType.GraphicSchema,
				schema: 'randomSchema',
				iNewsCommand: '',
				CasparCgDesignValues: []
			}

			const testee: DveLoopGenerator = new DveLoopGenerator()
			expect(() => {
				testee.createCasparCgDveLoopsFromCue(context, cue)
			}).toThrow()
		})

		it('has one CasparCgDesignValue configured - returns one TimelineObject', () => {
			const context = mock<ShowStyleContext>()
			const cue: CueDefinitionGfxSchema = {
				type: CueType.GraphicSchema,
				schema: 'randomSchema',
				iNewsCommand: '',
				CasparCgDesignValues: [{ name: 'someName', backgroundLoop: 'someLoop', cssRules: ['someRule'] }]
			}

			const testee: DveLoopGenerator = new DveLoopGenerator()
			const result = testee.createCasparCgDveLoopsFromCue(context, cue)

			expect(result).toHaveLength(1)
		})

		it('has 5 CasparCgDesignValues configured - returns five TimelineObjects', () => {
			const context = mock<ShowStyleContext>()

			const cue: CueDefinitionGfxSchema = {
				type: CueType.GraphicSchema,
				schema: 'randomSchema',
				iNewsCommand: '',
				CasparCgDesignValues: new Array(5).map(() => ({
					name: 'someName',
					backgroundLoop: 'someLoop',
					cssRules: ['someRule']
				}))
			}

			const testee: DveLoopGenerator = new DveLoopGenerator()
			const result = testee.createCasparCgDveLoopsFromCue(context, cue)

			expect(result).toHaveLength(5)
		})

		it('sets the enable to be while .schema and .design name', () => {
			const context = mock<ShowStyleContext>()
			const schemaName = 'someSchemaName'
			const designName = 'someDesignName'

			const cue: CueDefinitionGfxSchema = {
				type: CueType.GraphicSchema,
				schema: schemaName,
				iNewsCommand: '',
				CasparCgDesignValues: [
					{
						name: designName,
						backgroundLoop: 'someLoop',
						cssRules: []
					}
				]
			}

			const testee: DveLoopGenerator = new DveLoopGenerator()
			const result = testee.createCasparCgDveLoopsFromCue(context, cue)
			const timelineEnable: Timeline.TimelineEnable = result[0].enable as Timeline.TimelineEnable
			const references: string[] = (timelineEnable.while as string).split('&').map((s) => s.trim())

			expect(references).toHaveLength(2)
			expect(references).toContain(`.${schemaName}`)
			expect(references).toContain(`.${designName}`)
			expect(references[0]).not.toEqual(references[1])
		})

		it('creates the timelineObject on CasparCgDveLoop layer', () => {
			const context = mock<ShowStyleContext>()
			const cue = createCueDefinitionGfxSchema()

			const testee: DveLoopGenerator = new DveLoopGenerator()
			const result = testee.createCasparCgDveLoopsFromCue(context, cue)

			expect(result[0].layer).toBe(SharedCasparLLayer.CasparCGDVELoop)
		})

		function createCueDefinitionGfxSchema(): CueDefinitionGfxSchema {
			const cue: CueDefinitionGfxSchema = {
				type: CueType.GraphicSchema,
				schema: 'someSchemaName',
				iNewsCommand: '',
				CasparCgDesignValues: [
					{
						name: 'someDesignName',
						backgroundLoop: 'someLoop',
						cssRules: []
					}
				]
			}
			return cue
		}

		it('gets no priority - priority is set to 100', () => {
			const context = mock<ShowStyleContext>()
			const cue = createCueDefinitionGfxSchema()

			const testee: DveLoopGenerator = new DveLoopGenerator()
			const result: TSR.TimelineObjCCGMedia[] = testee.createCasparCgDveLoopsFromCue(context, cue)

			expect(result[0].priority).toBe(100)
		})

		it('gets a priority - priority is set to the parsed priority', () => {
			const context = mock<ShowStyleContext>()
			const cue = createCueDefinitionGfxSchema()
			const priority = 50

			const testee: DveLoopGenerator = new DveLoopGenerator()
			const result: TSR.TimelineObjCCGMedia[] = testee.createCasparCgDveLoopsFromCue(context, cue, priority)

			expect(result[0].priority).toBe(priority)
		})

		it('creates the timelineObject with DeviceType CasparCG', () => {
			const context = mock<ShowStyleContext>()
			const cue = createCueDefinitionGfxSchema()

			const testee: DveLoopGenerator = new DveLoopGenerator()
			const result: TSR.TimelineObjCCGMedia[] = testee.createCasparCgDveLoopsFromCue(context, cue)

			expect(result[0].content.deviceType).toBe(TSR.DeviceType.CASPARCG)
		})

		it('creates the timelineObject with CasparCG media type', () => {
			const context = mock<ShowStyleContext>()
			const cue = createCueDefinitionGfxSchema()

			const testee: DveLoopGenerator = new DveLoopGenerator()
			const result: TSR.TimelineObjCCGMedia[] = testee.createCasparCgDveLoopsFromCue(context, cue)

			expect(result[0].content.type).toBe(TSR.TimelineContentTypeCasparCg.MEDIA)
		})

		it('sets the background loop as file prefixed with "dve/"', () => {
			const context = mock<ShowStyleContext>()
			const cue = createCueDefinitionGfxSchema()

			const testee: DveLoopGenerator = new DveLoopGenerator()
			const result: TSR.TimelineObjCCGMedia[] = testee.createCasparCgDveLoopsFromCue(context, cue)

			expect(result[0].content.file).toBe(`dve/${cue.CasparCgDesignValues![0].backgroundLoop}`)
		})

		it('sets loop to be true', () => {
			const context = mock<ShowStyleContext>()
			const cue = createCueDefinitionGfxSchema()

			const testee: DveLoopGenerator = new DveLoopGenerator()
			const result: TSR.TimelineObjCCGMedia[] = testee.createCasparCgDveLoopsFromCue(context, cue)

			expect(result[0].content.loop).toBeTruthy()
		})
	})
})
