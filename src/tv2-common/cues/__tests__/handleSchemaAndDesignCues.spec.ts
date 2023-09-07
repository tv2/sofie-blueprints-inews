import {
	CueDefinition,
	CueDefinitionGfxSchema,
	CueDefinitionGraphic,
	CueDefinitionGraphicDesign,
	CueDefinitionVariant,
	CueTime,
	GraphicInternal,
	literal,
	PartDefinition,
	TableConfigItemGfxDefaults
} from 'tv2-common'
import { CueType, PartType, SourceType } from 'tv2-constants'
import _ = require('underscore')
import { MockContextBuilder } from '../../__tests__/mock-context-builder'
import { handleSchemaAndDesignCues } from '../handleSchemaAndDesignCues'

const cueGrafik1: CueDefinitionGraphic<GraphicInternal> = {
	type: CueType.Graphic,
	target: 'OVL',
	graphic: {
		type: 'internal',
		template: 'bund',
		cue: 'kg',
		textFields: ['1']
	},
	adlib: true,
	iNewsCommand: 'kg'
}

function buildContext() {
	return new MockContextBuilder()
		.setGfxDefaults({
			DefaultSchema: { label: 'someSchema', value: 'schema0' },
			DefaultDesign: { label: 'someDesign', value: 'design0' },
			DefaultSetupName: { label: 'someSetup', value: 'setup0' }
		})
		.setGfxDesignTemplates([
			{ _id: 'design0', INewsName: '', VizTemplate: 'DesignTemplate0', INewsStyleColumn: '' },
			{ _id: 'design1', INewsName: '', VizTemplate: 'DesignTemplate1', INewsStyleColumn: '' }
		])
		.setGfxSchemaTemplates([
			{
				_id: 'schema0',
				VizTemplate: 'SchemaTemplate0',
				CasparCgDesignValues: '[]',
				GfxSchemaTemplatesName: '',
				INewsSkemaColumn: ''
			},
			{
				_id: 'schema1',
				VizTemplate: 'SchemaTemplate1',
				CasparCgDesignValues: '[]',
				GfxSchemaTemplatesName: '',
				INewsSkemaColumn: ''
			}
		])
		.setVariants([
			{
				_id: 'variantA',
				blueprintConfig: {
					GfxDefaults: [
						literal<TableConfigItemGfxDefaults>({
							DefaultSchema: { label: 'someSchema', value: 'schema1' },
							DefaultDesign: { label: 'someDesign', value: 'design1' },
							DefaultSetupName: { label: 'someSetup', value: 'setup0' }
						})
					]
				},
				name: 'VARIANT_A'
			},
			{
				_id: 'variantB',
				blueprintConfig: {
					GfxDefaults: [
						literal<TableConfigItemGfxDefaults>({
							DefaultSchema: { label: 'someSchema', value: 'schema0' },
							DefaultDesign: { label: 'someDesign', value: 'design0' },
							DefaultSetupName: { label: 'someSetup', value: 'setup0' }
						})
					]
				},
				name: 'VARIANT_B'
			}
		])
		.build()
}

function buildPartDefinitions(partCues1: CueDefinition[], partCues2: CueDefinition[] = []): PartDefinition[] {
	return _.clone([
		{
			type: PartType.Kam,
			rawType: 'KAM 1',
			cues: partCues1,
			script: 'Some script\n',
			sourceDefinition: { sourceType: SourceType.KAM, id: '1', raw: 'KAM 1', minusMic: false, name: 'KAM 1' },
			externalId: '',
			fields: {},
			modified: 0,
			storyName: 'test-segment',
			segmentExternalId: '00000000001'
		},
		{
			type: PartType.Kam,
			rawType: 'KAM 2',
			cues: partCues2,
			script: 'Some script\n',
			sourceDefinition: { sourceType: SourceType.KAM, id: '2', raw: 'KAM 2', minusMic: false, name: 'KAM 2' },
			externalId: '',
			fields: {},
			modified: 0,
			storyName: 'test-segment',
			segmentExternalId: '00000000001'
		}
	])
}

function createVariantCue(name: string, startTime?: CueTime): CueDefinitionVariant {
	return {
		type: CueType.Variant,
		name,
		iNewsCommand: '',
		start: startTime
	}
}

function createDesignCue(design: string, startTime?: CueTime): CueDefinitionGraphicDesign {
	return {
		type: CueType.GraphicDesign,
		design,
		iNewsCommand: '',
		start: startTime
	}
}

function createDesignFromField(design: string, startTime?: CueTime): CueDefinitionGraphicDesign {
	return {
		...createDesignCue(design, startTime),
		isFromField: true
	}
}

function createSchemaCue(schema: string, startTime?: CueTime): CueDefinitionGfxSchema {
	return {
		type: CueType.GraphicSchema,
		schema,
		iNewsCommand: '',
		start: startTime,
		CasparCgDesignValues: []
	}
}

function createSchemaFromField(schema: string, startTime?: CueTime): CueDefinitionGfxSchema {
	return {
		...createSchemaCue(schema, startTime),
		isFromField: true
	}
}

describe('handleSchemaAndDesignCues', () => {
	it('does nothing when there are no variant cues and no design/schema fields', () => {
		const partDefinitions: PartDefinition[] = buildPartDefinitions([cueGrafik1], [cueGrafik1])
		const result = handleSchemaAndDesignCues(buildContext(), partDefinitions)
		expect(result).toEqual(partDefinitions)
	})

	it('inserts default cues for a Variant cue', () => {
		const partDefinitions: PartDefinition[] = buildPartDefinitions(
			[cueGrafik1, createVariantCue('VARIANT_A')],
			[cueGrafik1]
		)
		const result = handleSchemaAndDesignCues(buildContext(), partDefinitions)
		const expectedPartDefinitions: PartDefinition[] = buildPartDefinitions(
			[
				cueGrafik1,
				createVariantCue('VARIANT_A'),
				createDesignCue('DesignTemplate1'),
				createSchemaCue('SchemaTemplate1')
			],
			[cueGrafik1]
		)
		expect(result).toEqual(expectedPartDefinitions)
	})

	it('respects timing when inserting default cues for a Variant cue', () => {
		const partDefinitions: PartDefinition[] = buildPartDefinitions(
			[createVariantCue('VARIANT_A', { seconds: 1, frames: 20 })],
			[cueGrafik1]
		)
		const result = handleSchemaAndDesignCues(buildContext(), partDefinitions)
		const expectedPartDefinitions: PartDefinition[] = buildPartDefinitions(
			[
				createVariantCue('VARIANT_A', { seconds: 1, frames: 20 }),
				createDesignCue('DesignTemplate1', { seconds: 1, frames: 20 }),
				createSchemaCue('SchemaTemplate1', { seconds: 1, frames: 20 })
			],
			[cueGrafik1]
		)
		expect(result).toEqual(expectedPartDefinitions)
	})

	it('inserts only Design for a Variant cue with existing Schema', () => {
		const partDefinitions: PartDefinition[] = buildPartDefinitions(
			[createVariantCue('VARIANT_A'), createSchemaCue('SchemaTemplateX')],
			[cueGrafik1]
		)
		const result = handleSchemaAndDesignCues(buildContext(), partDefinitions)
		const expectedPartDefinitions: PartDefinition[] = buildPartDefinitions(
			[createVariantCue('VARIANT_A'), createSchemaCue('SchemaTemplateX'), createDesignCue('DesignTemplate1')],
			[cueGrafik1]
		)
		expect(result).toEqual(expectedPartDefinitions)
	})

	it('inserts only Schema for a Variant cue with existing Design', () => {
		const partDefinitions: PartDefinition[] = buildPartDefinitions(
			[createVariantCue('VARIANT_A'), createDesignCue('DesignTemplateX')],
			[cueGrafik1]
		)
		const result = handleSchemaAndDesignCues(buildContext(), partDefinitions)
		const expectedPartDefinitions: PartDefinition[] = buildPartDefinitions(
			[createVariantCue('VARIANT_A'), createDesignCue('DesignTemplateX'), createSchemaCue('SchemaTemplate1')],
			[cueGrafik1]
		)
		expect(result).toEqual(expectedPartDefinitions)
	})

	it('supports multiple Variant cues in one part', () => {
		const partDefinitions: PartDefinition[] = buildPartDefinitions(
			[createVariantCue('VARIANT_A'), createVariantCue('VARIANT_B', { seconds: 1, frames: 20 })],
			[cueGrafik1]
		)
		const result = handleSchemaAndDesignCues(buildContext(), partDefinitions)
		const expectedPartDefinitions: PartDefinition[] = buildPartDefinitions(
			[
				createVariantCue('VARIANT_A'),
				createVariantCue('VARIANT_B', { seconds: 1, frames: 20 }),
				createDesignCue('DesignTemplate1'),
				createDesignCue('DesignTemplate0', { seconds: 1, frames: 20 }),
				createSchemaCue('SchemaTemplate1'),
				createSchemaCue('SchemaTemplate0', { seconds: 1, frames: 20 })
			],
			[cueGrafik1]
		)
		expect(result).toEqual(expectedPartDefinitions)
	})

	it('supports multiple Variant cues in different parts', () => {
		const partDefinitions: PartDefinition[] = buildPartDefinitions(
			[createVariantCue('VARIANT_A')],
			[createVariantCue('VARIANT_B')]
		)
		const result = handleSchemaAndDesignCues(buildContext(), partDefinitions)
		const expectedPartDefinitions: PartDefinition[] = buildPartDefinitions(
			[createVariantCue('VARIANT_A'), createDesignCue('DesignTemplate1'), createSchemaCue('SchemaTemplate1')],
			[createVariantCue('VARIANT_B'), createDesignCue('DesignTemplate0'), createSchemaCue('SchemaTemplate0')]
		)
		expect(result).toEqual(expectedPartDefinitions)
	})

	test('Design cue from field removes design cues in all Parts', () => {
		const partDefinitions: PartDefinition[] = buildPartDefinitions(
			[
				createVariantCue('VARIANT_A'),
				createDesignCue('DesignTemplate0'),
				createDesignFromField('DesignTemplate1'),
				createDesignCue('DesignTemplateX')
			],
			[createDesignCue('DesignTemplate0')]
		)
		const result = handleSchemaAndDesignCues(buildContext(), partDefinitions)
		const expectedPartDefinitions: PartDefinition[] = buildPartDefinitions(
			[createVariantCue('VARIANT_A'), createDesignFromField('DesignTemplate1'), createSchemaCue('SchemaTemplate1')],
			[]
		)
		expect(result).toEqual(expectedPartDefinitions)
	})

	test('Schema cue from field removes schema cues in all Parts', () => {
		const partDefinitions: PartDefinition[] = buildPartDefinitions(
			[
				createVariantCue('VARIANT_A'),
				createSchemaCue('SchemaTemplate0'),
				createSchemaFromField('SchemaTemplate1'),
				createSchemaCue('SchemaTemplateX')
			],
			[createSchemaCue('SchemaTemplate0')]
		)
		const result = handleSchemaAndDesignCues(buildContext(), partDefinitions)
		const expectedPartDefinitions: PartDefinition[] = buildPartDefinitions(
			[createVariantCue('VARIANT_A'), createSchemaFromField('SchemaTemplate1'), createDesignCue('DesignTemplate1')],
			[]
		)
		expect(result).toEqual(expectedPartDefinitions)
	})
})
