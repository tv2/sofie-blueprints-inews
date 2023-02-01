import {
	BlueprintResultPart,
	BlueprintResultSegment,
	CameraContent,
	IngestSegment,
	ISegmentUserContext,
	PieceLifespan,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import { ExtendedSegmentContextImpl, getSegmentBase, literal } from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import * as _ from 'underscore'
import { OfftubeAtemLLayer } from '../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from './helpers/config'
import { OfftubeSourceLayer } from './layers'
import { OfftubeCreatePartDVE } from './parts/OfftubeDVE'
import { OfftubeCreatePartGrafik } from './parts/OfftubeGrafik'
import { OfftubeCreatePartKam } from './parts/OfftubeKam'
import { OfftubeCreatePartServer } from './parts/OfftubeServer'
import { CreatePartUnknown } from './parts/OfftubeUnknown'
import { postProcessPartTimelineObjects } from './postProcessTimelineObjects'

export async function getSegment(
	coreContext: ISegmentUserContext,
	ingestSegment: IngestSegment
): Promise<BlueprintResultSegment> {
	const context = new ExtendedSegmentContextImpl<OfftubeBlueprintConfig>(coreContext)

	const result: BlueprintResultSegment = await getSegmentBase(context, ingestSegment, {
		CreatePartContinuity,
		CreatePartUnknown,
		CreatePartKam: OfftubeCreatePartKam,
		CreatePartServer: OfftubeCreatePartServer,
		CreatePartDVE: OfftubeCreatePartDVE,
		CreatePartGrafik: OfftubeCreatePartGrafik,
		CreatePartEVS: CreatePartUnknown,
		CreatePartEkstern: CreatePartUnknown,
		CreatePartIntro: CreatePartUnknown,
		CreatePartTeknik: CreatePartUnknown,
		CreatePartTelefon: CreatePartUnknown
	})

	const blueprintParts = result.parts

	postProcessPartTimelineObjects(context, blueprintParts)

	return {
		segment: result.segment,
		parts: blueprintParts
	}
}

function CreatePartContinuity(config: OfftubeBlueprintConfig, ingestSegment: IngestSegment): BlueprintResultPart {
	return {
		part: {
			externalId: `${ingestSegment.externalId}-CONTINUITY`,
			title: 'CONTINUITY',
			untimed: true
		},
		pieces: [
			{
				externalId: `${ingestSegment.externalId}-CONTINUITY`,
				enable: {
					start: 0
				},
				name: 'CONTINUITY',
				sourceLayerId: OfftubeSourceLayer.PgmContinuity,
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
							layer: OfftubeAtemLLayer.AtemMEClean,
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
			}
		],
		adLibPieces: [],
		actions: []
	}
}
