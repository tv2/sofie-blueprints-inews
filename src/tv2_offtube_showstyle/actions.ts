import {
	ActionExecutionContext,
	ActionUserData,
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintPieceInstance,
	PieceLifespan,
	PieceMetaData,
	SourceLayerType,
	SplitsContent,
	SplitsContentBoxContent,
	SplitsContentBoxProperties,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionCutSourceToBox,
	ActionCutToCamera,
	ActionCutToRemote,
	ActionSelectServerClip,
	CreatePartServerBase,
	DVEBoxInfo,
	FindSourceInfoStrict,
	GetCameraMetaData,
	GetEksternMetaData,
	GetLayersForCamera,
	GetLayersForEkstern,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	literal,
	MakeContentServer,
	TimelineBlueprintExt
} from 'tv2-common'
import { AdlibActionType } from 'tv2-constants'
import _ = require('underscore')
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../tv2_offtube_studio/layers'
import { parseConfig } from './helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from './layers'

export function executeAction(context: ActionExecutionContext, actionId: string, userData: ActionUserData): void {
	switch (actionId) {
		case AdlibActionType.SELECT_SERVER_CLIP:
			executeActionSelectServerClip(context, actionId, userData as ActionSelectServerClip)
			break
		case AdlibActionType.CUT_TO_CAMERA:
			executeActionCutToCamera(context, actionId, userData as ActionCutToCamera)
			break
		case AdlibActionType.CUT_TO_REMOTE:
			executeActionCutToRemote(context, actionId, userData as ActionCutToRemote)
			break
		case AdlibActionType.CUT_SOURCE_TO_BOX:
			executeActionCutSourceToBox(context, actionId, userData as ActionCutSourceToBox)
			break
	}
}

function executeActionSelectServerClip(
	context: ActionExecutionContext,
	_actionId: string,
	userData: ActionSelectServerClip
) {
	const file = userData.file
	const partDefinition = userData.partDefinition
	const duration = userData.duration
	const config = parseConfig(context)

	const externalId = `adlib-action_${context.getHashId(`select_server_clip_${file}`)}`

	const part = CreatePartServerBase(context, config, partDefinition)
	context.queuePart(part.part.part, [
		literal<IBlueprintPiece>({
			_id: '',
			externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: OfftubeOutputLayers.PGM,
			sourceLayerId: OfftubeSourceLayer.PgmServer,
			infiniteMode: PieceLifespan.OutOnNextPart,
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [externalId]
			}),
			content: MakeContentServer(
				file,
				externalId,
				partDefinition,
				config,
				{
					Caspar: {
						ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
					},
					Sisyfos: {
						ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
					},
					ATEM: {
						MEPGM: OfftubeAtemLLayer.AtemMEClean
					}
				},
				duration
			),
			adlibPreroll: config.studio.CasparPrerollDuration
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: `${externalId}_dataStore`,
			name: file,
			enable: {
				start: 0
			},
			outputLayerId: OfftubeOutputLayers.SELECTED_ADLIB,
			sourceLayerId: OfftubeSourceLayer.SelectedAdLibServer,
			infiniteMode: PieceLifespan.OutOnNextSegment,
			metaData: {
				userData
			}
		})
	])
}

function executeActionCutToCamera(context: ActionExecutionContext, _actionId: string, userData: ActionCutToCamera) {
	const config = parseConfig(context)

	const externalId = `adlib-action_${context.getHashId(`cut_to_kam_${userData.name}`)}`

	const part = literal<IBlueprintPart>({
		externalId,
		title: `Kamera ${userData.name}`,
		metaData: {},
		expectedDuration: 0
	})

	const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, `Kam ${userData.name}`)
	if (sourceInfoCam === undefined) {
		return
	}
	const atemInput = sourceInfoCam.port

	const camSisyfos = GetSisyfosTimelineObjForCamera(context, config, `Kamera ${userData.name}`)

	const kamPiece = literal<IBlueprintPiece>({
		_id: '',
		externalId,
		name: part.title,
		enable: { start: 0 },
		outputLayerId: 'pgm',
		sourceLayerId: OfftubeSourceLayer.PgmCam,
		infiniteMode: PieceLifespan.OutOnNextPart,
		metaData: GetCameraMetaData(config, GetLayersForCamera(config, sourceInfoCam)),
		content: {
			studioLabel: '',
			switcherInput: atemInput,
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
				literal<TSR.TimelineObjAtemME>({
					id: '',
					enable: { while: '1' },
					priority: 1,
					layer: OfftubeAtemLLayer.AtemMEClean,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: atemInput,
							transition: TSR.AtemTransitionStyle.CUT
						}
					},
					classes: ['adlib_deparent']
				}),
				...camSisyfos,
				...config.stickyLayers
					.filter(layer => camSisyfos.map(obj => obj.layer).indexOf(layer) === -1)
					.map<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>(layer => {
						return literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNEL,
								isPgm: 0
							},
							metaData: {
								sisyfosPersistLevel: true
							}
						})
					}),
				// Force server to be muted (for adlibbing over DVE)
				...[
					OfftubeSisyfosLLayer.SisyfosSourceClipPending,
					OfftubeSisyfosLLayer.SisyfosSourceServerA,
					OfftubeSisyfosLLayer.SisyfosSourceServerB
				].map<TSR.TimelineObjSisyfosChannel>(layer => {
					return literal<TSR.TimelineObjSisyfosChannel>({
						id: '',
						enable: {
							start: 0
						},
						priority: 2,
						layer,
						content: {
							deviceType: TSR.DeviceType.SISYFOS,
							type: TSR.TimelineContentTypeSisyfos.CHANNEL,
							isPgm: 0
						}
					})
				})
			])
		}
	})

	if (userData.queue) {
		context.queuePart(part, [kamPiece])
	} else {
		context.insertPiece('current', kamPiece)
	}
}

function executeActionCutToRemote(context: ActionExecutionContext, _actionId: string, userData: ActionCutToRemote) {
	const config = parseConfig(context)

	const externalId = `adlib-action_${context.getHashId(`cut_to_remote_${userData.name}`)}`

	const part = literal<IBlueprintPart>({
		externalId,
		title: `Live ${userData.name}`,
		metaData: {},
		expectedDuration: 0
	})

	const eksternSisyfos: TSR.TimelineObjSisyfosAny[] = [
		...GetSisyfosTimelineObjForEkstern(context, config.sources, `Live ${userData.name}`, GetLayersForEkstern),
		...GetSisyfosTimelineObjForCamera(context, config, 'telefon')
	]

	const remotePiece = literal<IBlueprintPiece>({
		_id: '',
		externalId: 'live',
		name: `Live ${userData.name}`,
		enable: {
			start: 0
		},
		sourceLayerId: OfftubeSourceLayer.PgmLive,
		outputLayerId: OfftubeOutputLayers.PGM,
		infiniteMode: PieceLifespan.OutOnNextPart,
		toBeQueued: true,
		canCombineQueue: true,
		metaData: GetEksternMetaData(
			config.stickyLayers,
			config.studio.StudioMics,
			GetLayersForEkstern(context, config.sources, `Live ${userData.name}`)
		),
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
				literal<TSR.TimelineObjAtemME>({
					id: '',
					enable: { while: '1' },
					priority: 1,
					layer: OfftubeAtemLLayer.AtemMEClean,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: userData.port,
							transition: TSR.AtemTransitionStyle.CUT
						}
					},
					classes: ['adlib_deparent']
				}),
				...eksternSisyfos,
				...config.stickyLayers
					.filter(layer => eksternSisyfos.map(obj => obj.layer).indexOf(layer) === -1)
					.filter(layer => config.liveAudio.indexOf(layer) === -1)
					.map<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>(layer => {
						return literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNEL,
								isPgm: 0
							},
							metaData: {
								sisyfosPersistLevel: true
							}
						})
					}),
				// Force server to be muted (for adlibbing over DVE)
				...[
					OfftubeSisyfosLLayer.SisyfosSourceClipPending,
					OfftubeSisyfosLLayer.SisyfosSourceServerA,
					OfftubeSisyfosLLayer.SisyfosSourceServerB
				].map<TSR.TimelineObjSisyfosChannel>(layer => {
					return literal<TSR.TimelineObjSisyfosChannel>({
						id: '',
						enable: {
							start: 0
						},
						priority: 2,
						layer,
						content: {
							deviceType: TSR.DeviceType.SISYFOS,
							type: TSR.TimelineContentTypeSisyfos.CHANNEL,
							isPgm: 0
						}
					})
				})
			])
		}
	})

	context.queuePart(part, [remotePiece])
}

function executeActionCutSourceToBox(
	context: ActionExecutionContext,
	_actionId: string,
	userData: ActionCutSourceToBox
) {
	const config = parseConfig(context)

	const currentPieces = context.getPieceInstances('current')
	const nextPieces = context.getPieceInstances('next')

	const currentDVE = currentPieces.find(
		p =>
			p.piece.sourceLayerId === OfftubeSourceLayer.PgmDVE ||
			p.piece.sourceLayerId === OfftubeSourceLayer.SelectedAdLibDVE
	)
	const nextDVE = nextPieces.find(
		p =>
			p.piece.sourceLayerId === OfftubeSourceLayer.PgmDVE ||
			p.piece.sourceLayerId === OfftubeSourceLayer.SelectedAdLibDVE
	)

	let modify: undefined | 'current' | 'next'
	let modifiedPiece: IBlueprintPieceInstance | undefined

	if (currentDVE) {
		modify = 'current'
		modifiedPiece = currentDVE
	} else if (nextDVE) {
		modify = 'next'
		modifiedPiece = nextDVE
	}

	if (!modifiedPiece || !modify || !modifiedPiece.piece.content || !modifiedPiece.piece.content.timelineObjects) {
		return
	}

	const tlObjIndex = (modifiedPiece.piece.content.timelineObjects as TSR.TSRTimelineObj[]).findIndex(
		t => t.content.deviceType === TSR.DeviceType.ATEM && t.content.type === TSR.TimelineContentTypeAtem.SSRC
	)

	if (tlObjIndex === -1) {
		return
	}

	const content = modifiedPiece.piece.content as SplitsContent
	const replacedSource = content.boxSourceConfiguration[userData.box] as SplitsContentBoxContent &
		SplitsContentBoxProperties &
		DVEBoxInfo

	// Don't do anything if the source is already routed to the target box
	if (replacedSource.rawType === userData.name) {
		return
	}

	const obj = modifiedPiece.piece.content.timelineObjects[tlObjIndex] as TSR.TimelineObjAtemSsrc & TimelineBlueprintExt
	obj.content.ssrc.boxes[userData.box] = {
		...obj.content.ssrc.boxes[userData.box],
		source: userData.port
	}

	modifiedPiece.piece.content.timelineObjects[tlObjIndex] = obj

	content.boxSourceConfiguration[userData.box] = literal<
		SplitsContentBoxContent & SplitsContentBoxProperties & DVEBoxInfo
	>({
		type: userData.sourceType,
		studioLabel: '',
		switcherInput: userData.port,
		rawType: userData.name
	})

	modifiedPiece.piece.content = content

	const activeLayers: string[] = []

	content.boxSourceConfiguration.forEach((box: SplitsContentBoxContent & SplitsContentBoxProperties & DVEBoxInfo) => {
		switch (box.type) {
			case SourceLayerType.CAMERA:
				const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, box.rawType)
				if (sourceInfoCam) {
					GetLayersForCamera(config, sourceInfoCam).forEach(layer => {
						if (!activeLayers.includes(layer)) {
							activeLayers.push(layer)
						}
					})
				}
				break
			case SourceLayerType.REMOTE:
				;[...GetLayersForEkstern(context, config.sources, box.rawType), ...config.studio.StudioMics].forEach(layer => {
					if (!activeLayers.includes(layer)) {
						activeLayers.push(layer)
					}
				})
				break
		}
	})

	modifiedPiece.piece.content.timelineObjects = modifiedPiece.piece.content.timelineObjects!.filter(
		t => t.content.deviceType !== TSR.DeviceType.SISYFOS || activeLayers.includes(t.layer.toString()) // TODO: Combined sisyfos layers
	)

	const existingLayers: string[] = []

	modifiedPiece.piece.content.timelineObjects?.forEach(t => {
		if (t.content.deviceType === TSR.DeviceType.SISYFOS) {
			existingLayers.push(t.layer.toString())
		}
	})

	const newLayers = activeLayers.filter(layer => !existingLayers.includes(layer))

	newLayers.forEach(layer => {
		modifiedPiece!.piece.content!.timelineObjects!.push(
			literal<TSR.TimelineObjSisyfosChannel>({
				id: '',
				enable: {
					while: '1'
				},
				layer,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNEL,
					isPgm: 1
				}
			})
		)
	})

	context.updatePieceInstance(modifiedPiece._id, modifiedPiece.piece)
}
