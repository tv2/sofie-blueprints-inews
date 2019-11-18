import {
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeVizMSE,
	TimelineObjAtemAUX,
	TimelineObjCCGMedia,
	TimelineObjVIZMSEElementInternal,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import {
	CameraContent,
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../../common/util'
import { CueDefinitionVIZ } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { FindSourceByName } from '../../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer, CasparLLayer, VizLLayer } from '../../../tv2_afvd_studio/layers'
import { CalculateTime } from './evaluateCues'

export function EvaluateVIZ(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionVIZ,
	adlib?: boolean,
	rank?: number
) {
	if (parsedCue.design.match(/^dve-triopage$/)) {
		const path = parsedCue.content.triopage ? parsedCue.content.triopage : parsedCue.content.GRAFIK
		if (adlib) {
			adlibPieces.push(
				literal<IBlueprintAdLibPiece>({
					_rank: rank || 0,
					externalId: partId,
					name: path,
					outputLayerId: 'pgm0',
					sourceLayerId: SourceLayer.PgmDVEBackground,
					infiniteMode: PieceLifespan.Infinite,
					content: literal<GraphicsContent>({
						fileName: path,
						path,
						timelineObjects: _.compact<TSRTimelineObj>([
							literal<TimelineObjCCGMedia>({
								id: '',
								enable: { start: 0 },
								priority: 100,
								layer: CasparLLayer.CasparCGDVELoop,
								content: {
									deviceType: DeviceType.CASPARCG,
									type: TimelineContentTypeCasparCg.MEDIA,
									file: path,
									loop: true
								}
							})
						])
					})
				})
			)
		} else {
			pieces.push(
				literal<IBlueprintPiece>({
					_id: '',
					externalId: partId,
					name: path,
					enable: {
						start: parsedCue.start ? CalculateTime(parsedCue.start) : 0
					},
					outputLayerId: 'pgm0',
					sourceLayerId: SourceLayer.PgmDVEBackground,
					infiniteMode: PieceLifespan.Infinite,
					content: literal<GraphicsContent>({
						fileName: path,
						path,
						timelineObjects: _.compact<TSRTimelineObj>([
							literal<TimelineObjCCGMedia>({
								id: '',
								enable: { start: 0 },
								priority: 100,
								layer: CasparLLayer.CasparCGDVELoop,
								content: {
									deviceType: DeviceType.CASPARCG,
									type: TimelineContentTypeCasparCg.MEDIA,
									file: path,
									loop: true
								}
							})
						])
					})
				})
			)
		}
	} else if (parsedCue.rawType.match(/^VIZ=grafik-design$/)) {
		context.warning('VIZ=grafik-design is not supported for this showstyle')
	} else if (parsedCue.rawType.match(/^VIZ=full$/i)) {
		if (!parsedCue.content.INP1) {
			context.warning(`No input provided by ${parsedCue.rawType}`)
			return
		}
		const sourceInfo = FindSourceByName(context, config.sources, parsedCue.content.INP1)
		if (!sourceInfo) {
			context.warning(`Could not find source ${parsedCue.content.INP1}`)
			return
		}
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				enable: {
					start: parsedCue.start ? CalculateTime(parsedCue.start) : 0
				},
				name: parsedCue.content.INP1 || '',
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmVIZ,
				infiniteMode: PieceLifespan.Infinite,
				content: literal<CameraContent>({
					studioLabel: '',
					switcherInput: sourceInfo.port,
					timelineObjects: _.compact<TSRTimelineObj>([
						literal<TimelineObjAtemAUX>({
							id: '',
							enable: { start: 0 },
							priority: 100,
							layer: AtemLLayer.AtemAuxVizFullIn1,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.AUX,
								aux: {
									input: sourceInfo.port
								}
							}
						})
					])
				})
			})
		)
	} else {
		const path = parsedCue.content.triopage ? parsedCue.content.triopage : parsedCue.content.GRAFIK
		if (adlib) {
			adlibPieces.push(
				literal<IBlueprintAdLibPiece>({
					_rank: rank || 0,
					externalId: partId,
					name: path,
					outputLayerId: 'pgm0',
					sourceLayerId: SourceLayer.PgmDesign,
					infiniteMode: PieceLifespan.Infinite,
					content: literal<GraphicsContent>({
						fileName: path,
						path,
						timelineObjects: _.compact<TSRTimelineObj>([
							literal<TimelineObjVIZMSEElementInternal>({
								id: '',
								enable: { start: 0 },
								priority: 100,
								layer: VizLLayer.VizLLayerDesign,
								content: {
									deviceType: DeviceType.VIZMSE,
									type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
									templateName: path,
									templateData: []
								}
							})
						])
					})
				})
			)
		} else {
			pieces.push(
				literal<IBlueprintPiece>({
					_id: '',
					externalId: partId,
					name: path,
					enable: {
						start: parsedCue.start ? CalculateTime(parsedCue.start) : 0
					},
					outputLayerId: 'pgm0',
					sourceLayerId: SourceLayer.PgmDesign,
					infiniteMode: PieceLifespan.Infinite,
					content: literal<GraphicsContent>({
						fileName: path,
						path,
						timelineObjects: _.compact<TSRTimelineObj>([
							literal<TimelineObjVIZMSEElementInternal>({
								id: '',
								enable: { start: 0 },
								priority: 100,
								layer: VizLLayer.VizLLayerDesign,
								content: {
									deviceType: DeviceType.VIZMSE,
									type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
									templateName: path,
									templateData: []
								}
							})
						])
					})
				})
			)
		}
	}
}
