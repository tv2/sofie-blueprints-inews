import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	IBlueprintPartDB,
	IBlueprintPartInstance,
	IBlueprintPieceInstance,
	IBlueprintRundownDB,
	PieceLifespan,
	PlaylistTimingType
} from '@sofie-automation/blueprints-integration'
import { literal } from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { SyncIngestUpdateToPartInstanceContext } from '../../__mocks__/context'
import { parseConfig as parseStudioConfig } from '../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { parseConfig as parseShowStyleConfig } from '../helpers/config'
import { SourceLayer } from '../layers'
import { syncIngestUpdateToPartInstance } from '../syncIngestUpdateToPartInstance'

const RUNDOWN_EXTERNAL_ID = 'TEST.SOFIE.JEST'

function makeMockContext(): SyncIngestUpdateToPartInstanceContext {
	const rundown = literal<IBlueprintRundownDB>({
		externalId: RUNDOWN_EXTERNAL_ID,
		name: RUNDOWN_EXTERNAL_ID,
		_id: '',
		showStyleVariantId: '',
		timing: {
			type: PlaylistTimingType.None
		}
	})
	return new SyncIngestUpdateToPartInstanceContext(
		'test',
		mappingsDefaults,
		parseStudioConfig,
		parseShowStyleConfig,
		rundown._id
	)
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
		part: makePart(title),
		rehearsal: false
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
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			sourceLayerId: SourceLayer.PgmAudioBed,
			outputLayerId: SharedOutputLayers.SEC,
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
