import { IBlueprintPieceDB, IBlueprintResolvedPieceInstance, TSR } from 'blueprints-integration'
import { SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import {
	createSisyfosPersistedLevelsTimelineObject,
	PieceMetaData,
	SisyfosPersistenceMetaData
} from '../onTimelineGenerate'

const LAYER_THAT_WANTS_TO_BE_PERSISTED = 'layerThatWantsToBePersisted'
const LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY: SisyfosPersistenceMetaData['sisyfosLayers'] = [
	LAYER_THAT_WANTS_TO_BE_PERSISTED
]
const PART_INSTANCE_ID = 'part1'

// tslint:disable:no-object-literal-type-assertion
describe('onTimelineGenerate', () => {
	describe('createSisyfosPersistedLevelsTimelineObject', () => {
		it('has one layer to persist from the previous part, piece accepts persistence - timelineObject with layer is added', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('currentPiece', 10, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
			)

			const indexOfLayerThatWantToBePersisted = result.content.channels.findIndex(
				(channel) => channel.mappedLayer === LAYER_THAT_WANTS_TO_BE_PERSISTED
			)
			expect(indexOfLayerThatWantToBePersisted).toBeGreaterThanOrEqual(0)
		})

		it('has one layer to persist from the previous part, timelineObject with correct Sisyfos information is added', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('currentPiece', 10, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
			)

			expect(result.layer).toEqual(SisyfosLLAyer.SisyfosPersistedLevels)
			expect(result.content.deviceType).toEqual(TSR.DeviceType.SISYFOS)
			expect(result.content.type).toEqual(TSR.TimelineContentTypeSisyfos.CHANNELS)
			expect(result.enable).toEqual({ start: 0 })
		})

		it('should persist non-VO layers with isPgm 1', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('currentPiece', 10, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
			)
			expect(result.content.channels[0].isPgm).toEqual(1)
		})

		it('should not persist anything when no piece in current part accepts persistence', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPiece', 0, undefined, true, true, 'OTHER_PART')
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
			)

			expect(result.content.channels).toHaveLength(0)
		})

		it('should not persist anything when the current piece does not accept and does not want to persist', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPiece', 0, undefined, true, true),
				createPieceInstance('currentPiece', 10, undefined, false, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
			)

			expect(result.content.channels).toHaveLength(0)
		})

		it('should persist when current piece accepts persist and duration is not undefined', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('currentPiece', 0, 5, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
			)

			expect(result.content.channels).toHaveLength(1)
		})

		it('should persist all previous layers that wants to be persisted', () => {
			const firstLayerThatWantToBePersisted: string = 'firstLayer'
			const secondLayerThatWantToBePersisted: string = 'secondLayer'
			const thirdLayerThatWantToBePersisted: string = 'thirdLayer'
			const layersThatWantToBePersisted: SisyfosPersistenceMetaData['sisyfosLayers'] = [
				firstLayerThatWantToBePersisted,
				secondLayerThatWantToBePersisted,
				thirdLayerThatWantToBePersisted
			]
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('currentPiece', 0, 5, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				layersThatWantToBePersisted
			)

			expect(
				result.content.channels.some((channel) => channel.mappedLayer === firstLayerThatWantToBePersisted)
			).toBeTruthy()
			expect(
				result.content.channels.some((channel) => channel.mappedLayer === secondLayerThatWantToBePersisted)
			).toBeTruthy()
			expect(
				result.content.channels.some((channel) => channel.mappedLayer === thirdLayerThatWantToBePersisted)
			).toBeTruthy()
		})

		it('cuts to executeAction that dont accept persist, dont persist layers', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, true, true),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
			)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts to executeAction that accepts persistence, dont persist layers from previous part', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, true, true),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
			)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts to executeAction that accepts persistence, from piece that accepts, add persist timelineObject containing all layers that want to be persisted plus previous piece layers', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, true, true),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, true, PART_INSTANCE_ID, [
					'previousPieceLayer'
				])
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
			)

			expect(result.content.channels).toHaveLength(1)
			expect(result.content.channels[0].mappedLayer).toBe('previousPieceLayer')
		})

		it('cuts to executeAction that accept persist from piece that dont want to persist and dont accept persist, dont persist any layers', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, false, false),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(
				PART_INSTANCE_ID,
				resolvedPieces,
				LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
			)

			expect(result.content.channels).toHaveLength(0)
		})

		it('should not contain any duplicate layers to persist', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createExecuteActionPieceInstance('piece', 5, undefined, true, true, PART_INSTANCE_ID, ['piece'])
			]

			const result = createSisyfosPersistedLevelsTimelineObject(PART_INSTANCE_ID, resolvedPieces, ['piece'])

			expect(result.content.channels).toHaveLength(1)
		})
	})
})

function createPieceInstance(
	name: string,
	start: number,
	duration: number | undefined,
	wantToPersistAudio: boolean,
	acceptPersistAudio: boolean,
	partInstanceId: string = PART_INSTANCE_ID
): IBlueprintResolvedPieceInstance<PieceMetaData> {
	return {
		resolvedStart: start,
		resolvedDuration: duration,
		partInstanceId,
		piece: {
			name,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: [name],
					wantsToPersistAudio: wantToPersistAudio,
					acceptsPersistedAudio: acceptPersistAudio
				}
			}
		} as IBlueprintPieceDB<PieceMetaData>
	} as IBlueprintResolvedPieceInstance<PieceMetaData>
}

function createExecuteActionPieceInstance(
	name: string,
	start: number,
	duration: number | undefined,
	wantToPersistAudio: boolean,
	acceptPersistAudio: boolean,
	partInstanceId: string = PART_INSTANCE_ID,
	previousSisyfosLayers?: string[]
): IBlueprintResolvedPieceInstance<PieceMetaData> {
	return {
		resolvedStart: start,
		resolvedDuration: duration,
		partInstanceId,
		piece: {
			name,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: [name],
					wantsToPersistAudio: wantToPersistAudio,
					acceptsPersistedAudio: acceptPersistAudio,
					isModifiedOrInsertedByAction: true,
					previousSisyfosLayers
				}
			}
		} as IBlueprintPieceDB<PieceMetaData>
	} as IBlueprintResolvedPieceInstance<PieceMetaData>
}
