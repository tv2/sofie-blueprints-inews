import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	NotesContext,
	PieceLifespan,
	SegmentContext,
	SourceLayerType,
	TSR
} from '@sofie-automation/blueprints-integration'
import {
	CueDefinitionGraphic,
	FindInfiniteModeFromConfig,
	GetInfiniteModeForGraphic,
	GetSisyfosTimelineObjForCamera,
	GraphicDisplayName,
	GraphicLLayer,
	GraphicPilot,
	IsTargetingFull,
	IsTargetingOVL,
	IsTargetingTLF,
	IsTargetingWall,
	literal,
	SisyfosEVSSource,
	SourceInfo
} from 'tv2-common'
import { GraphicEngine } from 'tv2-constants'
import { AtemLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'
import { BlueprintConfig } from '../config'
import { CreateTimingGrafik, GetEnableForGrafik } from './graphic'

export function EvaluateCueGraphicPilot(
	config: BlueprintConfig,
	context: SegmentContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	adlib: boolean,
	rank?: number
) {
	if (
		parsedCue.graphic.vcpid === undefined ||
		parsedCue.graphic.vcpid === null ||
		parsedCue.graphic.vcpid.toString() === '' ||
		parsedCue.graphic.vcpid.toString().length === 0
	) {
		context.warning('No valid VCPID provided')
		return
	}

	const engine = parsedCue.target

	if (adlib) {
		adlibPieces.push(makeMosAdlib(context, partId, config, parsedCue, engine, rank))
	} else {
		if (config.showStyle.MakeAdlibsForFulls && !adlib && IsTargetingFull(engine)) {
			adlibPieces.push(makeMosAdlib(context, partId, config, parsedCue, engine, rank))
		}
		pieces.push(
			literal<IBlueprintPiece>({
				externalId: partId,
				name: GraphicDisplayName(config, parsedCue),
				...(IsTargetingFull(engine) || IsTargetingWall(engine)
					? { enable: { start: 0 } }
					: {
							enable: {
								...CreateTimingGrafik(config, parsedCue)
							}
					  }),
				outputLayerId: GetOutputLayer(engine),
				sourceLayerId: GetSourceLayer(engine),
				adlibPreroll: config.studio.PilotPrerollDuration,
				lifespan: GetInfiniteModeForGraphic(engine, config, parsedCue),
				content: GetMosObjContent(context, engine, config, parsedCue, partId)
			})
		)
	}
}

function makeMosAdlib(
	context: NotesContext,
	partId: string,
	config: BlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	engine: GraphicEngine,
	rank?: number
): IBlueprintAdLibPiece {
	const duration = CreateTimingGrafik(config, parsedCue, false).duration
	const lifespan = FindInfiniteModeFromConfig(config, parsedCue)
	const name = GraphicDisplayName(config, parsedCue)
	const sourceLayerId = GetSourceLayer(engine)
	const outputLayerId = GetOutputLayer(engine)
	return {
		_rank: rank || 0,
		externalId: partId,
		name,
		expectedDuration:
			!(parsedCue.end && parsedCue.end.infiniteMode) && lifespan === PieceLifespan.WithinPart && duration
				? duration
				: undefined,
		lifespan,
		uniquenessId: `gfx_${name}_${sourceLayerId}_${outputLayerId}`,
		sourceLayerId,
		outputLayerId,
		adlibPreroll: config.studio.PilotPrerollDuration,
		content: GetMosObjContent(context, engine, config, parsedCue, `${partId}-adlib`, true, rank),
		toBeQueued: IsTargetingFull(engine) || IsTargetingWall(engine)
	}
}

function GetSourceLayer(engine: GraphicEngine): SourceLayer {
	return IsTargetingWall(engine)
		? SourceLayer.WallGraphics
		: IsTargetingTLF(engine)
		? SourceLayer.PgmGraphicsTLF
		: IsTargetingOVL(engine)
		? SourceLayer.PgmPilotOverlay
		: SourceLayer.PgmPilot
}

function GetOutputLayer(engine: GraphicEngine) {
	return IsTargetingWall(engine)
		? 'sec'
		: IsTargetingOVL(engine)
		? 'overlay'
		: IsTargetingFull(engine)
		? 'pgm'
		: 'overlay'
}

function GetMosObjContent(
	context: NotesContext,
	engine: GraphicEngine,
	config: BlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	partId: string,
	adlib?: boolean,
	adlibrank?: number
): GraphicsContent {
	return literal<GraphicsContent>({
		fileName: 'PILOT_' + parsedCue.graphic.vcpid.toString(),
		path: parsedCue.graphic.vcpid.toString(),
		timelineObjects: [
			literal<TSR.TimelineObjVIZMSEElementPilot>({
				id: '',
				enable: IsTargetingOVL(engine)
					? GetEnableForGrafik(config, engine, parsedCue, false)
					: {
							start: 0
					  },
				priority: 1,
				layer: IsTargetingWall(engine)
					? GraphicLLayer.GraphicLLayerWall
					: IsTargetingOVL(engine)
					? GraphicLLayer.GraphicLLayerPilotOverlay
					: GraphicLLayer.GraphicLLayerPilot,
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT,
					templateVcpId: parsedCue.graphic.vcpid,
					continueStep: parsedCue.graphic.continueCount,
					noAutoPreloading: false,
					channelName: engine === 'WALL' ? 'WALL1' : engine === 'OVL' ? 'OVL1' : 'FULL1', // TODO: TranslateEngine
					...(IsTargetingWall(engine) || !config.studio.PreventOverlayWithFull
						? {}
						: {
								delayTakeAfterOutTransition: true,
								outTransition: {
									type: TSR.VIZMSETransitionType.DELAY,
									delay: config.studio.PilotOutTransitionDuration
								}
						  })
				},
				...(IsTargetingFull(engine) ? { classes: ['full'] } : {})
			}),
			...(IsTargetingFull(engine)
				? [
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
										fillSource: config.dsk[1].Fill,
										cutSource: config.dsk[1].Key
									}
								}
							},
							classes: ['MIX_MINUS_OVERRIDE_DSK', 'PLACEHOLDER_OBJECT_REMOVEME']
						}),
						GetSisyfosTimelineObjForCamera(context, config, 'full', SisyfosLLAyer.SisyfosGroupStudioMics),
						...muteSisyfosChannels(partId, config.sources, !!adlib, adlibrank ?? 0, parsedCue.graphic.vcpid)
				  ]
				: [])
		]
	})
}

function muteSisyfosChannels(
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
				.filter(s => s.type === SourceLayerType.LOCAL)
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
