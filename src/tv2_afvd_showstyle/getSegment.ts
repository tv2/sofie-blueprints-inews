import {
	BlueprintResultPart,
	BlueprintResultSegment,
	CameraContent,
	IBlueprintPiece,
	IngestSegment,
	ISegmentUserContext,
	PieceLifespan,
	TSR,
	WithTimeline
} from '@tv2media/blueprints-integration'
import { getSegmentBase, INewsPayload, literal } from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import * as _ from 'underscore'
import { StudioConfig } from '../tv2_afvd_studio/helpers/config'
import { AtemLLayer } from '../tv2_afvd_studio/layers'
import { BlueprintConfig as ShowStyleConfig, getConfig } from './helpers/config'
import { CreateShowLifecyclePieces } from './helpers/pieces/showLifecycle'
import { SourceLayer } from './layers'
import { CreatePartEVS } from './parts/evs'
import { CreatePartGrafik } from './parts/grafik'
import { CreatePartIntro } from './parts/intro'
import { CreatePartKam } from './parts/kam'
import { CreatePartLive } from './parts/live'
import { CreatePartServer } from './parts/server'
import { CreatePartTeknik } from './parts/teknik'
import { CreatePartUnknown } from './parts/unknown'
import { postProcessPartTimelineObjects } from './postProcessTimelineObjects'
export async function getSegment(
	context: ISegmentUserContext,
	ingestSegment: IngestSegment
): Promise<BlueprintResultSegment> {
	const config = getConfig(context)
	const segmentPayload = ingestSegment.payload as INewsPayload | undefined

	const result: BlueprintResultSegment = await getSegmentBase<StudioConfig, ShowStyleConfig>(context, ingestSegment, {
		getConfig,
		CreatePartContinuity,
		CreatePartUnknown,
		CreatePartIntro,
		CreatePartKam,
		CreatePartServer,
		CreatePartEVS,
		CreatePartGrafik,
		CreatePartEkstern: CreatePartLive,
		CreatePartTeknik,
		CreatePartDVE: CreatePartUnknown,
		CreatePartTelefon: CreatePartUnknown
	})

	const blueprintParts = result.parts

	if (segmentPayload) {
		insertSpecialPieces(config, blueprintParts, segmentPayload)
	}

	postProcessPartTimelineObjects(context, config, blueprintParts)

	return {
		segment: result.segment,
		parts: blueprintParts
	}
}

export function CreatePartContinuity(config: ShowStyleConfig, ingestSegment: IngestSegment) {
	return literal<BlueprintResultPart>({
		part: {
			externalId: `${ingestSegment.externalId}-CONTINUITY`,
			title: 'CONTINUITY',
			untimed: true
		},
		pieces: [
			literal<IBlueprintPiece>({
				externalId: `${ingestSegment.externalId}-CONTINUITY`,
				enable: {
					start: 0
				},
				name: 'CONTINUITY',
				sourceLayerId: SourceLayer.PgmContinuity,
				outputLayerId: SharedOutputLayers.PGM,
				lifespan: PieceLifespan.WithinPart,
				content: literal<WithTimeline<CameraContent>>({
					studioLabel: '',
					switcherInput: config.studio.AtemSource.Continuity,
					timelineObjects: _.compact<TSR.TimelineObjAtemAny[]>([
						literal<TSR.TimelineObjAtemME>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									input: config.studio.AtemSource.Continuity,
									transition: TSR.AtemTransitionStyle.CUT
								}
							}
						})
					])
				})
			})
		],
		adLibPieces: [],
		actions: []
	})
}

function insertSpecialPieces(
	config: ShowStyleConfig,
	blueprintParts: BlueprintResultPart[],
	segmentPayload: INewsPayload
) {
	// Insert cue-independent pieces

	if (!blueprintParts.length || config.studio.GraphicsType !== 'VIZ') {
		return
	}

	const graphicsSetupsToInitialize = segmentPayload?.initializeShows
	if (graphicsSetupsToInitialize) {
		const showsToInitialize = new Set<string>()
		const allShows = new Set<string>()
		config.showStyle.GraphicsSetups.forEach(graphicsSetup => {
			allShows.add(graphicsSetup.FullShowId)
			allShows.add(graphicsSetup.OvlShowId)
			if (graphicsSetupsToInitialize.includes(graphicsSetup.INewsCode)) {
				showsToInitialize.add(graphicsSetup.FullShowId)
				showsToInitialize.add(graphicsSetup.OvlShowId)
			}
		})
		const showsToCleanup = Array.from(allShows).filter(show => !showsToInitialize.has(show))
		CreateShowLifecyclePieces(config, blueprintParts[0], Array.from(showsToInitialize), showsToCleanup)
	}
}
