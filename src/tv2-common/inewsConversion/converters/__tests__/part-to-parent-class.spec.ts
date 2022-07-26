import { literal } from 'tv2-common'
import { CueType, PartType, SourceType } from 'tv2-constants'
import { PartDefinitionEkstern, RemoteType } from '../ParseBody'
import { CueDefinitionEkstern, PartToParentClass } from '../ParseCue'

describe('PartToParentClass', () => {
	it('Creates class for Ekstern', () => {
		const partDefinition = literal<PartDefinitionEkstern>({
			type: PartType.REMOTE,
			externalId: '',
			rawType: '',
			cues: [
				literal<CueDefinitionEkstern>({
					type: CueType.Ekstern,
					sourceDefinition: {
						sourceType: SourceType.REMOTE,
						remoteType: RemoteType.LIVE,
						id: '1',
						raw: 'Live 1',
						name: 'LIVE 1'
					},
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
		expect(result).toBe('studio0_parent_ekstern_live_1')
	})
})
