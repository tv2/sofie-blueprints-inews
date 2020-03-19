import * as _ from 'underscore'

import { DeviceType, TimelineObjAbstractAny } from 'timeline-state-resolver-types'
import {
	BlueprintResultRundown,
	IBlueprintAdLibPiece,
	IBlueprintRundown,
	IBlueprintShowStyleVariant,
	IngestRundown,
	IStudioConfigContext,
	NotesContext,
	PieceLifespan,
	ShowStyleContext
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import { Enablers } from 'tv2-constants'
import { getBaseline } from '../tv2_offtube_studio/getBaseline'
import { OfftubeAbstractLLayer } from '../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig, parseConfig } from './helpers/config'
import { OffTubeSourceLayer } from './layers'

export function getShowStyleVariantId(
	_context: IStudioConfigContext,
	showStyleVariants: IBlueprintShowStyleVariant[],
	_ingestRundown: IngestRundown
): string | null {
	const variant = _.first(showStyleVariants)

	if (variant) {
		return variant._id
	}
	return null
}

export function getRundown(context: ShowStyleContext, ingestRundown: IngestRundown): BlueprintResultRundown {
	const config = parseConfig(context)

	let startTime: number = 0
	let endTime: number = 0

	// Set start / end times
	if ('payload' in ingestRundown) {
		if (ingestRundown.payload.expectedStart) {
			startTime = Number(ingestRundown.payload.expectedStart)
		}

		if (ingestRundown.payload.expectedEnd) {
			endTime = Number(ingestRundown.payload.expectedEnd)
		}
	}

	// Can't end before we begin
	if (endTime < startTime) {
		endTime = startTime
	}

	return {
		rundown: literal<IBlueprintRundown>({
			externalId: ingestRundown.externalId,
			name: ingestRundown.name,
			expectedStart: startTime,
			expectedDuration: endTime - startTime
		}),
		globalAdLibPieces: getGlobalAdLibPiecesOffTube(context, config),
		baseline: getBaseline(context)
	}
}

function getGlobalAdLibPiecesOffTube(
	_context: NotesContext,
	_config: OffTubeShowstyleBlueprintConfig
): IBlueprintAdLibPiece[] {
	const adlibItems: IBlueprintAdLibPiece[] = []

	let globalRank = 1000

	adlibItems.push(
		literal<IBlueprintAdLibPiece>({
			_rank: globalRank++,
			externalId: 'setNextToServer',
			name: 'Set Server Next',
			sourceLayerId: OffTubeSourceLayer.PgmSourceSelect,
			outputLayerId: 'sec',
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: true,
			content: {
				timelineObjects: [
					literal<TimelineObjAbstractAny>({
						id: '',
						enable: {
							while: '1'
						},
						priority: 1,
						layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
						content: {
							deviceType: DeviceType.ABSTRACT
						},
						classes: [Enablers.OFFTUBE_ENABLE_SERVER]
					})
				]
			}
		})
	)

	adlibItems.push(
		literal<IBlueprintAdLibPiece>({
			_rank: globalRank++,
			externalId: 'setNextToFullGFX',
			name: 'Set Full GFX Next',
			sourceLayerId: OffTubeSourceLayer.PgmSourceSelect,
			outputLayerId: 'sec',
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: true,
			content: {
				timelineObjects: [
					literal<TimelineObjAbstractAny>({
						id: '',
						enable: {
							while: '1'
						},
						priority: 1,
						layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
						content: {
							deviceType: DeviceType.ABSTRACT
						},
						classes: [Enablers.OFFTUBE_ENABLE_FULL]
					})
				]
			}
		})
	)

	adlibItems.push(
		literal<IBlueprintAdLibPiece>({
			_rank: globalRank++,
			externalId: 'setNextToDVE',
			name: 'Set DVE Next',
			sourceLayerId: OffTubeSourceLayer.PgmSourceSelect,
			outputLayerId: 'sec',
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: true,
			content: {
				timelineObjects: [
					literal<TimelineObjAbstractAny>({
						id: '',
						enable: {
							while: '1'
						},
						priority: 1,
						layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
						content: {
							deviceType: DeviceType.ABSTRACT
						},
						classes: [Enablers.OFFTUBE_ENABLE_DVE]
					})
				]
			}
		})
	)

	return adlibItems
}
