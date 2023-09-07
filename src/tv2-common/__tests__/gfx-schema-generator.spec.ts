import { TSR } from 'blueprints-integration'
import { mock } from 'jest-mock-extended'
import {
	CasparCgGfxDesignValues,
	OVL_SHOW_PLACEHOLDER,
	TableConfigGfxSchema,
	TableConfigItemGfxDefaults
} from 'tv2-common'
import { SharedGraphicLLayer } from 'tv2-constants'
import { GfxSchemaGenerator } from '../cues/gfx-schema-generator'
import { DveLoopGenerator } from '../helpers/graphics/caspar/dve-loop-generator'
import { MockContextBuilder } from './mock-context-builder'

// tslint:disable:no-object-literal-type-assertion
describe('GfxSchemaGenerator', () => {
	describe('createTimelineObjectsFromGfxDefaults', () => {
		it('has no schema configured - notifies about error', () => {
			const context = new MockContextBuilder()
				.setGfxDefaults({
					DefaultSchema: { label: 'someSchema', value: 'someSchema' }
				})
				.build()

			const testee = createTestee()

			const result = testee.createBaselineTimelineObjectsFromGfxDefaults(context)
			expect(result).toBeTruthy()

			expect(context.core.notifyUserError).toBeCalledTimes(1)
		})

		function createTestee(dveLoopGenerator?: DveLoopGenerator) {
			if (!dveLoopGenerator) {
				const dveLoopGeneratorMock = mock<DveLoopGenerator>()
				dveLoopGeneratorMock.createCasparCgDveLoopsFromCue.mockReturnValue([])
				dveLoopGenerator = dveLoopGeneratorMock
			}
			return new GfxSchemaGenerator(dveLoopGenerator)
		}

		it('has schema configured, but no match from default schema - notifies about error', () => {
			const context = new MockContextBuilder()
				.setGfxDefaults({
					DefaultSchema: { value: 'someSchema', label: '' }
				})
				.setGfxSchemaTemplates([
					{
						GfxSchemaTemplatesName: 'someOtherSchema'
					}
				] as TableConfigGfxSchema[])
				.build()

			const testee = createTestee()
			const result = testee.createBaselineTimelineObjectsFromGfxDefaults(context)
			expect(result).toBeTruthy()

			expect(context.core.notifyUserError).toBeCalledTimes(1)
		})

		it('has correctly configured schema - does not notify about error', () => {
			const schemaId = 'someSchemaId'
			const context = new MockContextBuilder()
				.setGfxDefaults({
					DefaultSchema: { value: schemaId }
				} as TableConfigItemGfxDefaults)
				.setGfxSchemaTemplates([
					{
						_id: schemaId,
						GfxSchemaTemplatesName: 'SomeSchema',
						CasparCgDesignValues: '[{}]'
					}
				] as TableConfigGfxSchema[])
				.build()

			const testee = createTestee()
			const result = testee.createBaselineTimelineObjectsFromGfxDefaults(context)
			expect(result).toBeTruthy()

			console.log(context.core.notifyUserError.mock.calls)
			expect(context.core.notifyUserError).toBeCalledTimes(0)
		})

		describe('graphicsType is "VIZ"', () => {
			it('creates Viz timelineObject', () => {
				const schemaName = 'someSchema'
				const schemaId = 'someSchemaId'
				const vizTemplateName = 'someVizTemplate'
				const context = new MockContextBuilder()
					.setGraphicsType('VIZ')
					.setGfxDefaults({
						DefaultSchema: { label: schemaName, value: schemaId }
					})
					.setGfxSchemaTemplates([
						{
							_id: schemaId,
							GfxSchemaTemplatesName: schemaName,
							CasparCgDesignValues: '[{}]',
							VizTemplate: vizTemplateName,
							INewsSkemaColumn: ''
						}
					])
					.build()
				const testee = createTestee()

				const result = testee.createBaselineTimelineObjectsFromGfxDefaults(context)
				const schemaTimelineObject = result.find(
					(timelineObject) => timelineObject.layer === SharedGraphicLLayer.GraphicLLayerSchema
				)
				expect(schemaTimelineObject).toBeTruthy()
				const vizSchema = schemaTimelineObject as TSR.TimelineObjVIZMSEElementInternal
				expect(vizSchema.classes).toContain(vizTemplateName)
				expect(vizSchema.content.deviceType).toBe(TSR.DeviceType.VIZMSE)
				expect(vizSchema.content.type).toBe(TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL)
				expect(vizSchema.content.templateName).toBe(vizTemplateName)
				expect(vizSchema.content.showName).toBe(OVL_SHOW_PLACEHOLDER)
			})

			it('creates casparCg dve loop timelineObjects', () => {
				const schemaName = 'someSchema'
				const schemaId = 'someSchemaId'
				const context = new MockContextBuilder()
					.setGraphicsType('VIZ')
					.setGfxDefaults({
						DefaultSchema: { label: schemaName, value: schemaId }
					})
					.setGfxSchemaTemplates([
						{
							_id: schemaId,
							GfxSchemaTemplatesName: schemaName,
							CasparCgDesignValues: '[{}]'
						}
					] as TableConfigGfxSchema[])
					.build()

				const casparCgDveLoopTimelineObjects: TSR.TimelineObjCCGMedia[] = [
					{
						id: 'id1'
					},
					{
						id: 'id2'
					}
				] as TSR.TimelineObjCCGMedia[]

				const dveLoopGenerator = mock<DveLoopGenerator>()
				dveLoopGenerator.createCasparCgDveLoopsFromCue.mockReturnValue(casparCgDveLoopTimelineObjects)

				const testee = createTestee(dveLoopGenerator)
				const result = testee.createBaselineTimelineObjectsFromGfxDefaults(context)

				expect(dveLoopGenerator.createCasparCgDveLoopsFromCue).toBeCalled()
				expect(result.includes(casparCgDveLoopTimelineObjects[0])).toBeTruthy()
				expect(result.includes(casparCgDveLoopTimelineObjects[1])).toBeTruthy()
			})
		})

		describe('graphicsType is "HTML"', () => {
			it('creates CasparCG timelineObject', () => {
				const schemaName = 'someSchema'
				const schemaId = 'someSchemaId'
				const vizTemplateName = 'someVizTemplate'
				const casparCgDesignValues: CasparCgGfxDesignValues[] = [
					{
						name: 'designName',
						backgroundLoop: 'someBackgroundLoop',
						properties: {
							attribute1: 'value1',
							attribute2: 'value2',
							attribute3: 'value3'
						}
					}
				]
				const context = new MockContextBuilder()
					.setGraphicsType('HTML')
					.setGfxDefaults({
						DefaultSchema: { label: schemaName, value: schemaId }
					})
					.setGfxSchemaTemplates([
						{
							_id: schemaId,
							GfxSchemaTemplatesName: schemaName,
							CasparCgDesignValues: JSON.stringify(casparCgDesignValues),
							VizTemplate: vizTemplateName
						}
					] as TableConfigGfxSchema[])
					.build()
				const testee = createTestee()

				const result = testee.createBaselineTimelineObjectsFromGfxDefaults(context)
				const schemaTimelineObject = result.find(
					(timelineObject) => timelineObject.layer === SharedGraphicLLayer.GraphicLLayerSchema
				)
				expect(schemaTimelineObject).toBeTruthy()
				const casparCgSchema = schemaTimelineObject as TSR.TimelineObjCCGTemplate
				expect(casparCgSchema.classes).toContain(vizTemplateName)
				expect(casparCgSchema.content.deviceType).toBe(TSR.DeviceType.CASPARCG)
				expect(casparCgSchema.content.type).toBe(TSR.TimelineContentTypeCasparCg.TEMPLATE)
				expect(casparCgSchema.content.templateType).toBe('html')
				expect(casparCgSchema.content.data.designs).toStrictEqual(casparCgDesignValues)
			})

			it('creates casparCg dve loop timelineObjects', () => {
				const schemaName = 'someSchema'
				const schemaId = 'someSchemaId'
				const context = new MockContextBuilder()
					.setGraphicsType('HTML')
					.setGfxDefaults({
						DefaultSchema: { label: schemaName, value: schemaId }
					} as TableConfigItemGfxDefaults)
					.setGfxSchemaTemplates([
						{
							_id: schemaId,
							GfxSchemaTemplatesName: schemaName,
							CasparCgDesignValues: '[{}]'
						}
					] as TableConfigGfxSchema[])
					.build()

				const casparCgDveLoopTimelineObjects: TSR.TimelineObjCCGMedia[] = [
					{
						id: 'id1'
					},
					{
						id: 'id2'
					}
				] as TSR.TimelineObjCCGMedia[]

				const dveLoopGenerator = mock<DveLoopGenerator>()
				dveLoopGenerator.createCasparCgDveLoopsFromCue.mockReturnValue(casparCgDveLoopTimelineObjects)

				const testee = createTestee(dveLoopGenerator)
				const result = testee.createBaselineTimelineObjectsFromGfxDefaults(context)

				expect(dveLoopGenerator.createCasparCgDveLoopsFromCue).toBeCalled()
				expect(result.includes(casparCgDveLoopTimelineObjects[0])).toBeTruthy()
				expect(result.includes(casparCgDveLoopTimelineObjects[1])).toBeTruthy()
			})
		})
	})
})
