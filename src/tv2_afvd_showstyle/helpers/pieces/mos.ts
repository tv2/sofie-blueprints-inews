import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineContentTypeVizMSE,
	TimelineObjAtemDSK,
	TimelineObjAtemME,
	TimelineObjCCGMedia,
	TimelineObjSisyfosMessage,
	TimelineObjVIZMSEElementPilot,
	VIZMSETransitionType
} from 'timeline-state-resolver-types'
import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { CueDefinitionMOS } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer, VizLLayer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'
import { GetSisyfosTimelineObjForCamera } from '../sisyfos/sisyfos'
import { InfiniteMode } from './evaluateCues'
import { CreateTimingGrafik, grafikName } from './grafik'

export function EvaluateMOS(
	config: BlueprintConfig,
	context: PartContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionMOS,
	adlib?: boolean,
	isTlf?: boolean,
	rank?: number,
	isGrafikPart?: boolean,
	overrideOverlay?: boolean
) {
	if (parsedCue.isActuallyWall) {
		return
	}

	if (
		parsedCue.vcpid === undefined ||
		parsedCue.vcpid === null ||
		parsedCue.vcpid.toString() === '' ||
		parsedCue.vcpid.toString().length === 0
	) {
		context.warning('No valid VCPID provided')
		return
	}

	const isOverlay = !!parsedCue.name.match(/MOSART=L/i)

	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: grafikName(config, parsedCue),
				infiniteMode: GetInfiniteMode(parsedCue, isTlf, isGrafikPart),
				sourceLayerId: GetSourceLayer(isTlf, overrideOverlay || isOverlay),
				outputLayerId: overrideOverlay || isOverlay ? 'overlay' : isTlf || isGrafikPart ? 'pgm' : 'overlay',
				adlibPreroll: config.studio.PilotPrerollDuration,
				content: GetMosObjContent(config, parsedCue, `${partId}-adlib`, isOverlay, true, isTlf)
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: grafikName(config, parsedCue),
				...(isTlf || isGrafikPart
					? { enable: { start: 0 } }
					: {
							enable: {
								...CreateTimingGrafik(config, parsedCue)
							}
					  }),
				outputLayerId: overrideOverlay || isOverlay ? 'overlay' : isTlf || isGrafikPart ? 'pgm' : 'overlay',
				sourceLayerId: GetSourceLayer(isTlf, overrideOverlay || isOverlay),
				adlibPreroll: config.studio.PilotPrerollDuration,
				infiniteMode: GetInfiniteMode(parsedCue, isTlf, isGrafikPart),
				content: GetMosObjContent(config, parsedCue, partId, isOverlay, false, isTlf)
			})
		)
	}
}

function GetSourceLayer(isTlf?: boolean, isOverlay?: boolean) {
	return isTlf ? SourceLayer.PgmGraphicsTLF : isOverlay ? SourceLayer.PgmPilotOverlay : SourceLayer.PgmPilot
}

function GetInfiniteMode(parsedCue: CueDefinitionMOS, isTlf?: boolean, isGrafikPart?: boolean): PieceLifespan {
	return isTlf || isGrafikPart
		? PieceLifespan.OutOnNextPart
		: parsedCue.end && parsedCue.end.infiniteMode
		? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
		: PieceLifespan.Normal
}

function GetMosObjContent(
	config: BlueprintConfig,
	parsedCue: CueDefinitionMOS,
	partId: string,
	isOverlay: boolean,
	adlib?: boolean,
	tlf?: boolean
): GraphicsContent {
	return literal<GraphicsContent>({
		fileName: parsedCue.name,
		path: parsedCue.vcpid.toString(),
		timelineObjects: [
			literal<TimelineObjVIZMSEElementPilot>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: isOverlay ? VizLLayer.VizLLayerPilotOverlay : VizLLayer.VizLLayerPilot,
				content: {
					deviceType: DeviceType.VIZMSE,
					type: TimelineContentTypeVizMSE.ELEMENT_PILOT,
					templateVcpId: parsedCue.vcpid,
					continueStep: parsedCue.continueCount,
					noAutoPreloading: false,
					channelName: isOverlay ? 'OVL1' : 'FULL1',
					...(isOverlay
						? {}
						: {
								outTransition: {
									type: VIZMSETransitionType.DELAY,
									delay: config.studio.PilotOutTransitionDuration
								}
						  })
				},
				...(isOverlay || tlf ? [] : [ '.full' ])
			}),
			...(isOverlay
				? []
				: [
						literal<TimelineObjAtemME>({
							id: '',
							enable: {
								start: config.studio.PilotCutToMediaPlayer
							},
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									input: config.studio.AtemSource.FullFrameGrafikBackground,
									transition: AtemTransitionStyle.CUT
								}
							},
							...(adlib ? { classes: ['adlib_deparent'] } : {})
						}),
						literal<TimelineObjAtemDSK>({
							id: '',
							enable: {
								start: config.studio.PilotCutToMediaPlayer
							},
							priority: 1,
							layer: AtemLLayer.AtemAuxPGM,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.DSK,
								dsk: {
									onAir: true,
									sources: {
										fillSource: config.studio.AtemSource.DSK1F,
										cutSource: config.studio.AtemSource.DSK1K
									}
								}
							},
							classes: ['MIX_MINUS_OVERRIDE_DSK', 'PLACEHOLDER_OBJECT_REMOVEME']
						}),
						...GetSisyfosTimelineObjForCamera('full'),
						...MuteSisyfosChannels(partId)
				  ])
		]
	})
}

export function CleanUpDVEBackground(config: BlueprintConfig): TimelineObjCCGMedia[] {
	return [CasparLLayer.CasparCGDVEFrame, CasparLLayer.CasparCGDVEKey, CasparLLayer.CasparCGDVETemplate].map<
		TimelineObjCCGMedia
	>(layer => {
		return {
			id: '',
			enable: {
				start: config.studio.PilotCutToMediaPlayer
			},
			priority: 2,
			layer,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.MEDIA,
				file: 'empty',
				mixer: {
					opacity: 0
				}
			}
		}
	})
}

function MuteSisyfosChannels(partId: string): TimelineObjSisyfosMessage[] {
	return [
		SisyfosLLAyer.SisyfosSourceServerA,
		SisyfosLLAyer.SisyfosSourceServerB,
		SisyfosLLAyer.SisyfosSourceLive_1,
		SisyfosLLAyer.SisyfosSourceLive_2,
		SisyfosLLAyer.SisyfosSourceLive_3,
		SisyfosLLAyer.SisyfosSourceLive_4,
		SisyfosLLAyer.SisyfosSourceLive_5,
		SisyfosLLAyer.SisyfosSourceLive_6,
		SisyfosLLAyer.SisyfosSourceLive_7,
		SisyfosLLAyer.SisyfosSourceLive_8,
		SisyfosLLAyer.SisyfosSourceLive_9,
		SisyfosLLAyer.SisyfosSourceLive_10,
		SisyfosLLAyer.SisyfosSourceTLF,
		SisyfosLLAyer.SisyfosSourceEVS_1,
		SisyfosLLAyer.SisyfosSourceEVS_2
	].map<TimelineObjSisyfosMessage>(layer => {
		return literal<TimelineObjSisyfosMessage>({
			id: `muteSisyfos-${layer}-${partId}`,
			enable: {
				start: 0
			},
			priority: 2,
			layer,
			content: {
				deviceType: DeviceType.SISYFOS,
				type: TimelineContentTypeSisyfos.SISYFOS,
				isPgm: 0
			}
		})
	})
}
