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
import { getSegmentBase, literal } from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import * as _ from 'underscore'
import { OfftubeAtemLLayer } from '../tv2_offtube_studio/layers'
import { getConfig, OfftubeShowstyleBlueprintConfig } from './helpers/config'
import { OfftubeSourceLayer } from './layers'
import { OfftubeCreatePartDVE } from './parts/OfftubeDVE'
import { OfftubeCreatePartGrafik } from './parts/OfftubeGrafik'
import { OfftubeCreatePartKam } from './parts/OfftubeKam'
import { OfftubeCreatePartServer } from './parts/OfftubeServer'
import { CreatePartUnknown } from './parts/OfftubeUnknown'
import { postProcessPartTimelineObjects } from './postProcessTimelineObjects'

export function getSegment(context: ISegmentUserContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const config = getConfig(context)

	const result: BlueprintResultSegment = getSegmentBase(context, ingestSegment, {
		getConfig,
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

	postProcessPartTimelineObjects(context, config, blueprintParts)

	return {
		segment: result.segment,
		parts: blueprintParts
	}
}

function CreatePartContinuity(config: OfftubeShowstyleBlueprintConfig, ingestSegment: IngestSegment) {
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
				sourceLayerId: OfftubeSourceLayer.PgmContinuity,
				outputLayerId: SharedOutputLayers.PGM,
				lifespan: PieceLifespan.WithinPart,
				content: literal<WithTimeline<CameraContent>>({
					studioLabel: '',
					switcherInput: config.studio.AtemSource.Continuity,
					timelineObjects: _.compact<TSR.TimelineObjAtemAny>([
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
			})
		],
		adLibPieces: [],
		actions: []
	})
}
