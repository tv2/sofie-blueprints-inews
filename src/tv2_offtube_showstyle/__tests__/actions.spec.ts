import {
	IBlueprintPartDB,
	IBlueprintPartInstance,
	IBlueprintPieceDB,
	IBlueprintPieceInstance,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { ActionSelectServerClip, literal, PartDefinitionUnknown } from 'tv2-common'
import { AdlibActionType, PartType } from 'tv2-constants'
import { executeAction } from '../actions'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'
import { MockContext } from './actionExecutionContext.mock'

const SEGMENT_ID = 'MOCK_ACTION_SEGMENT'
const SEGMENT_ID_EXTERNAL = `${SEGMENT_ID}_EXTERNAL`
const CURRENT_PART_ID = 'MOCK_PART_CURRENT'
const CURRENT_PART_EXTERNAL_ID = `${CURRENT_PART_ID}_EXTERNAL`

const currentPartMock: IBlueprintPartInstance = {
	_id: CURRENT_PART_ID,
	segmentId: SEGMENT_ID,
	part: literal<IBlueprintPartDB>({
		_id: '',
		segmentId: SEGMENT_ID,
		externalId: '',
		title: 'Current Part'
	})
}

describe('Select Server Action', () => {
	it('Inserts a new part when no next part is present', () => {
		const kamPieceInstance: IBlueprintPieceInstance = {
			_id: '',
			piece: literal<IBlueprintPieceDB>({
				_id: 'KAM 1',
				enable: {
					start: 0
				},
				partId: CURRENT_PART_ID,
				externalId: CURRENT_PART_EXTERNAL_ID,
				name: 'KAM 1',
				sourceLayerId: OfftubeSourceLayer.PgmCam,
				outputLayerId: OfftubeOutputLayers.PGM,
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		}
		const context = new MockContext(currentPartMock, [kamPieceInstance])

		executeAction(
			context,
			AdlibActionType.SELECT_SERVER_CLIP,
			literal<ActionSelectServerClip>({
				type: AdlibActionType.SELECT_SERVER_CLIP,
				file: '01234A',
				duration: 12000,
				vo: false,
				partDefinition: literal<PartDefinitionUnknown>({
					type: PartType.Unknown,
					externalId: CURRENT_PART_EXTERNAL_ID,
					variant: {},
					rawType: '',
					cues: [],
					script: '',
					fields: {
						videoId: '01234A'
					},
					modified: 0,
					storyName: SEGMENT_ID,
					segmentExternalId: SEGMENT_ID_EXTERNAL
				})
			})
		)

		expect(context.nextPart).toBeTruthy()
		expect(context.warnings.length).toEqual(0)
		expect(context.errors.length).toEqual(0)
	})
})
