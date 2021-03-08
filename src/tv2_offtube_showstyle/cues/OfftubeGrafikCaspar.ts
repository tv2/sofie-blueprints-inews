import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	SegmentContext,
	TSR
} from '@sofie-automation/blueprints-integration'
import {
	ActionSelectFullGrafik,
	CreateInternalGraphic,
	CueDefinitionGraphic,
	GetFullGraphicTemplateNameFromCue,
	GetTagForFull,
	GetTagForFullNext,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	GraphicPilot,
	literal,
	PartDefinition,
	TimeFromFrames,
	TimelineBlueprintExt
} from 'tv2-common'
import { AdlibActionType, AdlibTags, TallyTags } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer } from '../../tv2_offtube_studio/layers'
import { AtemSourceIndex } from '../../types/atem'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateGrafikCaspar(
	config: OfftubeShowstyleBlueprintConfig,
	context: SegmentContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	adlib: boolean,
	partDefinition: PartDefinition,
	rank?: number
) {
	if (GraphicIsPilot(parsedCue)) {
		const adLibPiece = CreateFullAdLib(config, partDefinition.externalId, parsedCue, partDefinition.segmentExternalId)

		actions.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.SELECT_FULL_GRAFIK,
				userData: literal<ActionSelectFullGrafik>({
					type: AdlibActionType.SELECT_FULL_GRAFIK,
					segmentExternalId: partDefinition.segmentExternalId,
					name: parsedCue.graphic.name,
					vcpid: parsedCue.graphic.vcpid
				}),
				userDataManifest: {},
				display: {
					label: GetFullGraphicTemplateNameFromCue(config, parsedCue),
					sourceLayerId: OfftubeSourceLayer.PgmFull,
					outputLayerId: OfftubeOutputLayers.PGM,
					content: { ...adLibPiece.content, timelineObjects: [] },
					tags: [AdlibTags.ADLIB_KOMMENTATOR, AdlibTags.ADLIB_FLOW_PRODUCER],
					currentPieceTags: [GetTagForFull(partDefinition.segmentExternalId, parsedCue.graphic.vcpid)],
					nextPieceTags: [GetTagForFullNext(partDefinition.segmentExternalId, parsedCue.graphic.vcpid)]
				}
			})
		)

		const piece = CreateFullPiece(config, partDefinition.externalId, parsedCue, partDefinition.segmentExternalId)
		pieces.push(piece)
	} else if (GraphicIsInternal(parsedCue)) {
		CreateInternalGraphic(config, context, pieces, adlibPieces, actions, partId, parsedCue, adlib, partDefinition, rank)
	}
}

export function CreateFullPiece(
	config: OfftubeShowstyleBlueprintConfig,
	externalId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	segmentExternalId: string
): IBlueprintPiece {
	return literal<IBlueprintPiece>({
		enable: {
			start: 0 // TODO: Time
		},
		externalId,
		name: `${parsedCue.graphic.name}`,
		sourceLayerId: OfftubeSourceLayer.PgmFull,
		outputLayerId: OfftubeOutputLayers.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: CreateFullContent(config, parsedCue),
		tags: [
			GetTagForFull(segmentExternalId, parsedCue.graphic.vcpid),
			GetTagForFullNext(segmentExternalId, parsedCue.graphic.vcpid),
			TallyTags.FULL_IS_LIVE
		]
	})
}

function CreateFullAdLib(
	config: OfftubeShowstyleBlueprintConfig,
	externalId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	segmentExternalId: string
): IBlueprintAdLibPiece {
	return literal<IBlueprintAdLibPiece>({
		_rank: 0,
		externalId,
		name: `${parsedCue.graphic.name.replace(/_/g, ' ')}`,
		sourceLayerId: OfftubeSourceLayer.PgmFull,
		outputLayerId: OfftubeOutputLayers.PGM,
		toBeQueued: true,
		adlibPreroll: config.studio.CasparPrerollDuration,
		adlibTransitionKeepAlive: config.studio.FullKeepAliveDuration ? Number(config.studio.FullKeepAliveDuration) : 60000,
		lifespan: PieceLifespan.WithinPart,
		tags: [AdlibTags.ADLIB_FLOW_PRODUCER, AdlibTags.ADLIB_KOMMENTATOR],
		currentPieceTags: [GetTagForFull(segmentExternalId, parsedCue.graphic.vcpid)],
		nextPieceTags: [GetTagForFullNext(segmentExternalId, parsedCue.graphic.vcpid)],
		content: CreateFullContent(config, parsedCue)
	})
}

export function CreateFullContent(
	config: OfftubeShowstyleBlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicPilot>
): GraphicsContent {
	return {
		fileName: parsedCue.graphic.name,
		path: `${config.studio.NetworkBasePathGraphic}\\${parsedCue.graphic.name}${config.studio.GraphicFileExtension}`, // full path on the source network storage, TODO: File extension
		mediaFlowIds: [config.studio.GraphicMediaFlowId],
		timelineObjects: [
			literal<TSR.TimelineObjCCGTemplate>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 100,
				layer: OfftubeCasparLLayer.CasparGraphicsFull,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
					templateType: 'html',
					name: 'sport-overlay/index',
					data: `<templateData>${encodeURI(
						JSON.stringify({
							display: 'program',
							slots: {
								'250_full': {
									payload: {
										type: 'still',
										url: `${config.studio.FullGraphicURL}/${parsedCue.graphic.name}${config.studio.GraphicFileExtension}`
									}
								}
							}
						})
					)}</templateData>`,
					useStopCommand: false,
					mixer: {
						opacity: 100
					}
				}
			}),
			literal<TSR.TimelineObjAtemDSK>({
				id: '',
				enable: {
					start: Number(config.studio.CasparPrerollDuration)
				},
				priority: 1,
				layer: OfftubeAtemLLayer.AtemDSKGraphics,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.DSK,
					dsk: {
						onAir: true,
						sources: {
							fillSource: config.studio.AtemSource.JingleFill,
							cutSource: config.studio.AtemSource.JingleKey
						},
						properties: {
							preMultiply: true,
							clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000,
							gain: config.studio.AtemSettings.CCGGain * 10, // input is percents (0-100), atem uses 1-000,
							mask: {
								enabled: false
							}
						}
					}
				},
				classes: ['MIX_MINUS_OVERRIDE_DSK']
			}),
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: {
					start: Number(config.studio.CasparPrerollDuration)
				},
				priority: 1,
				layer: OfftubeAtemLLayer.AtemMEClean,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						input: config.studio.AtemSource.SplitBackground,
						transition: TSR.AtemTransitionStyle.WIPE,
						transitionSettings: {
							wipe: {
								rate: Number(config.studio.FullTransitionSettings.wipeRate),
								pattern: 1,
								reverseDirection: true,
								borderSoftness: config.studio.FullTransitionSettings.borderSoftness
							}
						}
					}
				}
			}),
			literal<TSR.TimelineObjCasparCGAny>({
				id: '',
				enable: {
					start:
						Number(config.studio.CasparPrerollDuration) +
						TimeFromFrames(Number(config.studio.FullTransitionSettings.wipeRate))
				},
				priority: 1,
				layer: OfftubeCasparLLayer.CasparGraphicsFullLoop,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.ROUTE,
					mappedLayer: OfftubeCasparLLayer.CasparCGDVELoop,
					transitions: {
						outTransition: {
							type: TSR.Transition.MIX,
							duration: config.studio.FullTransitionSettings.loopOutTransitionDuration
						}
					}
				}
			}),
			literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
				id: '',
				enable: { start: 0 },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemMENext,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						previewInput: AtemSourceIndex.Blk
					}
				},
				metaData: {},
				classes: ['ab_on_preview']
			})
		]
	}
}
