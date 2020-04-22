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
import { StudioConfig } from '../tv2_afvd_studio/helpers/config'
import { AtemLLayer } from '../tv2_afvd_studio/layers'
import { BlueprintConfig as ShowStyleConfig, parseConfig } from './helpers/config'
import { SourceLayer } from './layers'
import { CreatePartEVS } from './parts/evs'
import { CreatePartGrafik } from './parts/grafik'
import { CreatePartIntro } from './parts/intro'
import { CreatePartKam } from './parts/kam'
import { CreatePartServer } from './parts/server'
import { CreatePartTeknik } from './parts/teknik'
import { CreatePartUnknown } from './parts/unknown'
import { CreatePartVO } from './parts/vo'
import { postProcessPartTimelineObjects } from './postProcessTimelineObjects'
export function getSegment(context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const config = parseConfig(context)

	const result: BlueprintResultSegment = getSegmentBase<StudioConfig, ShowStyleConfig>(context, ingestSegment, {
		parseConfig,
		TransformCuesIntoShowstyle,
		CreatePartContinuity,
		CreatePartUnknown,
		CreatePartIntro,
		CreatePartKam,
		CreatePartServer,
		CreatePartEVS,
		CreatePartGrafik,
		CreatePartEkstern: CreatePartUnknown,
		CreatePartTeknik,
		CreatePartDVE: CreatePartUnknown,
		CreatePartTelefon: CreatePartUnknown,
		CreatePartVO
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
				sourceLayerId: SourceLayer.PgmContinuity,
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
		adLibPieces: []
	})
}
