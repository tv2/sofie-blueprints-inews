import { PieceMetaData } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import { SisyfosLLAyer } from '../../../../tv2_afvd_studio/layers'
import { GetStickyForPiece, STUDIO_MICS } from '../sisyfos'

describe('sisyfos', () => {
	test('GetStickyForPiece', () => {
		const result = GetStickyForPiece(
			STUDIO_MICS.map<{ layer: SisyfosLLAyer; isPgm: 0 | 1 | 2 }>(layer => {
				return {
					layer,
					isPgm: 1
				}
			})
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
