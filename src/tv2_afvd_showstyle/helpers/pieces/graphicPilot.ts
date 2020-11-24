import { SourceLayer } from '../../layers'
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
	CueDefinitionGraphic,
	FindInfiniteModeFromConfig,
	GetInfiniteModeForGraphic,
	GetSisyfosTimelineObjForCamera,
	GraphicDisplayName,
	GraphicLLayer,
	GraphicPilot,
	literal,
	PartContext2,
	SisyfosEVSSource,
	SourceInfo
} from 'tv2-common'
import { GraphicEngine } from 'tv2-constants'
import { BlueprintConfig } from '../config'
import { CreateTimingGrafik, GetEnableForGrafik } from './graphic'
import { AtemLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'

export function EvaluateCueGraphicPilot(
	config: BlueprintConfig,
	context: PartContext2,
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
		if (config.showStyle.MakeAdlibsForFulls && !adlib && (engine === 'FULL' || engine === 'TLF')) {
			adlibPieces.push(makeMosAdlib(context, partId, config, parsedCue, engine, rank))
		}
		pieces.push(
			literal<IBlueprintPiece>({
				externalId: partId,
				name: GraphicDisplayName(config, parsedCue),
				...(engine === 'TLF' || engine === 'WALL' || engine === 'FULL'
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
	return {
		_rank: rank || 0,
		externalId: partId,
		name: GraphicDisplayName(config, parsedCue),
		expectedDuration:
			!(parsedCue.end && parsedCue.end.infiniteMode) && lifespan === PieceLifespan.WithinPart && duration
				? duration
				: undefined,
		lifespan,
		sourceLayerId: GetSourceLayer(engine),
		outputLayerId: GetOutputLayer(engine),
		adlibPreroll: config.studio.PilotPrerollDuration,
		content: GetMosObjContent(context, engine, config, parsedCue, `${partId}-adlib`, true, rank),
		toBeQueued: engine === 'FULL' || engine === 'WALL'
	}
}

function GetSourceLayer(engine: GraphicEngine): SourceLayer {
	return engine === 'WALL'
		? SourceLayer.WallGraphics
		: engine === 'TLF'
		? SourceLayer.PgmGraphicsTLF
		: engine === 'OVL'
		? SourceLayer.PgmPilotOverlay
		: SourceLayer.PgmPilot
}

function GetOutputLayer(engine: GraphicEngine) {
	return engine === 'WALL'
		? 'sec'
		: engine === 'OVL'
		? 'overlay'
		: engine === 'FULL' || engine === 'TLF'
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
				enable:
					engine === 'OVL'
						? GetEnableForGrafik(config, engine, parsedCue, false)
						: {
								start: 0
						  },
				priority: 1,
				layer:
					engine === 'WALL'
						? GraphicLLayer.GraphicLLayerWall
						: engine === 'OVL'
						? GraphicLLayer.GraphicLLayerPilotOverlay
						: GraphicLLayer.GraphicLLayerPilot,
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT,
					templateVcpId: parsedCue.graphic.vcpid,
					continueStep: parsedCue.graphic.continueCount,
					noAutoPreloading: false,
					channelName: engine === 'WALL' ? 'WALL1' : engine === 'OVL' ? 'OVL1' : 'FULL1', // TODO: TranslateEngine
					...(engine === 'WALL' || !config.studio.PreventOverlayWithFull
						? {}
						: {
								delayTakeAfterOutTransition: true,
								outTransition: {
									type: TSR.VIZMSETransitionType.DELAY,
									delay: config.studio.PilotOutTransitionDuration
								}
						  })
				},
				...(engine === 'OVL' || engine === 'WALL' ? {} : { classes: ['full'] }) // TODO: !IsTargetingFull
			}),
			...(engine === 'OVL' || engine === 'WALL' // TODO: !IsTargetingFull
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
						GetSisyfosTimelineObjForCamera(context, config, 'full', SisyfosLLAyer.SisyfosGroupStudioMics),
						...muteSisyfosChannels(partId, config.sources, !!adlib, adlibrank ?? 0, parsedCue.graphic.vcpid)
				  ])
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
