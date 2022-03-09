import { IBlueprintPieceDB, IBlueprintResolvedPieceInstance, TSR } from '@tv2media/blueprints-integration'
import { SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { createSisyfosPersistedLevelsTimelineObject, SisyfosPersistMetaData } from '../onTimelineGenerate'

const LAYER_THAT_WANTS_TO_BE_PERSISTED = 'layerThatWantsToBePersisted'
const LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY: SisyfosPersistMetaData['sisyfosLayers'] = [
	LAYER_THAT_WANTS_TO_BE_PERSISTED
]

// tslint:disable:no-object-literal-type-assertion
describe('onTimelineGenerate', () => {
	describe('createSisyfosPersistedLevelsTimelineObject', () => {
		it('has one layer to persist, piece accept persist - timelineObject with layer is added', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('currentPiece', 10, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			const indexOfLayerThatWantToBePersisted = result.content.channels.findIndex(
				channel => channel.mappedLayer === LAYER_THAT_WANTS_TO_BE_PERSISTED
			)
			expect(indexOfLayerThatWantToBePersisted).toBeGreaterThanOrEqual(0)
		})

		it('has layer to persist, timelineObject with correct Sisyfos information is added', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('currentPiece', 10, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.layer).toEqual(SisyfosLLAyer.SisyfosPersistedLevels)
			expect(result.content.deviceType).toEqual(TSR.DeviceType.SISYFOS)
			expect(result.content.type).toEqual(TSR.TimelineContentTypeSisyfos.CHANNELS)
			expect(result.enable).toEqual({ start: 0 })
		})

		it('should persist non-VO layers with isPgm 1', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('currentPiece', 10, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)
			expect(result.content.channels[0].isPgm).toEqual(1)
		})

		it('should persist a VO layer, isPgm is 2', () => {
			const sisyfosLayersThatWantsToBePersisted: SisyfosPersistMetaData['sisyfosLayers'] = [
				'layerThatWantsToBePersisted VO'
			]
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('currentPiece VO', 10, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, sisyfosLayersThatWantsToBePersisted)
			expect(result.content.channels[0].isPgm).toEqual(2)
		})

		it('should persist only current piece layer when piece wants to persist but dont accept', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('previousPiece', 0, 10, true, true),
				createPieceInstance('currentPiece', 10, undefined, true, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(1)
		})

		it('should not persist anything when current piece dont accept and dont want to persist', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('previousPiece', 0, 10, true, true),
				createPieceInstance('currentPiece', 10, undefined, false, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('should persist when previous piece does not accept persist, but current does accept', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('previousPiece', 0, 10, true, false),
				createPieceInstance('currentPiece', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(1)
		})

		it('should persist when current piece accepts persist and duration is not undefined', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [createPieceInstance('currentPiece', 0, 5, false, true)]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(1)
		})

		it('should persist all previous layers that wants to be persisted', () => {
			const firstLayerThatWantToBePersisted: string = 'firstLayer'
			const secondLayerThatWantToBePersisted: string = 'secondLayer'
			const thirdLayerThatWantToBePersisted: string = 'thirdLayer'
			const layersThatWantToBePersisted: SisyfosPersistMetaData['sisyfosLayers'] = [
				firstLayerThatWantToBePersisted,
				secondLayerThatWantToBePersisted,
				thirdLayerThatWantToBePersisted
			]
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [createPieceInstance('currentPiece', 0, 5, true, true)]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, layersThatWantToBePersisted)

			expect(
				result.content.channels.some(channel => channel.mappedLayer === firstLayerThatWantToBePersisted)
			).toBeTruthy()
			expect(
				result.content.channels.some(channel => channel.mappedLayer === secondLayerThatWantToBePersisted)
			).toBeTruthy()
			expect(
				result.content.channels.some(channel => channel.mappedLayer === thirdLayerThatWantToBePersisted)
			).toBeTruthy()
		})

		it('cuts to executeAction that dont accept persist, dont persist layers', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, true, true),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts to executeAction that accept persist from piece that accept, add persist timelineObject containing all layers that want to be persisted plus previous piece layers', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, true, true),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(
				result.content.channels.some(channel => channel.mappedLayer === LAYER_THAT_WANTS_TO_BE_PERSISTED)
			).toBeTruthy()
			expect(result.content.channels.some(channel => channel.mappedLayer === resolvedPieces[0].piece.name)).toBeTruthy()
		})

		it('cuts to executionAction that accept from piece that dont accept, add persist timelineObject that only contain previous piece layers', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, true, false),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(1)
			expect(result.content.channels.some(channel => channel.mappedLayer === resolvedPieces[0].piece.name)).toBeTruthy()
		})

		it('cuts to executeAction that accept persist from piece that dont want to persist and dont accept persist, dont persist any layers', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, false, false),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts to executeAction that accept persist from piece that dont want to persist and that accept persist, persist previous layers', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, false, true),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(1)
			expect(
				result.content.channels.some(channel => channel.mappedLayer === LAYER_THAT_WANTS_TO_BE_PERSISTED)
			).toBeTruthy()
		})

		it('cuts from executeAction that dont accept to piece that accepts, dont persist', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createExecuteActionPieceInstance('previousPieceIsExecuteAction', 0, 10, false, false),
				createPieceInstance('currentPieceNotExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts from executeAction that dont accept to piece that dont accepts, dont persist layers', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createExecuteActionPieceInstance('previousPieceIsExecuteAction', 0, 10, false, false),
				createPieceInstance('currentPieceNotExecuteAction', 10, undefined, false, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts from executeAction that accept to piece that dont accepts, dont persist layers', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createExecuteActionPieceInstance('previousPieceIsExecuteAction', 0, 10, false, true),
				createPieceInstance('currentPieceNotExecuteAction', 10, undefined, false, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts from executeAction that accept to piece that accepts, add persist timelineObject with previous layer before executeAction + new layer', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('firstPiece', 0, 5, true, true),
				createExecuteActionPieceInstance('previousPieceIsExecuteAction', 5, 5, false, true, {
					acceptPersistAudio: true,
					sisyfosLayers: []
				}),
				createPieceInstance('currentPieceNotExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(2)
		})

		it('cuts from piece that wants to persist to executeAction that do not accept to piece that accepts, do not persist', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('firstPiece', 0, 5, true, true),
				createExecuteActionPieceInstance('previousPieceIsExecuteAction', 5, 5, false, true, {
					acceptPersistAudio: false,
					sisyfosLayers: []
				}),
				createPieceInstance('currentPieceNotExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts from piece that wants to persist to executeAction that accepts to another executeAction that accepts, persist layer from first piece', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('firstPiece', 0, 5, true, true),
				createExecuteActionPieceInstance('executeAction', 5, undefined, false, true, {
					acceptPersistAudio: true,
					sisyfosLayers: [],
					previousPersistMetaDataForCurrentPiece: {
						acceptPersistAudio: true,
						sisyfosLayers: []
					}
				})
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, [])

			expect(result.content.channels).toHaveLength(1)
			expect(result.content.channels.some(channel => channel.mappedLayer === 'firstPiece')).toBeTruthy()
		})

		it('cuts from piece that wants to persist to executeAction that do not accept to another executeAction that accepts, dont persist any layers', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('firstPiece', 0, 5, true, true),
				createExecuteActionPieceInstance('executeAction', 5, undefined, false, true, {
					acceptPersistAudio: true,
					sisyfosLayers: [],
					previousPersistMetaDataForCurrentPiece: {
						acceptPersistAudio: false,
						sisyfosLayers: []
					}
				})
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, [])

			expect(result.content.channels).toHaveLength(0)
		})

		it('should not contain any duplicate layers to persist', () => {
			const resolvedPieces: IBlueprintResolvedPieceInstance[] = [
				createPieceInstance('piece', 0, 5, true, true),
				createPieceInstance('piece', 5, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, [])

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
	isExecuteAction?: boolean
): IBlueprintResolvedPieceInstance {
	return {
		resolvedStart: start,
		resolvedDuration: duration,
		piece: {
			name,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: [name],
					wantsToPersistAudio: wantToPersistAudio,
					acceptPersistAudio,
					isExecuteAction
				} as SisyfosPersistMetaData
			}
		} as IBlueprintPieceDB
	} as IBlueprintResolvedPieceInstance
}

function createExecuteActionPieceInstance(
	name: string,
	start: number,
	duration: number | undefined,
	wantToPersistAudio: boolean,
	acceptPersistAudio: boolean,
	previousMetaData?: SisyfosPersistMetaData
): IBlueprintResolvedPieceInstance {
	return {
		resolvedStart: start,
		resolvedDuration: duration,
		piece: {
			name,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: [name],
					wantsToPersistAudio: wantToPersistAudio,
					acceptPersistAudio,
					previousPersistMetaDataForCurrentPiece: previousMetaData
				} as SisyfosPersistMetaData
			}
		} as IBlueprintPieceDB
	} as IBlueprintResolvedPieceInstance
}
