import {
	BlueprintResultPart,
	BlueprintResultSegment,
	CameraContent,
	IBlueprintPiece,
	IngestSegment,
	ISegmentUserContext,
	PieceLifespan,
	WithTimeline
} from 'blueprints-integration'
import {
	ExtendedSegmentContext,
	ExtendedSegmentContextImpl,
	getSegmentBase,
	INewsPayload,
	literal,
	TransitionStyle
} from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import * as _ from 'underscore'
import { AtemLLayer } from '../tv2_afvd_studio/layers'
import { GalleryBlueprintConfig } from './helpers/config'
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
	coreContext: ISegmentUserContext,
	ingestSegment: IngestSegment
): Promise<BlueprintResultSegment> {
	const segmentPayload = ingestSegment.payload as INewsPayload | undefined
	const context = new ExtendedSegmentContextImpl<GalleryBlueprintConfig>(coreContext)

	const result: BlueprintResultSegment = await getSegmentBase<GalleryBlueprintConfig>(context, ingestSegment, {
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
		insertSpecialPieces(context.config, blueprintParts, segmentPayload)
	}

	postProcessPartTimelineObjects(context, blueprintParts)

	return {
		segment: result.segment,
		parts: blueprintParts
	}
}

export function CreatePartContinuity(
	context: ExtendedSegmentContext<GalleryBlueprintConfig>,
	ingestSegment: IngestSegment
): BlueprintResultPart {
	return {
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
					switcherInput: context.config.studio.SwitcherSource.Continuity,
					timelineObjects: [
						context.videoSwitcher.getMixEffectTimelineObject({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								input: context.config.studio.SwitcherSource.Continuity,
								transition: TransitionStyle.CUT
							}
						})
					]
				})
			})
		],
		adLibPieces: [],
		actions: []
	}
}

function insertSpecialPieces(
	config: GalleryBlueprintConfig,
	blueprintParts: BlueprintResultPart[],
	segmentPayload: INewsPayload
) {
	// Insert cue-independent pieces

	if (!blueprintParts.length || config.studio.GraphicsType !== 'VIZ') {
		return
	}

	const gfxSetupsToInitialize = segmentPayload?.initializeShows
	if (gfxSetupsToInitialize) {
		const showsToInitialize = new Set<string>()
		const allShows = new Set<string>()
		config.showStyle.GfxSetups.forEach(gfxSetup => {
			allShows.add(gfxSetup.FullShowName)
			allShows.add(gfxSetup.OvlShowName)
			if (gfxSetupsToInitialize.includes(gfxSetup.Name)) {
				showsToInitialize.add(gfxSetup.FullShowName)
				showsToInitialize.add(gfxSetup.OvlShowName)
			}
		})
		const showsToCleanup = Array.from(allShows).filter(show => !showsToInitialize.has(show))
		CreateShowLifecyclePieces(config, blueprintParts[0], Array.from(showsToInitialize), showsToCleanup)
	}
}
