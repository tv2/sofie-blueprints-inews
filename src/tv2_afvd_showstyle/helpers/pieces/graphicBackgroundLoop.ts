import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import { CalculateTime, CueDefinitionBackgroundLoop, literal, TV2BlueprintConfig } from 'tv2-common'
import { SharedGraphicLLayer, SharedOutputLayers } from 'tv2-constants'
import { CasparLLayer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function EvaluateCueBackgroundLoop(
	config: TV2BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionBackgroundLoop,
	adlib?: boolean,
	rank?: number
) {
	const start = (parsedCue.start ? CalculateTime(parsedCue.start) : 0) ?? 0

	if (parsedCue.target === 'DVE') {
		const fileName = parsedCue.backgroundLoop
		const path = `dve/${fileName}`
		if (adlib) {
			adlibPieces.push({
				_rank: rank || 0,
				externalId: partId,
				name: fileName,
				outputLayerId: SharedOutputLayers.SEC,
				sourceLayerId: SourceLayer.PgmDVEBackground,
				lifespan: PieceLifespan.OutOnShowStyleEnd,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName,
					path,
					ignoreMediaObjectStatus: true,
					timelineObjects: dveLoopTimeline(path)
				})
			})
		} else {
			pieces.push({
				externalId: partId,
				name: fileName,
				enable: {
					start
				},
				outputLayerId: SharedOutputLayers.SEC,
				sourceLayerId: SourceLayer.PgmDVEBackground,
				lifespan: PieceLifespan.OutOnShowStyleEnd,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName,
					path,
					ignoreMediaObjectStatus: true,
					timelineObjects: dveLoopTimeline(path)
				})
			})
		}
	} else {
		// Full
		if (adlib) {
			adlibPieces.push({
				_rank: rank || 0,
				externalId: partId,
				name: parsedCue.backgroundLoop,
				outputLayerId: SharedOutputLayers.SEC,
				sourceLayerId: SourceLayer.PgmFullBackground,
				lifespan: PieceLifespan.OutOnShowStyleEnd,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: parsedCue.backgroundLoop,
					path: parsedCue.backgroundLoop,
					ignoreMediaObjectStatus: true,
					timelineObjects: fullLoopTimeline(config, parsedCue)
				})
			})
		} else {
			pieces.push({
				externalId: partId,
				name: parsedCue.backgroundLoop,
				enable: {
					start
				},
				outputLayerId: SharedOutputLayers.SEC,
				sourceLayerId: SourceLayer.PgmFullBackground,
				lifespan: PieceLifespan.OutOnShowStyleEnd,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: parsedCue.backgroundLoop,
					path: parsedCue.backgroundLoop,
					ignoreMediaObjectStatus: true,
					timelineObjects: fullLoopTimeline(config, parsedCue)
				})
			})
		}
	}
}

function dveLoopTimeline(path: string): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjCCGMedia>({
			id: '',
			enable: { start: 0 },
			priority: 100,
			layer: CasparLLayer.CasparCGDVELoop,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.MEDIA,
				file: path,
				loop: true
			}
		})
	]
}

function fullLoopTimeline(config: TV2BlueprintConfig, parsedCue: CueDefinitionBackgroundLoop): TSR.TSRTimelineObj[] {
	if (!config.selectedGfxSetup.FullShowName) {
		return []
	}
	return [
		literal<TSR.TimelineObjVIZMSEElementInternal>({
			id: '',
			enable: { start: 0 },
			priority: 1,
			layer: SharedGraphicLLayer.GraphicLLayerFullLoop,
			content: {
				deviceType: TSR.DeviceType.VIZMSE,
				type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
				templateName: parsedCue.backgroundLoop,
				templateData: [],
				showName: config.selectedGfxSetup.FullShowName
			}
		})
	]
}
