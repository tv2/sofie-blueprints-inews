import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	PieceLifespan,
	SplitsContent,
	TimelineObjectCoreExt,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionSelectDVE,
	CreateAdlibServer,
	CueDefinitionAdLib,
	CueDefinitionDVE,
	GetDVETemplate,
	literal,
	PartContext2,
	PartDefinition,
	PieceMetaData,
	TemplateIsValid,
	TimelineBlueprintExt
} from 'tv2-common'
import { AdlibActionType, AdlibTags, ControlClasses, CueType, Enablers } from 'tv2-constants'
import _ = require('underscore')
import {
	OfftubeAbstractLLayer,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../../tv2_offtube_studio/layers'
import { OfftubeMakeContentDVE } from '../content/OfftubeDVEContent'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateAdLib(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	adLibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionAdLib,
	partDefinition: PartDefinition,
	rank: number
) {
	if (parsedCue.variant.match(/server/i)) {
		// Create server AdLib
		const file = partDefinition.fields.videoId
		const duration = Number(partDefinition.fields.tapeTime) * 1000 || 0

		const adlibServer = CreateAdlibServer(
			config,
			rank,
			partId,
			`adlib_server_${file}`,
			partDefinition,
			file,
			false,
			{
				Caspar: {
					ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
				},
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
				},
				ATEM: {
					MEPGM: OfftubeAtemLLayer.AtemMEClean
				},
				STICKY_LAYERS: config.stickyLayers,
				PgmServer: OfftubeSourceLayer.SelectedAdLibServer,
				PgmVoiceOver: OfftubeSourceLayer.SelectedAdLibVoiceOver
			},
			duration,
			{
				isOfftube: true,
				tagAsAdlib: true,
				enabler: Enablers.OFFTUBE_ENABLE_SERVER,
				serverEnable: OfftubeAbstractLLayer.OfftubeAbstractLLayerServerEnable
			}
		)
		adlibServer.toBeQueued = true
		adlibServer.canCombineQueue = true
		adlibServer.outputLayerId = 'selectedAdlib'
		adlibServer.tags = [AdlibTags.OFFTUBE_ADLIB_SERVER, AdlibTags.ADLIB_KOMMENTATOR]
		// TODO: This should happen in above function
		// TODO: This breaks infinites
		// adlibServer.expectedDuration = duration

		// HACK: Replace with adlib action
		adlibServer.additionalPieces = [
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: 'setNextToServer',
				name: 'Server',
				sourceLayerId: OfftubeSourceLayer.PgmServer,
				outputLayerId: OfftubeOutputLayers.PGM,
				infiniteMode: PieceLifespan.OutOnNextPart,
				toBeQueued: true,
				canCombineQueue: true,
				content: {
					timelineObjects: [
						literal<TSR.TimelineObjAbstractAny>({
							id: 'serverProgramEnabler',
							enable: {
								while: '1'
							},
							priority: 1,
							layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
							content: {
								deviceType: TSR.DeviceType.ABSTRACT
							},
							classes: [Enablers.OFFTUBE_ENABLE_SERVER]
						}),
						literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
							id: '',
							enable: { start: 0 },
							priority: 0,
							layer: OfftubeAtemLLayer.AtemMENext,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									previewInput: undefined
								}
							},
							metaData: {
								context: `Lookahead-lookahead for serverProgramEnabler`
							},
							classes: [
								'ab_on_preview',
								ControlClasses.CopyMediaPlayerSession,
								Enablers.OFFTUBE_ENABLE_SERVER_LOOKAHEAD
							]
						})
					]
				},
				tags: [AdlibTags.OFFTUBE_SET_SERVER_NEXT]
			})
		]

		adLibPieces.push(adlibServer)

		const adlibFlowProducer = CreateAdlibServer(
			config,
			rank,
			partId,
			`adlib_server_${file}`,
			partDefinition,
			file,
			false,
			{
				Caspar: {
					ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
				},
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
				},
				ATEM: {
					MEPGM: OfftubeAtemLLayer.AtemMEClean
				},
				STICKY_LAYERS: config.stickyLayers,
				PgmServer: OfftubeSourceLayer.PgmServer,
				PgmVoiceOver: OfftubeSourceLayer.PgmVoiceOver
			},
			duration
		)
		adlibFlowProducer.toBeQueued = true
		adlibFlowProducer.canCombineQueue = true
		adlibFlowProducer.tags = [AdlibTags.ADLIB_FLOW_PRODUCER]
		// TODO: This should happen in above function
		adlibFlowProducer.expectedDuration = duration

		adLibPieces.push(adlibFlowProducer)
	} else {
		// DVE
		if (!parsedCue.variant) {
			return
		}

		const rawTemplate = GetDVETemplate(config.showStyle.DVEStyles, parsedCue.variant)
		if (!rawTemplate) {
			context.warning(`Could not find template ${parsedCue.variant}`)
			return
		}

		if (!TemplateIsValid(JSON.parse(rawTemplate.DVEJSON as string))) {
			context.warning(`Invalid DVE template ${parsedCue.variant}`)
			return
		}

		const cueDVE: CueDefinitionDVE = {
			type: CueType.DVE,
			template: parsedCue.variant,
			sources: parsedCue.inputs ? parsedCue.inputs : {},
			labels: parsedCue.bynavn ? [parsedCue.bynavn] : [],
			iNewsCommand: 'DVE'
		}

		const adlibContent = OfftubeMakeContentDVE(context, config, partDefinition, cueDVE, rawTemplate, false, true)

		let sticky: { [key: string]: { value: number; followsPrevious: boolean } } = {}

		adlibContent.stickyLayers.forEach(layer => {
			sticky = {
				...sticky,
				[layer]: {
					value: 1,
					followsPrevious: false
				}
			}
		})

		actions.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.SELECT_DVE,
				userData: literal<ActionSelectDVE>({
					type: AdlibActionType.SELECT_DVE,
					config: cueDVE,
					part: partDefinition
				}),
				userDataManifest: {},
				display: {
					sourceLayerId: OfftubeSourceLayer.PgmDVE,
					outputLayerId: OfftubeOutputLayers.PGM,
					label: `${partDefinition.storyName} Action`,
					tags: [AdlibTags.ADLIB_KOMMENTATOR],
					content: literal<SplitsContent>({
						...adlibContent.content,
						timelineObjects: []
					})
				}
			})
		)

		adLibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank,
				externalId: partId,
				name: `DVE: ${parsedCue.variant}`,
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				outputLayerId: 'pgm',
				toBeQueued: true,
				content: {
					...adlibContent.content,
					timelineObjects: makeofftubeDVEIDsUniqueForFlow(adlibContent.content.timelineObjects)
				},
				invalid: !adlibContent.valid,
				tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
				metaData: literal<PieceMetaData>({
					stickySisyfosLevels: sticky
				})
			})
		)
	}
}

export function makeofftubeDVEIDsUniqueForFlow(timeline: TimelineObjectCoreExt[]): TimelineObjectCoreExt[] {
	const startIdObj = timeline.find(tlObj => tlObj.layer === OfftubeAtemLLayer.AtemSSrcDefault)

	if (!startIdObj) {
		return timeline
	}

	const startId = startIdObj.id

	if (!startId.length) {
		return timeline
	}

	const newId = `${startId}_flow`

	return timeline.map(tlObj => {
		const enable = _.clone(tlObj.enable)

		if (enable.start && typeof enable.start === 'string') {
			enable.start = enable.start.replace(startId, newId)
		}

		return {
			...tlObj,
			id: tlObj.id.replace(startId, newId),
			enable
		}
	})
}
