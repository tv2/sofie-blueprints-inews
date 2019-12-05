import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeVizMSE,
	TimelineObjAtemME,
	TimelineObjVIZMSEAny,
	TimelineObjVIZMSEElementPilot
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
import { AtemLLayer, VizLLayer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'
import { InfiniteMode } from './evaluateCues'
import { CreateTimingGrafik, GetGrafikDuration, grafikName } from './grafik'

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
	isGrafikPart?: boolean
) {
	if (parsedCue.vcpid === undefined || parsedCue.vcpid === null || parsedCue.vcpid.toString() === '') {
		context.warning('No valid VCPID provided')
	}

	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: grafikName(config, parsedCue),
				...(isTlf || isGrafikPart ? {} : { expectedDuration: GetGrafikDuration(config, parsedCue) }),
				infiniteMode:
					isTlf || isGrafikPart
						? PieceLifespan.OutOnNextPart
						: parsedCue.end && parsedCue.end.infiniteMode
						? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
						: PieceLifespan.Normal,
				sourceLayerId: isTlf
					? SourceLayer.PgmGraphicsTLF
					: parsedCue.name.match(/MOSART=L/i)
					? SourceLayer.PgmPilotOverlay
					: SourceLayer.PgmPilot,
				outputLayerId: isTlf || isGrafikPart ? 'pgm' : 'overlay',
				adlibPreroll: config.studio.PilotPrerollDuration,
				content: literal<GraphicsContent>({
					fileName: parsedCue.name,
					path: parsedCue.vcpid.toString(),
					timelineObjects: [
						literal<TimelineObjVIZMSEElementPilot>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: VizLLayer.VizLLayerPilot,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_PILOT,
								templateVcpId: parsedCue.vcpid,
								continueStep: parsedCue.continueCount,
								noAutoPreloading: false,
								channelName: parsedCue.name.match(/MOSART=L/i) ? undefined : 'FULL1'
							}
						}),
						literal<TimelineObjAtemME>({
							id: '',
							enable: {
								start: config.studio.PilotKeepaliveDuration
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
							}
						})
					]
				})
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
				outputLayerId: isTlf || isGrafikPart ? 'pgm' : 'overlay',
				sourceLayerId: isTlf
					? SourceLayer.PgmGraphicsTLF
					: parsedCue.name.match(/MOSART=L/i)
					? SourceLayer.PgmPilotOverlay
					: SourceLayer.PgmPilot,
				adlibPreroll: config.studio.PilotPrerollDuration,
				infiniteMode:
					isTlf || isGrafikPart
						? PieceLifespan.OutOnNextPart
						: parsedCue.end && parsedCue.end.infiniteMode
						? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
						: PieceLifespan.Normal,
				content: literal<GraphicsContent>({
					fileName: parsedCue.name,
					path: parsedCue.vcpid.toString(),
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementPilot>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: VizLLayer.VizLLayerPilot,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_PILOT,
								templateVcpId: parsedCue.vcpid,
								continueStep: parsedCue.continueCount,
								noAutoPreloading: false,
								channelName: parsedCue.name.match(/MOSART=L/i) ? undefined : 'FULL1'
							}
						})
					])
				})
			})
		)
	}
}
