import {
	BlueprintResultPart,
	BlueprintResultSegment,
	CameraContent,
	IBlueprintPiece,
	IngestSegment,
	PieceLifespan,
	SegmentContext,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { getSegmentBase, literal, TransformCuesIntoShowstyle } from 'tv2-common'
import * as _ from 'underscore'
import { OfftubeAtemLLayer } from '../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig, parseConfig } from './helpers/config'
import { OffTubeSourceLayer } from './layers'
import { OfftubeCreatePartDVE } from './parts/OfftubeDVE'
import { OfftubeCreatePartKam } from './parts/OfftubeKam'
import { OfftubeCreatePartServer } from './parts/OfftubeServer'
import { CreatePartUnknown } from './parts/OfftubeUnknown'
import { OfftubeCreatePartVO } from './parts/OfftubeVO'

export function getSegment(context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const result: BlueprintResultSegment = getSegmentBase(context, ingestSegment, {
		parseConfig,
		TransformCuesIntoShowstyle,
		CreatePartContinuity,
		CreatePartUnknown,
		CreatePartKam: OfftubeCreatePartKam,
		CreatePartServer: OfftubeCreatePartServer,
		CreatePartVO: OfftubeCreatePartVO,
		CreatePartDVE: OfftubeCreatePartDVE,
		CreatePartGrafik: CreatePartUnknown,
		CreatePartEVS: CreatePartUnknown,
		CreatePartEkstern: CreatePartUnknown,
		CreatePartIntro: CreatePartUnknown,
		CreatePartTeknik: CreatePartUnknown,
		CreatePartTelefon: CreatePartUnknown
	})

	return {
		segment: result.segment,
		parts: result.parts
	}
}

function CreatePartContinuity(config: OffTubeShowstyleBlueprintConfig, ingestSegment: IngestSegment) {
	return literal<BlueprintResultPart>({
		part: {
			externalId: `${ingestSegment.externalId}-CONTINUITY`,
			title: 'CONTINUITY',
			typeVariant: ''
		},
		pieces: [
			literal<IBlueprintPiece>({
				_id: '',
				externalId: `${ingestSegment.externalId}-CONTINUITY`,
				enable: {
					start: 0
				},
				name: 'CONTINUITY',
				sourceLayerId: OffTubeSourceLayer.PgmContinuity,
				outputLayerId: 'pgm',
				infiniteMode: PieceLifespan.OutOnNextSegment,
				content: literal<CameraContent>({
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
		adLibPieces: []
	})
}
