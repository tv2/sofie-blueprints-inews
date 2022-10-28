import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	VTContent,
	WithTimeline
} from 'blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	CreatePartKamBase,
	FindDSKJingle,
	findSourceInfo,
	GetSisyfosTimelineObjForCamera,
	literal,
	PartDefinitionKam,
	PieceMetaData,
	TimeFromINewsField,
	TransitionSettings
} from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { AtemLLayer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartKam(
	context: ISegmentUserContext,
	config: BlueprintConfig,
	partDefinition: PartDefinitionKam,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partKamBase = CreatePartKamBase(context, config, partDefinition, totalWords)

	let part = partKamBase.part.part
	const partTime = partKamBase.duration

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: Array<IBlueprintPiece<PieceMetaData>> = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	const jingleDSK = FindDSKJingle(config)

	if (partDefinition.rawType.match(/kam cs ?3/i)) {
		pieces.push({
			externalId: partDefinition.externalId,
			name: 'CS 3 (JINGLE)',
			enable: { start: 0 },
			outputLayerId: SharedOutputLayers.PGM,
			sourceLayerId: SourceLayer.PgmJingle,
			lifespan: PieceLifespan.WithinPart,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: []
				}
			},
			content: literal<WithTimeline<VTContent>>({
				ignoreMediaObjectStatus: true,
				fileName: '',
				path: '',
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TSR.TimelineObjAtemME>({
						id: ``,
						enable: {
							start: 0
						},
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.ME,
							me: {
								input: jingleDSK.Fill,
								transition: partDefinition.transition ? partDefinition.transition.style : TSR.AtemTransitionStyle.CUT,
								transitionSettings: TransitionSettings(config, partDefinition)
							}
						}
					})
				])
			})
		})
		part.expectedDuration = TimeFromINewsField(partDefinition.fields.totalTime) * 1000
	} else {
		const sourceInfoCam = findSourceInfo(config.sources, partDefinition.sourceDefinition)
		if (sourceInfoCam === undefined) {
			context.notifyUserWarning(`${partDefinition.rawType} does not exist in this studio`)
			return CreatePartInvalid(partDefinition)
		}
		const atemInput = sourceInfoCam.port

		part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

		pieces.push({
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: SharedOutputLayers.PGM,
			sourceLayerId: SourceLayer.PgmCam,
			lifespan: PieceLifespan.WithinPart,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: sourceInfoCam.sisyfosLayers ?? [],
					acceptPersistAudio: sourceInfoCam.acceptPersistAudio
				}
			},
			content: {
				studioLabel: '',
				switcherInput: atemInput,
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TSR.TimelineObjAtemME>({
						id: ``,
						enable: {
							start: 0
						},
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.ME,
							me: {
								input: Number(atemInput),
								transition: partDefinition.transition ? partDefinition.transition.style : TSR.AtemTransitionStyle.CUT,
								transitionSettings: TransitionSettings(config, partDefinition)
							}
						}
					}),
					...GetSisyfosTimelineObjForCamera(config, sourceInfoCam, partDefinition.sourceDefinition.minusMic)
				])
			}
		})
	}

	await EvaluateCues(
		context,
		config,
		part,
		pieces,
		adLibPieces,
		actions,
		mediaSubscriptions,
		partDefinition.cues,
		partDefinition,
		{}
	)
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)

	part.hackListenToMediaObjectUpdates = mediaSubscriptions

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}
