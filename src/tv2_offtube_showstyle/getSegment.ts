import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineObjAtemAny,
	TimelineObjAtemME
} from 'timeline-state-resolver-types'
import {
	BlueprintResultPart,
	BlueprintResultSegment,
	CameraContent,
	IBlueprintPiece,
	IBlueprintRundownDB,
	IngestSegment,
	PartContext,
	PieceLifespan,
	SegmentContext
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
		segment: !!ingestSegment.name.match(/^klar on[- ]?air/i) ? result.segment : { ...result.segment, isHidden: true },
		parts: result.parts
	}
}

export class PartContext2 implements PartContext {
	public readonly rundownId: string
	public readonly rundown: IBlueprintRundownDB
	private baseContext: SegmentContext
	private externalId: string

	constructor(baseContext: SegmentContext, externalId: string) {
		this.baseContext = baseContext
		this.externalId = externalId

		this.rundownId = baseContext.rundownId
		this.rundown = baseContext.rundown
	}

	/** PartContext */
	public getRuntimeArguments() {
		return this.baseContext.getRuntimeArguments(this.externalId) || {}
	}

	/** IShowStyleConfigContext */
	public getShowStyleConfig() {
		return this.baseContext.getShowStyleConfig()
	}
	public getShowStyleConfigRef(configKey: string) {
		return this.baseContext.getShowStyleConfigRef(configKey)
	}

	/** IStudioContext */
	public getStudioMappings() {
		return this.baseContext.getStudioMappings()
	}

	/** IStudioConfigContext */
	public getStudioConfig() {
		return this.baseContext.getStudioConfig()
	}
	public getStudioConfigRef(configKey: string) {
		return this.baseContext.getStudioConfigRef(configKey)
	}

	/** NotesContext */
	public error(message: string) {
		return this.baseContext.error(message)
	}
	public warning(message: string) {
		return this.baseContext.warning(message)
	}
	public getNotes() {
		return this.baseContext.getNotes()
	}

	/** ICommonContext */
	public getHashId(originString: string, originIsNotUnique?: boolean) {
		return this.baseContext.getHashId(`${this.externalId}_${originString}`, originIsNotUnique)
	}
	public unhashId(hash: string) {
		return this.baseContext.unhashId(hash)
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
					timelineObjects: _.compact<TimelineObjAtemAny>([
						literal<TimelineObjAtemME>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: OfftubeAtemLLayer.AtemMEClean,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									input: config.studio.AtemSource.Continuity,
									transition: AtemTransitionStyle.CUT
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
