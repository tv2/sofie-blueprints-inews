/*import {
	CameraContent,
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	SourceLayerType,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { CalculateTime, FindSourceInfoStrict, literal, TV2BlueprintConfigBase, TV2StudioConfigBase } from 'tv2-common'
import * as _ from 'underscore'
import { PartContext2 } from '../partContext2'

export interface VizCueSourceLayers {
	SourceLayerDVEBackground: string
	CasparLLayerDVELoop: string
	SourceLayerVizFullIn1?: string
	AtemLLayerAtemAuxVizOvlIn1?: string
	SourceLayerDesign?: string
	GraphicLLayerGraphicLLayerDesign?: string
}

export function EvaluateVIZBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: PartContext2,
	config: ShowStyleConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionVIZ,
	useVizEngine: boolean,
	sourceLayers: VizCueSourceLayers,
	adlib?: boolean,
	rank?: number
) {
	const start = (parsedCue.start ? CalculateTime(parsedCue.start) : 0) ?? 0
	if (parsedCue.design.match(/^dve-triopage$/i)) {
		const fileName = parsedCue.content.TRIOPAGE ? parsedCue.content.TRIOPAGE : parsedCue.content.GRAFIK
		const path = `dve/${fileName}`
		if (adlib) {
			adlibPieces.push(
				literal<IBlueprintAdLibPiece>({
					_rank: rank || 0,
					externalId: partId,
					name: fileName,
					outputLayerId: 'sec',
					sourceLayerId: sourceLayers.SourceLayerDVEBackground,
					lifespan: PieceLifespan.OutOnRundownEnd,
					content: literal<GraphicsContent>({
						fileName,
						path,
						ignoreMediaObjectStatus: true,
						timelineObjects: _.compact<TSR.TSRTimelineObj>([
							literal<TSR.TimelineObjCCGMedia>({
								id: '',
								enable: { start: 0 },
								priority: 100,
								layer: sourceLayers.CasparLLayerDVELoop,
								content: {
									deviceType: TSR.DeviceType.CASPARCG,
									type: TSR.TimelineContentTypeCasparCg.MEDIA,
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
					externalId: partId,
					name: fileName,
					enable: {
						start
					},
					outputLayerId: 'sec',
					sourceLayerId: sourceLayers.SourceLayerDVEBackground,
					lifespan: PieceLifespan.OutOnRundownEnd,
					content: literal<GraphicsContent>({
						fileName,
						path,
						ignoreMediaObjectStatus: true,
						timelineObjects: _.compact<TSR.TSRTimelineObj>([
							literal<TSR.TimelineObjCCGMedia>({
								id: '',
								enable: { start: 0 },
								priority: 100,
								layer: sourceLayers.CasparLLayerDVELoop,
								content: {
									deviceType: TSR.DeviceType.CASPARCG,
									type: TSR.TimelineContentTypeCasparCg.MEDIA,
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
		if (useVizEngine) {
			if (sourceLayers.SourceLayerVizFullIn1 && sourceLayers.AtemLLayerAtemAuxVizOvlIn1) {
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
						externalId: partId,
						enable: {
							start
						},
						name: parsedCue.content.INP1 || '',
						outputLayerId: 'aux',
						sourceLayerId: sourceLayers.SourceLayerVizFullIn1,
						lifespan: PieceLifespan.OutOnRundownEnd,
						content: literal<CameraContent>({
							studioLabel: '',
							switcherInput: sourceInfo.port,
							timelineObjects: _.compact<TSR.TSRTimelineObj>([
								literal<TSR.TimelineObjAtemAUX>({
									id: '',
									enable: { start: 0 },
									priority: 100,
									layer: sourceLayers.AtemLLayerAtemAuxVizOvlIn1,
									content: {
										deviceType: TSR.DeviceType.ATEM,
										type: TSR.TimelineContentTypeAtem.AUX,
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
				context.warning(`Could not route source to Viz engine, this studio is not configured correctly.`)
			}
		}
	} else {
		if (useVizEngine) {
			if (sourceLayers.SourceLayerDesign && sourceLayers.GraphicLLayerGraphicLLayerDesign) {
				const path = parsedCue.content.triopage ? parsedCue.content.triopage : parsedCue.content.GRAFIK

				if (!path || !path.length) {
					context.warning(`No valid template found for ${parsedCue.design}`)
					return
				}

				if (adlib) {
					adlibPieces.push(
						literal<IBlueprintAdLibPiece>({
							_rank: rank || 0,
							externalId: partId,
							name: path,
							outputLayerId: 'sec',
							sourceLayerId: sourceLayers.SourceLayerDesign,
							lifespan: PieceLifespan.OutOnRundownEnd,
							content: literal<GraphicsContent>({
								fileName: path,
								path,
								ignoreMediaObjectStatus: true,
								timelineObjects: _.compact<TSR.TSRTimelineObj>([
									literal<TSR.TimelineObjVIZMSEElementInternal>({
										id: '',
										enable: { start: 0 },
										priority: 100,
										layer: sourceLayers.GraphicLLayerGraphicLLayerDesign,
										content: {
											deviceType: TSR.DeviceType.VIZMSE,
											type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
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
							externalId: partId,
							name: path,
							enable: {
								start
							},
							outputLayerId: 'sec',
							sourceLayerId: sourceLayers.SourceLayerDesign,
							lifespan: PieceLifespan.OutOnRundownEnd,
							content: literal<GraphicsContent>({
								fileName: path,
								path,
								ignoreMediaObjectStatus: true,
								timelineObjects: _.compact<TSR.TSRTimelineObj>([
									literal<TSR.TimelineObjVIZMSEElementInternal>({
										id: '',
										enable: { start: 0 },
										priority: 100,
										layer: sourceLayers.GraphicLLayerGraphicLLayerDesign,
										content: {
											deviceType: TSR.DeviceType.VIZMSE,
											type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
											templateName: path,
											templateData: []
										}
									})
								])
							})
						})
					)
				}
			} else {
				context.warning(`Could not create VIZ design, this studio is not configured correctly.`)
			}
		}
	}
}*/
