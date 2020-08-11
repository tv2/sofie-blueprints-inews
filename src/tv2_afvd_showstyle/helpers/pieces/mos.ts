import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	NotesContext,
	PieceLifespan,
	SourceLayerType,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	CueDefinitionMOS,
	GetDefaultOut,
	GetSisyfosTimelineObjForCamera,
	GraphicLLayer,
	InfiniteMode,
	literal,
	PartContext2,
	SourceInfo
} from 'tv2-common'
import { GraphicEngine } from 'tv2-constants'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { AtemLLayer, CasparLLayer, SisyfosEVSSource, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'
import { CreateTimingGrafik, grafikName } from './grafikViz'

export function EvaluateMOSViz(
	config: BlueprintConfig,
	context: PartContext2,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionMOS,
	engine: GraphicEngine,
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
			makeMosAdlib(context, partId, config, parsedCue, engine, isOverlay, isTlf, rank, isGrafikPart, overrideOverlay)
		)
	} else {
		if (!isOverlay && !overrideOverlay && config.showStyle.MakeAdlibsForFulls && !adlib && engine !== 'WALL') {
			adlibPieces.push(
				makeMosAdlib(context, partId, config, parsedCue, engine, isOverlay, isTlf, rank, isGrafikPart, overrideOverlay)
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
				content: GetMosObjContent(context, engine, config, parsedCue, partId, isOverlay, false, isTlf)
			})
		)
	}
}

function makeMosAdlib(
	context: NotesContext,
	partId: string,
	config: BlueprintConfig,
	parsedCue: CueDefinitionMOS,
	engine: GraphicEngine,
	isOverlay: boolean,
	isTlf?: boolean,
	rank?: number,
	isGrafikPart?: boolean,
	overrideOverlay?: boolean
): IBlueprintAdLibPiece {
	const duration = CreateTimingGrafik(config, parsedCue).duration || !isGrafikPart ? GetDefaultOut(config) : undefined
	const infiniteMode = GetInfiniteMode(engine, parsedCue, isTlf, isGrafikPart)
	return {
		_rank: rank || 0,
		externalId: partId,
		name: grafikName(config, parsedCue),
		expectedDuration:
			!(parsedCue.end && parsedCue.end.infiniteMode) && infiniteMode === PieceLifespan.Normal && duration
				? duration
				: undefined,
		infiniteMode,
		sourceLayerId: GetSourceLayer(engine, isTlf, overrideOverlay || isOverlay),
		outputLayerId: GetOutputLayer(engine, !!overrideOverlay, isOverlay, !!isTlf, !!isGrafikPart),
		adlibPreroll: config.studio.PilotPrerollDuration,
		content: GetMosObjContent(context, engine, config, parsedCue, `${partId}-adlib`, isOverlay, true, isTlf, rank),
		toBeQueued: true
	}
}

function GetOutputLayer(
	engine: GraphicEngine,
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

function GetSourceLayer(engine: GraphicEngine, isTlf?: boolean, isOverlay?: boolean): SourceLayer {
	return engine === 'WALL'
		? SourceLayer.WallGraphics
		: isTlf
		? SourceLayer.PgmGraphicsTLF
		: isOverlay
		? SourceLayer.PgmPilotOverlay
		: SourceLayer.PgmPilot
}

function GetInfiniteMode(
	engine: GraphicEngine,
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
	context: NotesContext,
	engine: GraphicEngine,
	config: BlueprintConfig,
	parsedCue: CueDefinitionMOS,
	partId: string,
	isOverlay: boolean,
	adlib?: boolean,
	tlf?: boolean,
	adlibrank?: number
): GraphicsContent {
	return literal<GraphicsContent>({
		fileName: 'PILOT_' + parsedCue.vcpid.toString(),
		path: parsedCue.vcpid.toString(),
		timelineObjects: [
			literal<TSR.TimelineObjVIZMSEElementPilot>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer:
					engine === 'WALL'
						? GraphicLLayer.GraphicLLayerWall
						: isOverlay
						? GraphicLLayer.GraphicLLayerPilotOverlay
						: GraphicLLayer.GraphicLLayerPilot,
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT,
					templateVcpId: parsedCue.vcpid,
					continueStep: parsedCue.continueCount,
					noAutoPreloading: false,
					channelName: engine === 'WALL' ? 'WALL1' : isOverlay ? 'OVL1' : 'FULL1',
					...(isOverlay || engine === 'WALL'
						? {}
						: {
								outTransition: {
									type: TSR.VIZMSETransitionType.DELAY,
									delay: config.studio.PilotOutTransitionDuration
								}
						  })
				},
				...(isOverlay || tlf || engine === 'WALL' ? {} : { classes: ['full'] })
			}),
			...(isOverlay || engine === 'WALL'
				? []
				: [
						literal<TSR.TimelineObjAtemME>({
							id: '',
							enable: {
								start: config.studio.PilotCutToMediaPlayer
							},
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									input: config.studio.AtemSource.FullFrameGrafikBackground,
									transition: TSR.AtemTransitionStyle.CUT
								}
							},
							...(adlib ? { classes: ['adlib_deparent'] } : {})
						}),
						literal<TSR.TimelineObjAtemDSK>({
							id: '',
							enable: {
								start: config.studio.PilotCutToMediaPlayer
							},
							priority: 1,
							layer: AtemLLayer.AtemAuxPGM,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.DSK,
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
						...GetSisyfosTimelineObjForCamera(context, config, 'full'),
						...MuteSisyfosChannels(partId, config.sources, !!adlib, adlibrank ?? 0, parsedCue.vcpid)
				  ])
		]
	})
}

export function CleanUpDVEBackground(config: BlueprintConfig): TSR.TimelineObjCCGMedia[] {
	return [CasparLLayer.CasparCGDVEFrame, CasparLLayer.CasparCGDVEKey, CasparLLayer.CasparCGDVETemplate].map<
		TSR.TimelineObjCCGMedia
	>(layer => {
		return {
			id: '',
			enable: {
				start: config.studio.PilotCutToMediaPlayer
			},
			priority: 2,
			layer,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.MEDIA,
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
): TSR.TimelineObjSisyfosChannel[] {
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
	].map<TSR.TimelineObjSisyfosChannel>(layer => {
		return literal<TSR.TimelineObjSisyfosChannel>({
			id: `muteSisyfos-${layer}-${partId}-${vcpid}-${adlib ? `adlib-${adlibRank}` : ''}`,
			enable: {
				start: 0
			},
			priority: 2,
			layer,
			content: {
				deviceType: TSR.DeviceType.SISYFOS,
				type: TSR.TimelineContentTypeSisyfos.CHANNEL,
				isPgm: 0
			}
		})
	})
}
