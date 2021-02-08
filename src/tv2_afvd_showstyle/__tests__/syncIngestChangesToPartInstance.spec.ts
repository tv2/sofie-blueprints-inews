import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	IBlueprintPartDB,
	IBlueprintPartInstance,
	IBlueprintPieceInstance,
	PieceLifespan
} from '@sofie-automation/blueprints-integration'
import { literal } from 'tv2-common'
import { SourceLayer } from '../layers'
import { syncIngestUpdateToPartInstance } from '../syncIngestUpdateToPartInstance'
import { MockSyncIngestUpdateToPartInstanceContext } from './syncContext.mock'

function makeMockContext(): MockSyncIngestUpdateToPartInstanceContext {
	return new MockSyncIngestUpdateToPartInstanceContext({} as any, {} as any)
}

function makePart(title: string): IBlueprintPartDB {
	return literal<IBlueprintPartDB>({
		_id: '',
		segmentId: '',
		externalId: '',
		title
	})
}

function makePartinstance(title: string): IBlueprintPartInstance<unknown> {
	return literal<IBlueprintPartInstance<unknown>>({
		_id: '',
		segmentId: '',
		part: makePart(title)
	})
}

function makeSoundBed(name: string): IBlueprintPieceInstance<unknown> {
	return literal<IBlueprintPieceInstance<unknown>>({
		_id: name,
		piece: {
			_id: '',
			enable: {
				start: 0
			},
			externalId: '',
			name,
			lifespan: PieceLifespan.OutOnRundownEnd,
			sourceLayerId: SourceLayer.PgmAudioBed,
			outputLayerId: 'sec'
		}
	})
}

describe('Sync Ingest Changes To Part Instances', () => {
	it('Syncs soundbed removed', () => {
		const context = makeMockContext()
		const existingPartInstance: BlueprintSyncIngestPartInstance = literal<BlueprintSyncIngestPartInstance>({
			partInstance: makePartinstance('Soundbed'),
			pieceInstances: [makeSoundBed('SN_Intro')]
		})
		const newPart: BlueprintSyncIngestNewData = literal<BlueprintSyncIngestNewData>({
			part: makePart('Soundbed'),
			pieceInstances: [],
			adLibPieces: [],
			actions: [],
			referencedAdlibs: []
		})
		syncIngestUpdateToPartInstance(context, existingPartInstance, newPart, 'current')

		expect(context.removedPieceInstances).toStrictEqual(['SN_Intro'])
		expect(context.syncedPieceInstances).toStrictEqual([])
		expect(context.updatedPieceInstances).toStrictEqual([])
	})

	it('Syncs soundbed added', () => {
		const context = makeMockContext()
		const existingPartInstance: BlueprintSyncIngestPartInstance = literal<BlueprintSyncIngestPartInstance>({
			partInstance: makePartinstance('Soundbed'),
			pieceInstances: []
		})
		const newPart: BlueprintSyncIngestNewData = literal<BlueprintSyncIngestNewData>({
			part: makePart('Soundbed'),
			pieceInstances: [makeSoundBed('SN_Intro')],
			adLibPieces: [],
			actions: [],
			referencedAdlibs: []
		})
		syncIngestUpdateToPartInstance(context, existingPartInstance, newPart, 'current')

		expect(context.removedPieceInstances).toStrictEqual([])
		expect(context.syncedPieceInstances).toStrictEqual(['SN_Intro'])
		expect(context.updatedPieceInstances).toStrictEqual([])
	})

	it('Syncs soundbed changed', () => {
		const context = makeMockContext()
		const existingPartInstance: BlueprintSyncIngestPartInstance = literal<BlueprintSyncIngestPartInstance>({
			partInstance: makePartinstance('Soundbed'),
			pieceInstances: [makeSoundBed('SN_Intro')]
		})
		const newPart: BlueprintSyncIngestNewData = literal<BlueprintSyncIngestNewData>({
			part: makePart('Soundbed'),
			pieceInstances: [makeSoundBed('SN_Intro_19')],
			adLibPieces: [],
			actions: [],
			referencedAdlibs: []
		})
		syncIngestUpdateToPartInstance(context, existingPartInstance, newPart, 'current')

		expect(context.removedPieceInstances).toStrictEqual([])
		expect(context.syncedPieceInstances).toStrictEqual(['SN_Intro_19'])
		expect(context.updatedPieceInstances).toStrictEqual([])
	})
})
