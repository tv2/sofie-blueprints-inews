import { GetStickyForPiece, literal, PieceMetaData } from 'tv2-common'
import { SisyfosLLAyer } from '../../../../tv2_afvd_studio/layers'

export const STUDIO_MICS = [
	SisyfosLLAyer.SisyfosSourceHost_1_ST_A,
	SisyfosLLAyer.SisyfosSourceHost_2_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_1_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_2_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_3_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_4_ST_A
]

export const LIVE_AUDIO = [
	SisyfosLLAyer.SisyfosSourceLive_1,
	SisyfosLLAyer.SisyfosSourceLive_2,
	SisyfosLLAyer.SisyfosSourceLive_3,
	SisyfosLLAyer.SisyfosSourceLive_4,
	SisyfosLLAyer.SisyfosSourceLive_5,
	SisyfosLLAyer.SisyfosSourceLive_6,
	SisyfosLLAyer.SisyfosSourceLive_7,
	SisyfosLLAyer.SisyfosSourceLive_8,
	SisyfosLLAyer.SisyfosSourceLive_9,
	SisyfosLLAyer.SisyfosSourceLive_10
]

export const STICKY_LAYERS = [...STUDIO_MICS, ...LIVE_AUDIO]

describe('sisyfos', () => {
	test('GetStickyForPiece', () => {
		const result = GetStickyForPiece(
			STUDIO_MICS.map<{ layer: SisyfosLLAyer; isPgm: 0 | 1 | 2 }>(layer => {
				return {
					layer,
					isPgm: 1
				}
			}),
			STICKY_LAYERS
		)
		expect(result).toEqual(
			literal<PieceMetaData>({
				stickySisyfosLevels: {
					sisyfos_source_Host_1_st_a: {
						value: 1,
						followsPrevious: false
					},
					sisyfos_source_Host_2_st_a: {
						value: 1,
						followsPrevious: false
					},
					sisyfos_source_Guest_1_st_a: {
						value: 1,
						followsPrevious: false
					},
					sisyfos_source_Guest_2_st_a: {
						value: 1,
						followsPrevious: false
					},
					sisyfos_source_Guest_3_st_a: {
						value: 1,
						followsPrevious: false
					},
					sisyfos_source_Guest_4_st_a: {
						value: 1,
						followsPrevious: false
					}
				}
			})
		)
	})
})
