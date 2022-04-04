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
import { StudioConfig } from '../tv2_afvd_studio/helpers/config'
import { AtemLLayer } from '../tv2_afvd_studio/layers'
import { BlueprintConfig as ShowStyleConfig, getConfig } from './helpers/config'
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
export function getSegment(context: ISegmentUserContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const config = getConfig(context)

	const result: BlueprintResultSegment = getSegmentBase<StudioConfig, ShowStyleConfig>(context, ingestSegment, {
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
					timelineObjects: _.compact<TSR.TimelineObjAtemAny>([
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
