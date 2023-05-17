import { PartEndStateExt } from '../../onTimelineGenerate'
import { mergePersistenceMetaData } from '../executeAction'

const CURRENT_SEGMENT_ID = 'segment1'
const NEXT_LAYERS = ['nextLayer1', 'nextLayer2']
const CURRENT_LAYERS = ['currentLayer1', 'currentLayer2']
const PREVIOUS_LAYERS = ['previousLayer1', 'previousLayer2']
const PREVIOUS_PERSISTED_LAYERS = ['previousPersistedLayer1', 'previousPersistedLayer2']

describe('executeAction', () => {
	describe('mergePersistenceMetaData', () => {
		it('does not populate previousSisyfosLayers when next accepts and current does not want to persist', () => {
			const result = mergePersistenceMetaData(
				CURRENT_SEGMENT_ID,
				{
					sisyfosLayers: NEXT_LAYERS,
					acceptsPersistedAudio: true
				},
				{
					sisyfosLayers: CURRENT_LAYERS,
					wantsToPersistAudio: false
				},
				undefined
			)

			expect(result).toEqual({
				sisyfosLayers: NEXT_LAYERS,
				acceptsPersistedAudio: true
			})
		})

		it('populates previousSisyfosLayers with current layer when next accepts and current wants to persist', () => {
			const result = mergePersistenceMetaData(
				CURRENT_SEGMENT_ID,
				{
					sisyfosLayers: NEXT_LAYERS,
					acceptsPersistedAudio: true
				},
				{
					sisyfosLayers: CURRENT_LAYERS,
					wantsToPersistAudio: true
				},
				undefined
			)

			expect(result).toEqual({
				sisyfosLayers: NEXT_LAYERS,
				previousSisyfosLayers: CURRENT_LAYERS,
				acceptsPersistedAudio: true
			})
		})

		it('does not populate previousSisyfosLayers when next accepts, current does not accept persistence and previous part wanted to persist', () => {
			const result = mergePersistenceMetaData(
				CURRENT_SEGMENT_ID,
				{
					sisyfosLayers: NEXT_LAYERS,
					acceptsPersistedAudio: true
				},
				{
					sisyfosLayers: CURRENT_LAYERS,
					wantsToPersistAudio: false
				},
				createPartEndState(CURRENT_SEGMENT_ID)
			)

			expect(result).toEqual({
				sisyfosLayers: NEXT_LAYERS,
				acceptsPersistedAudio: true
			})
		})

		it('populates previousSisyfosLayers with current and previous layers when next accepts and current&previous want to persist', () => {
			const result = mergePersistenceMetaData(
				CURRENT_SEGMENT_ID,
				{
					sisyfosLayers: NEXT_LAYERS,
					acceptsPersistedAudio: true
				},
				{
					sisyfosLayers: CURRENT_LAYERS,
					wantsToPersistAudio: true
				},
				createPartEndState(CURRENT_SEGMENT_ID)
			)

			expect(result).toEqual({
				sisyfosLayers: NEXT_LAYERS,
				previousSisyfosLayers: [...PREVIOUS_LAYERS, ...CURRENT_LAYERS],
				acceptsPersistedAudio: true
			})
		})

		it('populates previousSisyfosLayers with current layers when next accepts and current&previous want to persist, but previous was in a different segment', () => {
			const result = mergePersistenceMetaData(
				CURRENT_SEGMENT_ID,
				{
					sisyfosLayers: NEXT_LAYERS,
					acceptsPersistedAudio: true
				},
				{
					sisyfosLayers: CURRENT_LAYERS,
					wantsToPersistAudio: true
				},
				createPartEndState('anotherSegment')
			)

			expect(result).toEqual({
				sisyfosLayers: NEXT_LAYERS,
				previousSisyfosLayers: [...CURRENT_LAYERS],
				acceptsPersistedAudio: true
			})
		})

		it('populates previousSisyfosLayers with current layers when next accepts, current&previous want to persist, but current is injected', () => {
			const result = mergePersistenceMetaData(
				CURRENT_SEGMENT_ID,
				{
					sisyfosLayers: NEXT_LAYERS,
					acceptsPersistedAudio: true
				},
				{
					sisyfosLayers: CURRENT_LAYERS,
					wantsToPersistAudio: true,
					isModifiedOrInsertedByAction: true
				},
				createPartEndState(CURRENT_SEGMENT_ID)
			)

			expect(result).toEqual({
				sisyfosLayers: NEXT_LAYERS,
				previousSisyfosLayers: CURRENT_LAYERS,
				acceptsPersistedAudio: true
			})
		})

		it('populates previousSisyfosLayers with current layers and previous persisted when next accepts, current&previous want to persist, but current is injected', () => {
			const result = mergePersistenceMetaData(
				CURRENT_SEGMENT_ID,
				{
					sisyfosLayers: NEXT_LAYERS,
					acceptsPersistedAudio: true
				},
				{
					sisyfosLayers: CURRENT_LAYERS,
					previousSisyfosLayers: PREVIOUS_PERSISTED_LAYERS,
					wantsToPersistAudio: true,
					isModifiedOrInsertedByAction: true
				},
				createPartEndState(CURRENT_SEGMENT_ID)
			)

			expect(result).toEqual({
				sisyfosLayers: NEXT_LAYERS,
				previousSisyfosLayers: [...PREVIOUS_PERSISTED_LAYERS, ...CURRENT_LAYERS],
				acceptsPersistedAudio: true
			})
		})

		it('does not populate previousSisyfosLayers when next does not accept persistence', () => {
			const result = mergePersistenceMetaData(
				CURRENT_SEGMENT_ID,
				{
					sisyfosLayers: NEXT_LAYERS,
					acceptsPersistedAudio: false
				},
				{
					sisyfosLayers: CURRENT_LAYERS,
					wantsToPersistAudio: true
				},
				createPartEndState(CURRENT_SEGMENT_ID)
			)

			expect(result).toEqual({
				sisyfosLayers: NEXT_LAYERS,
				acceptsPersistedAudio: false
			})
		})
	})
})

function createPartEndState(segmentId: string): PartEndStateExt {
	return {
		partInstanceId: 'partId',
		segmentId,
		sisyfosPersistenceMetaData: {
			sisyfosLayers: PREVIOUS_LAYERS
		},
		mediaPlayerSessions: {}
	}
}
