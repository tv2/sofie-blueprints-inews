import {
	ActionExecutionContext,
	ActionUserData,
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintPieceInstance,
	PieceLifespan,
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
	DVEBoxInfo,
	FindSourceInfoStrict,
	GetCameraMetaData,
	GetEksternMetaData,
	GetLayersForCamera,
	GetLayersForEkstern,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	literal,
	TimelineBlueprintExt
} from 'tv2-common'
import { AdlibActionType } from 'tv2-constants'
import _ = require('underscore')
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../tv2_afvd_studio/layers'
import { parseConfig } from './helpers/config'
import { SourceLayer } from './layers'

export function executeAction(context: ActionExecutionContext, actionId: string, userData: ActionUserData): void {
	switch (actionId) {
		case AdlibActionType.SELECT_SERVER_CLIP:
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
		sourceLayerId: SourceLayer.PgmCam,
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
					layer: AtemLLayer.AtemMEProgram,
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
					SisyfosLLAyer.SisyfosSourceClipPending,
					SisyfosLLAyer.SisyfosSourceServerA,
					SisyfosLLAyer.SisyfosSourceServerB
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
		// TODO: This should be handled by exclusivity groups incore
		context.stopPiecesOnLayers([
			SourceLayer.PgmJingle,
			SourceLayer.PgmDVE,
			SourceLayer.PgmServer,
			SourceLayer.PgmLive,
			SourceLayer.PgmPilot
		])
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
		sourceLayerId: SourceLayer.PgmLive,
		outputLayerId: 'pgm',
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
					layer: AtemLLayer.AtemMEProgram,
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
					SisyfosLLAyer.SisyfosSourceClipPending,
					SisyfosLLAyer.SisyfosSourceServerA,
					SisyfosLLAyer.SisyfosSourceServerB
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

	const currentDVE = currentPieces.find(p => p.piece.sourceLayerId === SourceLayer.PgmDVEAdlib)
	const nextDVE = nextPieces.find(p => p.piece.sourceLayerId === SourceLayer.PgmDVEAdlib)
	const currentServer = currentPieces.find(
		p => p.piece.sourceLayerId === SourceLayer.PgmServer || p.piece.sourceLayerId === SourceLayer.PgmVoiceOver
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
	const replacedSource = content.boxSourceConfiguration[userData.box] as
		| (SplitsContentBoxContent & SplitsContentBoxProperties & DVEBoxInfo)
		| undefined

	// Don't do anything if the source is already routed to the target box
	if (replacedSource && replacedSource.rawType === userData.name) {
		return
	}

	if (replacedSource?.type === SourceLayerType.VT || userData.server) {
		if (!modifiedPiece.piece.metaData) {
			modifiedPiece.piece.metaData = {}
		}

		// Clear media player sessions
		modifiedPiece.piece.metaData!.mediaPlayerSessions = []

		const serverObj = modifiedPiece.piece.content?.timelineObjects
			? (modifiedPiece.piece.content.timelineObjects as TSR.TSRTimelineObj[]).findIndex(
					t =>
						t.layer === CasparLLayer.CasparPlayerClipPending &&
						t.content.deviceType === TSR.DeviceType.CASPARCG &&
						t.content.type === TSR.TimelineContentTypeCasparCg.MEDIA
			  )
			: -1

		// Remove any existing server objects
		if (serverObj > -1) {
			;(modifiedPiece.piece.content.timelineObjects as TSR.TSRTimelineObj[]).splice(serverObj, 1)
		}
	}

	if (userData.server) {
		if (!currentServer) {
			return
		}
		const serverObj = currentServer.piece.content?.timelineObjects
			? ((currentServer.piece.content.timelineObjects as TSR.TSRTimelineObj[]).find(
					t =>
						t.layer === CasparLLayer.CasparPlayerClipPending &&
						t.content.deviceType === TSR.DeviceType.CASPARCG &&
						t.content.type === TSR.TimelineContentTypeCasparCg.MEDIA
			  ) as TSR.TimelineObjCCGMedia)
			: undefined

		const sisyfosObj = currentServer.piece.content?.timelineObjects
			? ((currentServer.piece.content.timelineObjects as TSR.TSRTimelineObj[]).find(
					t =>
						t.layer === SisyfosLLAyer.SisyfosSourceClipPending &&
						t.content.deviceType === TSR.DeviceType.SISYFOS &&
						t.content.type === TSR.TimelineContentTypeSisyfos.CHANNEL
			  ) as TSR.TimelineObjSisyfosChannel)
			: undefined

		if (!serverObj || !sisyfosObj) {
			return
		}

		// Update media player sessions
		modifiedPiece.piece.metaData!.mediaPlayerSessions = currentServer.piece.metaData!.mediaPlayerSessions
		;(modifiedPiece.piece.content.timelineObjects as TSR.TSRTimelineObj[]).push(
			literal<TSR.TSRTimelineObj & { _id: '' }>({
				...serverObj,
				_id: ''
			}),
			literal<TSR.TSRTimelineObj & { _id: '' }>({
				...sisyfosObj,
				_id: ''
			})
		)
	}

	const obj = modifiedPiece.piece.content.timelineObjects[tlObjIndex] as TSR.TimelineObjAtemSsrc & TimelineBlueprintExt
	obj.content.ssrc.boxes[userData.box] = {
		...obj.content.ssrc.boxes[userData.box],
		source: userData.port
	}

	modifiedPiece.piece.content.timelineObjects[tlObjIndex] = obj

	if (userData.box + 1 > content.boxSourceConfiguration.length) {
		for (let box = content.boxSourceConfiguration.length; box < userData.box; box++) {
			content.boxSourceConfiguration[box] = {
				type: SourceLayerType.UNKNOWN,
				studioLabel: '',
				switcherInput: 0,
				rawType: ''
			}
		}
	}

	content.boxSourceConfiguration[userData.box] = literal<
		SplitsContentBoxContent & SplitsContentBoxProperties & DVEBoxInfo
	>({
		type: userData.sourceType,
		studioLabel: '',
		switcherInput: userData.port,
		rawType: userData.name
	})

	const activeLayers: string[] = []
	const activeLevels: { [layer: string]: 0 | 1 | 2 | undefined } = {}

	content.boxSourceConfiguration.forEach((box: SplitsContentBoxContent & SplitsContentBoxProperties & DVEBoxInfo) => {
		switch (box.type) {
			case SourceLayerType.CAMERA:
				const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, box.rawType)
				if (sourceInfoCam) {
					GetLayersForCamera(config, sourceInfoCam).forEach(layer => {
						if (!activeLayers.includes(layer)) {
							activeLayers.push(layer)
							activeLevels[layer] = 1
						}
					})
				}
				break
			case SourceLayerType.REMOTE:
				;[...GetLayersForEkstern(context, config.sources, box.rawType), ...config.studio.StudioMics].forEach(layer => {
					if (!activeLayers.includes(layer)) {
						activeLayers.push(layer)
						activeLevels[layer] = userData.vo ? 2 : 1
					}
				})
				break
		}
	})

	modifiedPiece.piece.content = content

	modifiedPiece.piece.content.timelineObjects = modifiedPiece.piece.content.timelineObjects!.filter(
		t => t.content.deviceType !== TSR.DeviceType.SISYFOS || activeLayers.includes(t.layer.toString()) // TODO: Combined sisyfos layers
	)

	const existingLayers: string[] = []
	const existingLevels: { [layer: string]: 0 | 1 | 2 | undefined } = {}

	modifiedPiece.piece.content.timelineObjects?.forEach(t => {
		if (t.content.deviceType === TSR.DeviceType.SISYFOS) {
			existingLayers.push(t.layer.toString())
			existingLevels[t.layer.toString()] = (t as TSR.TimelineObjSisyfosChannel).content.isPgm
		}
	})

	const newLayers = activeLayers.filter(layer => !existingLayers.includes(layer))
	const changedLayers = existingLayers.filter(layer => activeLevels[layer] !== existingLevels[layer])

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
					isPgm: activeLevels[layer]
				}
			})
		)
	})

	changedLayers.forEach(layer => {
		modifiedPiece!.piece.content!.timelineObjects! = (modifiedPiece!.piece.content!
			.timelineObjects as TSR.TSRTimelineObj[]).filter(t => t.layer !== layer)

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
					isPgm: activeLevels[layer]
				}
			})
		)
	})

	context.updatePieceInstance(modifiedPiece._id, modifiedPiece.piece)
}
