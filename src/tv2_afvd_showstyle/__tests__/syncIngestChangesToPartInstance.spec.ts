import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	IBlueprintPartDB,
	IBlueprintPartInstance,
	IBlueprintPieceInstance,
	IBlueprintRundownDB,
	PieceLifespan,
	PlaylistTimingType
} from 'blueprints-integration'
import { literal } from 'tv2-common'
import { SharedOutputLayer } from 'tv2-constants'
import { SyncIngestUpdateToPartInstanceContextMock } from '../../__mocks__/context'
import { preprocessConfig as parseStudioConfig } from '../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { preprocessConfig as parseShowStyleConfig } from '../helpers/config'
import { SourceLayer } from '../layers'
import { syncIngestUpdateToPartInstance } from '../syncIngestUpdateToPartInstance'

const RUNDOWN_EXTERNAL_ID = 'TEST.SOFIE.JEST'

function makeMockContext(): SyncIngestUpdateToPartInstanceContextMock {
	const rundown = literal<IBlueprintRundownDB>({
		externalId: RUNDOWN_EXTERNAL_ID,
		name: RUNDOWN_EXTERNAL_ID,
		_id: '',
		showStyleVariantId: '',
		timing: {
			type: PlaylistTimingType.None
		}
	})
	return new SyncIngestUpdateToPartInstanceContextMock(
		'test',
		mappingsDefaults,
		parseStudioConfig,
		parseShowStyleConfig,
		rundown._id
	)
}

function makePart(partProps: Omit<IBlueprintPartDB, '_id' | 'segmentId' | 'externalId'>): IBlueprintPartDB {
	return literal<IBlueprintPartDB>({
		_id: '',
		segmentId: '',
		externalId: '',
		...partProps
	})
}

function makePartinstance(
	partProps: Omit<IBlueprintPartDB, '_id' | 'segmentId' | 'externalId'>
): IBlueprintPartInstance<unknown> {
	return literal<IBlueprintPartInstance<unknown>>({
		_id: '',
		segmentId: '',
		part: makePart(partProps),
		rehearsal: false
	})
}

function makeSoundBed(
	id: string,
	name: string,
	instanceProps?: Partial<IBlueprintPieceInstance>
): IBlueprintPieceInstance<unknown> {
	return literal<IBlueprintPieceInstance<unknown>>({
		_id: id,
		...instanceProps,
		piece: {
			_id: '',
			enable: {
				start: 0
			},
			externalId: '',
			name,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			sourceLayerId: SourceLayer.PgmAudioBed,
			outputLayerId: SharedOutputLayer.SEC,
			content: {
				timelineObjects: []
			}
		},
		partInstanceId: ''
	})
}

describe('Sync Ingest Changes To Part Instances', () => {
	it('Syncs soundbed removed', () => {
		const context = makeMockContext()
		const pieceInstanceId = 'someID'
		const existingPartInstance: BlueprintSyncIngestPartInstance = literal<BlueprintSyncIngestPartInstance>({
			partInstance: makePartinstance({ title: 'Soundbed' }),
			pieceInstances: [makeSoundBed(pieceInstanceId, 'SN_Intro')]
		})
		const newPart: BlueprintSyncIngestNewData = literal<BlueprintSyncIngestNewData>({
			part: makePart({ title: 'Soundbed' }),
			pieceInstances: [],
			adLibPieces: [],
			actions: [],
			referencedAdlibs: []
		})
		syncIngestUpdateToPartInstance(context, existingPartInstance, newPart, 'current')

		expect(context.removedPieceInstances).toStrictEqual([pieceInstanceId])
		expect(context.syncedPieceInstances).toStrictEqual([])
		expect(context.updatedPieceInstances).toStrictEqual([])
	})

	it('Syncs soundbed added', () => {
		const context = makeMockContext()
		const pieceInstanceId = 'someID'
		const existingPartInstance: BlueprintSyncIngestPartInstance = literal<BlueprintSyncIngestPartInstance>({
			partInstance: makePartinstance({ title: 'Soundbed' }),
			pieceInstances: []
		})
		const newPart: BlueprintSyncIngestNewData = literal<BlueprintSyncIngestNewData>({
			part: makePart({ title: 'Soundbed' }),
			pieceInstances: [makeSoundBed(pieceInstanceId, 'SN_Intro')],
			adLibPieces: [],
			actions: [],
			referencedAdlibs: []
		})
		syncIngestUpdateToPartInstance(context, existingPartInstance, newPart, 'current')

		expect(context.removedPieceInstances).toStrictEqual([])
		expect(context.syncedPieceInstances).toStrictEqual([pieceInstanceId])
		expect(context.updatedPieceInstances).toStrictEqual([])
	})

	it('Syncs soundbed changed', () => {
		const context = makeMockContext()
		const pieceInstanceId = 'someID'
		const existingPartInstance: BlueprintSyncIngestPartInstance = literal<BlueprintSyncIngestPartInstance>({
			partInstance: makePartinstance({ title: 'Soundbed' }),
			pieceInstances: [makeSoundBed(pieceInstanceId, 'SN_Intro')]
		})
		const newPart: BlueprintSyncIngestNewData = literal<BlueprintSyncIngestNewData>({
			part: makePart({ title: 'Soundbed' }),
			pieceInstances: [makeSoundBed(pieceInstanceId, 'SN_Intro_19')], // the id stays the same
			adLibPieces: [],
			actions: [],
			referencedAdlibs: []
		})
		syncIngestUpdateToPartInstance(context, existingPartInstance, newPart, 'current')

		expect(context.removedPieceInstances).toStrictEqual([])
		expect(context.syncedPieceInstances).toStrictEqual([pieceInstanceId])
		expect(context.updatedPieceInstances).toStrictEqual([])
	})

	it('Syncs part properties', () => {
		const context = makeMockContext()
		const existingPartInstance: BlueprintSyncIngestPartInstance = literal<BlueprintSyncIngestPartInstance>({
			partInstance: makePartinstance({
				title: 'Kam 1',
				budgetDuration: 2000,
				inTransition: { partContentDelayDuration: 200, previousPartKeepaliveDuration: 0, blockTakeDuration: 0 }
			}),
			pieceInstances: []
		})
		const newPart: BlueprintSyncIngestNewData = literal<BlueprintSyncIngestNewData>({
			part: makePart({
				title: 'Kam 2',
				budgetDuration: 1000,
				inTransition: { partContentDelayDuration: 500, previousPartKeepaliveDuration: 0, blockTakeDuration: 0 }
			}),
			pieceInstances: [],
			adLibPieces: [],
			actions: [],
			referencedAdlibs: []
		})
		syncIngestUpdateToPartInstance(context, existingPartInstance, newPart, 'current')

		expect(context.updatedPartInstance?.part.inTransition).toBeUndefined()
		expect(context.updatedPartInstance?.part.budgetDuration).toBe(1000)
		expect(context.updatedPartInstance?.part.title).toBe('Kam 2')
	})

	it('Does not remove adlib instances or infinite continuations', () => {
		const context = makeMockContext()
		const existingPartInstance: BlueprintSyncIngestPartInstance = literal<BlueprintSyncIngestPartInstance>({
			partInstance: makePartinstance({ title: 'Soundbed' }),
			pieceInstances: [
				makeSoundBed('someId1', 'SN_Intro', { adLibSourceId: 'someAdLib' }),
				makeSoundBed('someId2', 'SN_Intro', { infinite: { infinitePieceId: 'someInfinite', fromPreviousPart: true } }),
				makeSoundBed('someId3', 'SN_Intro', {
					infinite: { infinitePieceId: 'someInfinite', fromPreviousPart: false, fromPreviousPlayhead: true }
				}),
				makeSoundBed('someId4', 'SN_Intro', {
					infinite: { infinitePieceId: 'someInfinite', fromPreviousPart: false, fromHold: true }
				}),
				makeSoundBed('someId5', 'SN_Intro', { dynamicallyInserted: { time: 1649158767173 } })
			]
		})
		const newPart: BlueprintSyncIngestNewData = literal<BlueprintSyncIngestNewData>({
			part: makePart({ title: 'Soundbed' }),
			pieceInstances: [],
			adLibPieces: [],
			actions: [],
			referencedAdlibs: []
		})
		syncIngestUpdateToPartInstance(context, existingPartInstance, newPart, 'current')

		expect(context.removedPieceInstances).toStrictEqual([])
		expect(context.syncedPieceInstances).toStrictEqual([])
		expect(context.updatedPieceInstances).toStrictEqual([])
	})
})
