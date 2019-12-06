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
	PieceLifespan,
	SourceLayerType
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../../common/util'
import { CueDefinitionVIZ } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { FindSourceInfoStrict } from '../../../tv2_afvd_studio/helpers/sources'
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
	if (parsedCue.design.match(/^dve-triopage$/i)) {
		const fileName = parsedCue.content.triopage ? parsedCue.content.triopage : parsedCue.content.GRAFIK
		const path = `dve/${fileName}`
		if (adlib) {
			adlibPieces.push(
				literal<IBlueprintAdLibPiece>({
					_rank: rank || 0,
					externalId: partId,
					name: fileName,
					outputLayerId: 'sec',
					sourceLayerId: SourceLayer.PgmDVEBackground,
					infiniteMode: PieceLifespan.Infinite,
					content: literal<GraphicsContent>({
						fileName,
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
					name: fileName,
					enable: {
						start: parsedCue.start ? CalculateTime(parsedCue.start) : 0
					},
					outputLayerId: 'sec',
					sourceLayerId: SourceLayer.PgmDVEBackground,
					infiniteMode: PieceLifespan.Infinite,
					content: literal<GraphicsContent>({
						fileName,
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
	} else if (parsedCue.rawType.match(/^VIZ=grafik-design$/i)) {
		context.warning('VIZ=grafik-design is not supported for this showstyle')
	} else if (parsedCue.rawType.match(/^VIZ=full$/i)) {
		if (!parsedCue.content.INP1) {
			context.warning(`No input provided by ${parsedCue.rawType}`)
			return
		}
		let sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, parsedCue.content.INP1)
		if (!sourceInfo) {
			sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, parsedCue.content.INP1)
			if (!sourceInfo) {
				context.warning(`Could not find source ${parsedCue.content.INP1}`)
				return
			}
		}
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				enable: {
					start: parsedCue.start ? CalculateTime(parsedCue.start) : 0
				},
				name: parsedCue.content.INP1 || '',
				outputLayerId: 'aux',
				sourceLayerId: SourceLayer.VizFullIn1,
				infiniteMode: PieceLifespan.Infinite,
				content: literal<CameraContent>({
					studioLabel: '',
					switcherInput: sourceInfo.port,
					timelineObjects: _.compact<TSRTimelineObj>([
						literal<TimelineObjAtemAUX>({
							id: '',
							enable: { start: 0 },
							priority: 100,
							layer: AtemLLayer.AtemAuxVizOvlIn1,
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
					outputLayerId: 'sec',
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
					outputLayerId: 'sec',
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
