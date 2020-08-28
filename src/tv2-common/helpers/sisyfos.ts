import * as _ from 'underscore'

import { NotesContext, Timeline, TSR } from 'tv-automation-sofie-blueprints-integration'
import { SourceInfo, TV2StudioBlueprintConfigBase, TV2StudioConfigBase } from 'tv2-common'
import { PieceMetaData } from '../onTimelineGenerate'
import { literal } from '../util'

export function GetStickyForPiece(
	layers: Array<{ layer: string; isPgm: 0 | 1 | 2 }>,
	STICKY_LAYERS: string[]
): PieceMetaData | undefined {
	return literal<PieceMetaData>({
		stickySisyfosLevels: _.object(
			layers
				.filter(layer => STICKY_LAYERS.indexOf(layer.layer) !== -1)
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

export function GetEksternMetaData(
	STICKY_LAYERS: string[],
	studioMics: string[],
	layers?: string[]
): PieceMetaData | undefined {
	return layers && layers.length
		? GetStickyForPiece(
				[
					...layers.map<{ layer: string; isPgm: 0 | 1 | 2 }>(layer => {
						return { layer, isPgm: 1 }
					}),
					...studioMics.map<{ layer: string; isPgm: 0 | 1 | 2 }>(l => {
						return { layer: l, isPgm: 1 }
					})
				],
				STICKY_LAYERS
		  )
		: undefined
}

export function GetCameraMetaData(
	config: TV2StudioBlueprintConfigBase<TV2StudioConfigBase>,
	layers?: string[]
): PieceMetaData | undefined {
	return GetStickyForPiece(
		[...(layers || []), ...config.studio.StudioMics].map<{ layer: string; isPgm: 0 | 1 | 2 }>(l => {
			return { layer: l, isPgm: 1 }
		}),
		config.stickyLayers
	)
}

export function GetSisyfosTimelineObjForEkstern(
	_context: NotesContext,
	_sources: SourceInfo[],
	_sourceType: string,
	_getLayersForEkstern: (context: NotesContext, sources: SourceInfo[], sourceType: string) => string[] | undefined,
	_enable?: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosAny[] {
	return []
}

export function GetLayersForEkstern(_context: NotesContext, _sources: SourceInfo[], _sourceType: string) {
	return []
}

export function GetSisyfosTimelineObjForCamera(
	_context: NotesContext,
	_config: { sources: SourceInfo[]; studio: { StudioMics: string[] } },
	_sourceType: string,
	_enable?: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosAny[] {
	return []
}

export function GetLayersForCamera(
	_config: TV2StudioBlueprintConfigBase<TV2StudioConfigBase>,
	_sourceInfo: SourceInfo
) {
	return []
}

export function getStickyLayers(_studioConfig: TV2StudioConfigBase, _liveAudioLayers: string[]) {
	return []
}

export function getLiveAudioLayers(_studioConfig: TV2StudioConfigBase): string[] {
	return []
}
