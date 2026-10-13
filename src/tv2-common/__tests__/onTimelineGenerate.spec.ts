import {
	IBlueprintPartInstance,
	IBlueprintPieceDB,
	IBlueprintPieceInstance,
	IBlueprintResolvedPieceInstance,
	PieceLifespan,
	TSR
} from 'blueprints-integration'
import { SharedOutputLayers } from 'tv2-constants'
import { RundownContext } from '../../__mocks__/context'
import { SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import {
	createSisyfosPersistedLevelsTimelineObject,
	getEndStateForPart,
	PartEndStateExt,
	PieceMetaData,
	SisyfosPersistMetaData,
	TimelinePersistentStateExt
} from '../onTimelineGenerate'

const LAYER_THAT_WANTS_TO_BE_PERSISTED = 'layerThatWantsToBePersisted'
const LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY: SisyfosPersistMetaData['sisyfosLayers'] = [
	LAYER_THAT_WANTS_TO_BE_PERSISTED
]

// tslint:disable:no-object-literal-type-assertion
describe('onTimelineGenerate', () => {
	describe('createSisyfosPersistedLevelsTimelineObject', () => {
		it('has one layer to persist, piece accept persist - timelineObject with layer is added', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('currentPiece', 10, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			const indexOfLayerThatWantToBePersisted = result.content.channels.findIndex(
				channel => channel.mappedLayer === LAYER_THAT_WANTS_TO_BE_PERSISTED
			)
			expect(indexOfLayerThatWantToBePersisted).toBeGreaterThanOrEqual(0)
		})

		it('has layer to persist, timelineObject with correct Sisyfos information is added', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('currentPiece', 10, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.layer).toEqual(SisyfosLLAyer.SisyfosPersistedLevels)
			expect(result.content.deviceType).toEqual(TSR.DeviceType.SISYFOS)
			expect(result.content.type).toEqual(TSR.TimelineContentTypeSisyfos.CHANNELS)
			expect(result.enable).toEqual({ start: 0 })
		})

		it('should persist non-VO layers with isPgm 1', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('currentPiece', 10, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)
			expect(result.content.channels[0].isPgm).toEqual(1)
		})

		it('should persist only current piece layer when piece wants to persist but dont accept', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPiece', 0, 10, true, true),
				createPieceInstance('currentPiece', 10, undefined, true, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(1)
		})

		it('should not persist anything when current piece dont accept and dont want to persist', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPiece', 0, 10, true, true),
				createPieceInstance('currentPiece', 10, undefined, false, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('should persist when previous piece does not accept persist, but current does accept', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPiece', 0, 10, true, false),
				createPieceInstance('currentPiece', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(1)
		})

		it('should persist when current piece accepts persist and duration is not undefined', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('currentPiece', 0, 5, false, true)
			]

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
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('currentPiece', 0, 5, true, true)
			]

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
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, true, true),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts to executeAction that accept persist from piece that accept, add persist timelineObject containing all layers that want to be persisted plus previous piece layers', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
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
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, true, false),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(1)
			expect(result.content.channels.some(channel => channel.mappedLayer === resolvedPieces[0].piece.name)).toBeTruthy()
		})

		it('cuts to executeAction that accept persist from piece that dont want to persist and dont accept persist, dont persist any layers', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('previousPieceNotExecuteAction', 0, 10, false, false),
				createExecuteActionPieceInstance('currentPieceIsExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts to executeAction that accept persist from piece that dont want to persist and that accept persist, persist previous layers', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
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
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createExecuteActionPieceInstance('previousPieceIsExecuteAction', 0, 10, false, false),
				createPieceInstance('currentPieceNotExecuteAction', 10, undefined, false, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts from executeAction that dont accept to piece that dont accepts, dont persist layers', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createExecuteActionPieceInstance('previousPieceIsExecuteAction', 0, 10, false, false),
				createPieceInstance('currentPieceNotExecuteAction', 10, undefined, false, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts from executeAction that accept to piece that dont accepts, dont persist layers', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createExecuteActionPieceInstance('previousPieceIsExecuteAction', 0, 10, false, true),
				createPieceInstance('currentPieceNotExecuteAction', 10, undefined, false, false)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)

			expect(result.content.channels).toHaveLength(0)
		})

		it('cuts from executeAction that accept to piece that accepts, add persist timelineObject with previous layer before executeAction + new layer', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
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
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
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
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
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
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
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
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('piece', 0, 5, true, true),
				createPieceInstance('piece', 5, undefined, true, true)
			]

			const result = createSisyfosPersistedLevelsTimelineObject(resolvedPieces, [])

			expect(result.content.channels).toHaveLength(1)
		})

		describe('pieces continued from a previous part', () => {
			it.each([true, false])('continued on-air piece still applies acceptPersistAudio=%s', acceptPersistAudio => {
				const continuedPiece = createContinuedPieceInstance('continuedOnAir', 0, undefined, false, acceptPersistAudio, {
					fromPreviousPart: true
				})
				continuedPiece.piece.outputLayerId = SharedOutputLayers.PGM
				const result = createSisyfosPersistedLevelsTimelineObject(
					[createPieceInstance('currentPiece', 10, undefined, false, true), continuedPiece],
					LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
				)

				expect(result.content.channels.map(channel => channel.mappedLayer)).toEqual(
					acceptPersistAudio ? LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY : []
				)
			})

			it('continued piece (fromPreviousPart) that does not accept does not block, previous layers are persisted', () => {
				const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
					createContinuedPieceInstance('continuedDataStore', 0, undefined, false, false, { fromPreviousPart: true }),
					createPieceInstance('currentPiece', 0, undefined, false, true)
				]

				const result = createSisyfosPersistedLevelsTimelineObject(
					resolvedPieces,
					LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
				)

				expect(result.content.channels).toHaveLength(1)
				expect(result.content.channels[0].mappedLayer).toEqual(LAYER_THAT_WANTS_TO_BE_PERSISTED)
			})

			it('continued piece (fromPreviousPlayhead) that does not accept does not block, previous layers are persisted', () => {
				const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
					createPieceInstance('currentPiece', 0, undefined, false, true),
					createContinuedPieceInstance('continuedDataStore', 0, undefined, false, false, {
						fromPreviousPart: false,
						fromPreviousPlayhead: true
					})
				]

				const result = createSisyfosPersistedLevelsTimelineObject(
					resolvedPieces,
					LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
				)

				expect(result.content.channels).toHaveLength(1)
				expect(result.content.channels[0].mappedLayer).toEqual(LAYER_THAT_WANTS_TO_BE_PERSISTED)
			})

			it('continued piece that does not accept still does not make a non-accepting current piece persist', () => {
				const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
					createContinuedPieceInstance('continuedDataStore', 0, undefined, false, false, { fromPreviousPart: true }),
					createPieceInstance('currentPiece', 0, undefined, false, false)
				]

				const result = createSisyfosPersistedLevelsTimelineObject(
					resolvedPieces,
					LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
				)

				expect(result.content.channels).toHaveLength(0)
			})

			it('infinite piece that started in this part (not continued) and does not accept still blocks', () => {
				const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
					createContinuedPieceInstance('dataStoreStartedHere', 0, undefined, false, false, { fromPreviousPart: false }),
					createPieceInstance('currentPiece', 0, undefined, false, true)
				]

				const result = createSisyfosPersistedLevelsTimelineObject(
					resolvedPieces,
					LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
				)

				expect(result.content.channels).toHaveLength(0)
			})

			it('continued piece that wants to persist still contributes its layers and still blocks when it does not accept', () => {
				const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
					createPieceInstance('currentPiece', 0, undefined, false, true),
					createContinuedPieceInstance('continuedLiveOnAux', 0, undefined, true, false, { fromPreviousPart: true })
				]

				const result = createSisyfosPersistedLevelsTimelineObject(
					resolvedPieces,
					LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
				)

				expect(result.content.channels).toHaveLength(1)
				expect(result.content.channels[0].mappedLayer).toEqual('continuedLiveOnAux')
			})

			it('continued piece that wants to persist and accepts contributes its layers and lets previous layers through', () => {
				const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
					createPieceInstance('currentPiece', 0, undefined, false, true),
					createContinuedPieceInstance('continuedLiveOnAux', 0, undefined, true, true, { fromPreviousPart: true })
				]

				const result = createSisyfosPersistedLevelsTimelineObject(
					resolvedPieces,
					LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY
				)

				expect(result.content.channels.map(channel => channel.mappedLayer)).toEqual([
					'continuedLiveOnAux',
					LAYER_THAT_WANTS_TO_BE_PERSISTED
				])
			})
		})
	})

	describe('getEndStateForPart', () => {
		it('continued piece that does not accept does not remove the layers of the piece that wants to persist', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createContinuedPieceInstance('continuedDataStore', 0, undefined, false, false, { fromPreviousPart: true }),
				createPieceInstance('live', 0, undefined, true, false)
			]

			const endState = getEndStateForPart(
				new RundownContext(
					'test',
					{},
					() => ({}),
					() => ({})
				),
				createPersistentState(),
				createPartInstance(),
				resolvedPieces,
				1000
			) as PartEndStateExt

			expect(endState.sisyfosPersistMetaData.sisyfosLayers).toEqual(['live'])
		})

		it('continued piece that does not accept does not block previous part layers from being carried on', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createContinuedPieceInstance('continuedDataStore', 0, undefined, false, false, { fromPreviousPart: true }),
				createPieceInstance('voDataStore', 0, undefined, false, true)
			]

			const endState = getEndStateForPart(
				new RundownContext(
					'test',
					{},
					() => ({}),
					() => ({})
				),
				createPersistentState(),
				createPartInstance(LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY),
				resolvedPieces,
				1000
			) as PartEndStateExt

			expect(endState.sisyfosPersistMetaData.sisyfosLayers).toEqual(LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY)
		})

		it('piece that does not accept and is not continued still blocks previous part layers', () => {
			const resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [
				createPieceInstance('serverDataStore', 0, undefined, false, false),
				createPieceInstance('voDataStore', 0, undefined, false, true)
			]

			const endState = getEndStateForPart(
				new RundownContext(
					'test',
					{},
					() => ({}),
					() => ({})
				),
				createPersistentState(),
				createPartInstance(LAYERS_THAT_WANTS_TO_BE_PERSISTED_ARRAY),
				resolvedPieces,
				1000
			) as PartEndStateExt

			expect(endState.sisyfosPersistMetaData.sisyfosLayers).toEqual([])
		})
	})
})

function createPersistentState(): TimelinePersistentStateExt {
	return { activeMediaPlayers: {}, isNewSegment: false }
}

function createPartInstance(previousPartLayers: string[] = []): IBlueprintPartInstance {
	const previousPartEndState: Partial<PartEndStateExt> = {
		sisyfosPersistMetaData: { sisyfosLayers: previousPartLayers }
	}
	return {
		_id: 'partInstance',
		segmentId: 'segment',
		part: { _id: 'part', segmentId: 'segment', externalId: 'part', title: 'Part' },
		rehearsal: false,
		previousPartEndState
	}
}

function createContinuedPieceInstance(
	name: string,
	start: number,
	duration: number | undefined,
	wantToPersistAudio: boolean,
	acceptPersistAudio: boolean,
	infinite: Omit<NonNullable<IBlueprintPieceInstance['infinite']>, 'infinitePieceId'>
): IBlueprintResolvedPieceInstance<PieceMetaData> {
	const piece = createPieceInstance(name, start, duration, wantToPersistAudio, acceptPersistAudio)
	piece.infinite = { infinitePieceId: name, ...infinite }
	piece.piece.outputLayerId = SharedOutputLayers.SELECTED_ADLIB
	piece.piece.lifespan = PieceLifespan.OutOnSegmentEnd
	return piece
}

function createPieceInstance(
	name: string,
	start: number,
	duration: number | undefined,
	wantToPersistAudio: boolean,
	acceptPersistAudio: boolean
): IBlueprintResolvedPieceInstance<PieceMetaData> {
	return {
		resolvedStart: start,
		resolvedDuration: duration,
		piece: {
			name,
			enable: { start, duration },
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: [name],
					wantsToPersistAudio: wantToPersistAudio,
					acceptPersistAudio
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
	previousMetaData?: SisyfosPersistMetaData
): IBlueprintResolvedPieceInstance<PieceMetaData> {
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
				}
			}
		} as IBlueprintPieceDB<PieceMetaData>
	} as IBlueprintResolvedPieceInstance<PieceMetaData>
}
