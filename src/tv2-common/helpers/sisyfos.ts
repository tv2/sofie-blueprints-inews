import * as _ from 'underscore'

import {
	DeviceType,
	TimelineContentTypeSisyfos,
	TimelineObjSisyfosMessage,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { NotesContext, SourceLayerType, Timeline } from 'tv-automation-sofie-blueprints-integration'
import { FindSourceInfoStrict, SourceInfo } from 'tv2-common'
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
	STUDIO_MICS: string[],
	layers?: string[]
): PieceMetaData | undefined {
	return layers && layers.length
		? GetStickyForPiece(
				[
					...layers.map<{ layer: string; isPgm: 0 | 1 | 2 }>(layer => {
						return { layer, isPgm: 1 }
					}),
					...STUDIO_MICS.map<{ layer: string; isPgm: 0 | 1 | 2 }>(l => {
						return { layer: l, isPgm: 1 }
					})
				],
				STICKY_LAYERS
		  )
		: undefined
}

export function GetKeepStudioMicsMetaData(STUDIO_MICS: string[]): PieceMetaData | undefined {
	return GetStickyForPiece(
		[
			...STUDIO_MICS.map<{ layer: string; isPgm: 0 | 1 | 2 }>(l => {
				return { layer: l, isPgm: 1 }
			})
		],
		STUDIO_MICS
	)
}

export function GetSisyfosTimelineObjForEkstern(
	context: NotesContext,
	sources: SourceInfo[],
	sourceType: string,
	enable?: Timeline.TimelineEnable
): TSRTimelineObj[] {
	if (!enable) {
		enable = { start: 0 }
	}

	const audioTimeline: TSRTimelineObj[] = []
	const layers = GetLayersForEkstern(context, sources, sourceType)

	if (!layers || !layers.length) {
		context.warning(`Could not set audio levels for ${sourceType}`)
		return audioTimeline
	}

	layers.forEach(layer => {
		audioTimeline.push(
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: enable!,
				priority: 1,
				layer,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: 1
				}
			})
		)
	})
	return audioTimeline
}

export function GetLayersForEkstern(context: NotesContext, sources: SourceInfo[], sourceType: string) {
	const eksternProps = sourceType.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
	const eksternLayers: string[] = []
	if (eksternProps) {
		const sourceInfo = FindSourceInfoStrict(context, sources, SourceLayerType.REMOTE, sourceType)
		if (sourceInfo && sourceInfo.sisyfosLayers) {
			eksternLayers.push(...sourceInfo.sisyfosLayers)
		}
	}
	return eksternLayers
}
