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
import { getSegmentBase, literal, SegmentContext, SegmentContextImpl, TransitionStyle } from 'tv2-common'
import { SharedOutputLayer } from 'tv2-constants'
import * as _ from 'underscore'
import { GALLERY_UNIFORM_CONFIG } from '../tv2_afvd_studio/uniformConfig'
import { GalleryBlueprintConfig } from './helpers/config'
import { SourceLayer } from './layers'
import { CreatePartEVS } from './parts/evs'
import { CreatePartGrafik } from './parts/grafik'
import { CreatePartIntro } from './parts/intro'
import { CreatePartKam } from './parts/kam'
import { CreatePartLive } from './parts/live'
import { CreatePartServer } from './parts/server'
import { CreatePartTeknik } from './parts/teknik'
import { CreatePartUnknown } from './parts/unknown'

export async function getSegment(
	coreContext: ISegmentUserContext,
	ingestSegment: IngestSegment
): Promise<BlueprintResultSegment> {
	const context = new SegmentContextImpl<GalleryBlueprintConfig>(coreContext, GALLERY_UNIFORM_CONFIG)

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

	return {
		segment: result.segment,
		parts: blueprintParts
	}
}

export function CreatePartContinuity(
	context: SegmentContext<GalleryBlueprintConfig>,
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
				outputLayerId: SharedOutputLayer.PGM,
				lifespan: PieceLifespan.WithinPart,
				content: literal<WithTimeline<CameraContent>>({
					studioLabel: '',
					switcherInput: context.config.studio.SwitcherSource.Continuity,
					timelineObjects: [
						...context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
							priority: 1,
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
