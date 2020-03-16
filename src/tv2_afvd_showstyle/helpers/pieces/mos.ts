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
	PieceLifespan,
	SourceLayerType
} from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionMOS, InfiniteMode, literal } from 'tv2-common'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { SourceInfo } from '../../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer, CasparLLayer, SisyfosEVSSource, SisyfosLLAyer, VizLLayer } from '../../../tv2_afvd_studio/layers'
import { VizEngine } from '../../../types/constants'
import { BlueprintConfig } from '../config'
import { GetSisyfosTimelineObjForCamera } from '../sisyfos/sisyfos'
import { CreateTimingGrafik, grafikName } from './grafik'

export function EvaluateMOS(
	config: BlueprintConfig,
	context: PartContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionMOS,
	engine: VizEngine,
	adlib?: boolean,
	isTlf?: boolean,
	rank?: number,
	isGrafikPart?: boolean,
	overrideOverlay?: boolean
) {
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
			makeMosAdlib(partId, config, parsedCue, engine, isOverlay, isTlf, rank, isGrafikPart, overrideOverlay)
		)
	} else {
		if (!isOverlay && !overrideOverlay && config.showStyle.MakeAdlibsForFulls && !adlib && engine !== 'WALL') {
			adlibPieces.push(
				makeMosAdlib(partId, config, parsedCue, engine, isOverlay, isTlf, rank, isGrafikPart, overrideOverlay)
			)
		}
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
				outputLayerId: GetOutputLayer(engine, !!overrideOverlay, isOverlay, !!isTlf, !!isGrafikPart),
				sourceLayerId: GetSourceLayer(engine, isTlf, overrideOverlay || isOverlay),
				adlibPreroll: config.studio.PilotPrerollDuration,
				infiniteMode: GetInfiniteMode(engine, parsedCue, isTlf, isGrafikPart),
				content: GetMosObjContent(engine, config, parsedCue, partId, isOverlay, false, isTlf)
			})
		)
	}
}

function makeMosAdlib(
	partId: string,
	config: BlueprintConfig,
	parsedCue: CueDefinitionMOS,
	engine: VizEngine,
	isOverlay: boolean,
	isTlf?: boolean,
	rank?: number,
	isGrafikPart?: boolean,
	overrideOverlay?: boolean
): IBlueprintAdLibPiece {
	return {
		_rank: rank || 0,
		externalId: partId,
		name: grafikName(config, parsedCue),
		infiniteMode: GetInfiniteMode(engine, parsedCue, isTlf, isGrafikPart),
		sourceLayerId: GetSourceLayer(engine, isTlf, overrideOverlay || isOverlay),
		outputLayerId: GetOutputLayer(engine, !!overrideOverlay, isOverlay, !!isTlf, !!isGrafikPart),
		adlibPreroll: config.studio.PilotPrerollDuration,
		content: GetMosObjContent(engine, config, parsedCue, `${partId}-adlib`, isOverlay, true, isTlf, rank),
		toBeQueued: true
	}
}

function GetOutputLayer(
	engine: VizEngine,
	overrideOverlay: boolean,
	isOverlay: boolean,
	isTlf: boolean,
	isGrafikPart: boolean
) {
	return engine === 'WALL'
		? 'sec'
		: overrideOverlay || isOverlay
		? 'overlay'
		: isTlf || isGrafikPart
		? 'pgm'
		: 'overlay'
}

function GetSourceLayer(engine: VizEngine, isTlf?: boolean, isOverlay?: boolean): SourceLayer {
	return engine === 'WALL'
		? SourceLayer.WallGraphics
		: isTlf
		? SourceLayer.PgmGraphicsTLF
		: isOverlay
		? SourceLayer.PgmPilotOverlay
		: SourceLayer.PgmPilot
}

function GetInfiniteMode(
	engine: VizEngine,
	parsedCue: CueDefinitionMOS,
	isTlf?: boolean,
	isGrafikPart?: boolean
): PieceLifespan {
	return engine === 'WALL'
		? PieceLifespan.Infinite
		: isTlf || isGrafikPart
		? PieceLifespan.OutOnNextPart
		: parsedCue.end && parsedCue.end.infiniteMode
		? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
		: PieceLifespan.Normal
}

function GetMosObjContent(
	engine: VizEngine,
	config: BlueprintConfig,
	parsedCue: CueDefinitionMOS,
	partId: string,
	isOverlay: boolean,
	adlib?: boolean,
	tlf?: boolean,
	adlibrank?: number
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
				layer:
					engine === 'WALL'
						? VizLLayer.VizLLayerWall
						: isOverlay
						? VizLLayer.VizLLayerPilotOverlay
						: VizLLayer.VizLLayerPilot,
				content: {
					deviceType: DeviceType.VIZMSE,
					type: TimelineContentTypeVizMSE.ELEMENT_PILOT,
					templateVcpId: parsedCue.vcpid,
					continueStep: parsedCue.continueCount,
					noAutoPreloading: false,
					channelName: engine === 'WALL' ? 'WALL1' : isOverlay ? 'OVL1' : 'FULL1',
					...(isOverlay || engine === 'WALL'
						? {}
						: {
								outTransition: {
									type: VIZMSETransitionType.DELAY,
									delay: config.studio.PilotOutTransitionDuration
								}
						  })
				},
				...(isOverlay || tlf || engine === 'WALL' ? {} : { classes: ['full'] })
			}),
			...(isOverlay || engine === 'WALL'
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
						...MuteSisyfosChannels(partId, config.sources, !!adlib, adlibrank ?? 0, parsedCue.vcpid)
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

function MuteSisyfosChannels(
	partId: string,
	sources: SourceInfo[],
	adlib: boolean,
	adlibRank: number,
	vcpid: number
): TimelineObjSisyfosMessage[] {
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
		...[
			...(sources
				.filter(s => s.type === SourceLayerType.REMOTE && s.id.match(/^DP/i))
				.map(s => SisyfosEVSSource(s.id.replace(/^DP/i, '') as SisyfosLLAyer)) as SisyfosLLAyer[])
		]
	].map<TimelineObjSisyfosMessage>(layer => {
		return literal<TimelineObjSisyfosMessage>({
			id: `muteSisyfos-${layer}-${partId}-${vcpid}-${adlib ? `adlib-${adlibRank}` : ''}`,
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
