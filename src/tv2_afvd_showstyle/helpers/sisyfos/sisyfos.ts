import { literal, PieceMetaData } from 'tv2-common'
import _ = require('underscore')
import { BlueprintConfig, StudioConfig } from '../../../tv2_afvd_studio/helpers/config'

export function GetStickyForPiece(
	config: BlueprintConfig,
	layers: Array<{ layer: string; isPgm: 0 | 1 | 2 }>
): PieceMetaData | undefined {
	return literal<PieceMetaData>({
		stickySisyfosLevels: _.object(
			layers
				.filter(layer => config.stickyLayers.indexOf(layer.layer) !== -1)
				.map<[string, { value: number; followsPrevious: boolean }]>(layer => {
					return [
						layer.layer,
						{
							value: layer.isPgm,
							followsPrevious: false
						}
					]
				})
		)
	})
}

export function getStickyLayers(studioConfig: StudioConfig) {
	return [...studioConfig.StudioMics, ...getLiveAudioLayers(studioConfig)]
}

export function getLiveAudioLayers(studioConfig: StudioConfig): string[] {
	const res: Set<string> = new Set()

	_.each([studioConfig.SourcesRM, studioConfig.SourcesSkype], sources => {
		_.each(sources, src => {
			if (src.SisyfosLayers) {
				_.each(src.SisyfosLayers, layer => {
					res.add(layer)
				})
			}
		})
	})

	return Array.from(res)
}
