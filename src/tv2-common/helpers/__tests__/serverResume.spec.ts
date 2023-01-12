import {
	IBlueprintPartInstance,
	IBlueprintResolvedPieceInstance,
	PieceLifespan,
	SplitsContent,
	VTContent,
	WithTimeline
} from 'blueprints-integration'
import { DVEPieceMetaData, literal, PieceMetaData, RemoteType, SourceDefinitionRemote } from 'tv2-common'
import { SharedSourceLayers, SourceType } from 'tv2-constants'
import { getServerPositionForPartInstance } from '../serverResume'

const EKSTERN_SOURCE: SourceDefinitionRemote = {
	sourceType: SourceType.REMOTE,
	remoteType: RemoteType.LIVE,
	id: '1',
	raw: 'Live 1',
	name: 'LIVE 1'
}

function getMockPartInstance(partInstance: Partial<IBlueprintPartInstance>): IBlueprintPartInstance {
	return {
		_id: '',
		segmentId: '',
		part: {
			_id: '',
			segmentId: '',
			externalId: '',
			title: ''
		},
		rehearsal: false,
		...partInstance
	}
}

describe('Server Resume', () => {
	it('Returns server position from server part with resolved duration', () => {
		const position = getServerPositionForPartInstance(getMockPartInstance({ _id: 'mock_1' }), [
			literal<IBlueprintResolvedPieceInstance<PieceMetaData>>({
				_id: '',
				partInstanceId: 'mock_1',
				resolvedStart: 1000,
				resolvedDuration: 10000,
				dynamicallyInserted: { time: 1 },
				piece: {
					_id: '',
					enable: { start: 'now' },
					externalId: '',
					name: '',
					lifespan: PieceLifespan.WithinPart,
					sourceLayerId: SharedSourceLayers.PgmServer,
					outputLayerId: '',
					content: literal<WithTimeline<VTContent>>({
						fileName: '123456',
						path: 'somewhere/123456',
						timelineObjects: []
					})
				}
			})
		])
		expect(position).toEqual({ fileName: '123456', lastEnd: 10000, isPlaying: false })
	})
	it('Returns server position from server part when setting "now"', () => {
		const position = getServerPositionForPartInstance(
			getMockPartInstance({ _id: 'mock_1', timings: { reportedStartedPlayback: 1000 } }),
			[
				literal<IBlueprintResolvedPieceInstance<PieceMetaData>>({
					_id: '',
					partInstanceId: 'mock_1',
					reportedStartedPlayback: 1000,
					resolvedStart: 2000,
					dynamicallyInserted: { time: 1 },
					piece: {
						_id: '',
						enable: { start: 'now' },
						externalId: '',
						name: '',
						lifespan: PieceLifespan.WithinPart,
						sourceLayerId: SharedSourceLayers.PgmServer,
						outputLayerId: '',
						content: literal<WithTimeline<VTContent>>({
							fileName: '123456',
							path: 'somewhere/123456',
							timelineObjects: []
						})
					}
				})
			],
			11000
		)
		expect(position).toEqual({ fileName: '123456', lastEnd: 8000, endedWithPartInstance: 'mock_1', isPlaying: false })
	})
	it('Returns server position from DVE adlib with continuous server', () => {
		const position = getServerPositionForPartInstance(
			getMockPartInstance({
				_id: 'mock_1',
				segmentId: 'segment_0',
				previousPartEndState: {
					partInstanceId: 'mock_0',
					sisyfosPersistMetaData: { sisyfosLayers: [] },
					mediaPlayerSessions: {},
					segmentId: 'segment_0',
					serverPosition: { fileName: '123456', lastEnd: 10000, endedWithPartInstance: 'mock_0', isPlaying: false }
				},
				timings: { reportedStartedPlayback: 11000 }
			}),
			[
				literal<IBlueprintResolvedPieceInstance<PieceMetaData>>({
					_id: '',
					partInstanceId: 'mock_1',
					resolvedStart: 1000,
					dynamicallyInserted: { time: 1 },
					piece: {
						_id: '',
						enable: { start: 'now' },
						externalId: '',
						name: '',
						lifespan: PieceLifespan.WithinPart,
						sourceLayerId: SharedSourceLayers.PgmDVEAdLib,
						outputLayerId: '',
						content: literal<WithTimeline<SplitsContent>>({
							boxSourceConfiguration: [],
							timelineObjects: []
						}),
						metaData: literal<Partial<DVEPieceMetaData>>({
							sources: {
								INP1: { sourceType: SourceType.SERVER },
								INP2: EKSTERN_SOURCE
							},
							serverPlaybackTiming: [{}]
						})
					}
				})
			],
			20000
		)
		expect(position).toEqual({ fileName: '123456', lastEnd: 18000, isPlaying: false, endedWithPartInstance: 'mock_1' })
	})
	it('Returns server position from DVE adlib with interrupted server', () => {
		const position = getServerPositionForPartInstance(
			getMockPartInstance({
				_id: 'mock_1',
				segmentId: 'segment_0',
				previousPartEndState: {
					partInstanceId: 'mock_0',
					sisyfosPersistMetaData: { sisyfosLayers: [] },
					mediaPlayerSessions: {},
					segmentId: 'segment_0',
					serverPosition: { fileName: '123456', lastEnd: 10000, endedWithPartInstance: 'mock_0', isPlaying: false }
				},
				timings: { reportedStartedPlayback: 11000 }
			}),
			[
				literal<IBlueprintResolvedPieceInstance<PieceMetaData>>({
					_id: '',
					partInstanceId: 'mock_1',
					resolvedStart: 1000,
					dynamicallyInserted: { time: 1 },
					piece: {
						_id: '',
						enable: { start: 'now' },
						externalId: '',
						name: '',
						lifespan: PieceLifespan.WithinPart,
						sourceLayerId: SharedSourceLayers.PgmDVEAdLib,
						outputLayerId: '',
						content: literal<WithTimeline<SplitsContent>>({
							boxSourceConfiguration: [],
							timelineObjects: []
						}),
						metaData: literal<Partial<DVEPieceMetaData>>({
							sources: {
								INP1: { sourceType: SourceType.SERVER },
								INP2: EKSTERN_SOURCE
							},
							serverPlaybackTiming: [{ end: 13000 }, { start: 14000, end: 15000 }, { start: 16000 }]
						})
					}
				})
			],
			20000
		)
		expect(position).toEqual({ fileName: '123456', lastEnd: 16000, isPlaying: false, endedWithPartInstance: 'mock_1' })
	})
	it('Includes transition in server position', () => {
		const position = getServerPositionForPartInstance(
			getMockPartInstance({
				_id: 'mock_1',
				segmentId: 'segment_0',
				previousPartEndState: {
					partInstanceId: 'mock_0',
					sisyfosPersistMetaData: { sisyfosLayers: [] },
					mediaPlayerSessions: {},
					segmentId: 'segment_0',
					serverPosition: { fileName: '123456', lastEnd: 10000, endedWithPartInstance: 'mock_0', isPlaying: false }
				},
				part: {
					_id: '',
					segmentId: '',
					externalId: '',
					title: '',
					inTransition: { previousPartKeepaliveDuration: 2000, blockTakeDuration: 4000, partContentDelayDuration: 0 }
				}
			}),
			[]
		)
		expect(position).toEqual({ fileName: '123456', lastEnd: 12000, isPlaying: false, endedWithPartInstance: 'mock_0' })
	})
})
