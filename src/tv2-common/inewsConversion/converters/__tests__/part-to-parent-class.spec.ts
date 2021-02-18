import { literal } from 'tv2-common'
import { CueType, PartType } from 'tv2-constants'
import { PartDefinitionEkstern } from '../ParseBody'
import { CueDefinitionEkstern, PartToParentClass } from '../ParseCue'

describe('PartToParentClass', () => {
	it('Creates class for Ekstern', () => {
		const partDefinition = literal<PartDefinitionEkstern>({
			type: PartType.Ekstern,
			variant: '',
			externalId: '',
			rawType: '',
			cues: [
				literal<CueDefinitionEkstern>({
					type: CueType.Ekstern,
					source: '1',
					iNewsCommand: 'EKSTERN'
				})
			],
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentExternalId: ''
		})
		const result = PartToParentClass('studio0', partDefinition)
		expect(result).toBe('studio0_parent_ekstern_1')
	})
})
