import { IBlueprintPiece, IStudioUserContext, SourceLayerType, Timeline, TSR } from '@tv2media/blueprints-integration'
import { FindSourceInfoStrict, PieceMetaData, SisyfosEVSSource, SisyfosPersistMetaData, SourceInfo } from 'tv2-common'
import { literal } from '../util'

export function GetSisyfosTimelineObjForEkstern(
	context: IStudioUserContext,
	sources: SourceInfo[],
	sourceType: string,
	enable?: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosAny[] {
	if (!enable) {
		enable = { start: 0 }
	}

	const audioTimeline: TSR.TimelineObjSisyfosAny[] = []
	const layers = GetLayersForEkstern(context, sources, sourceType)

	if (!layers || !layers.length) {
		context.notifyUserWarning(`Could not set audio levels for ${sourceType}`)
		return audioTimeline
	}

	layers.forEach(layer => {
		audioTimeline.push(
			literal<TSR.TimelineObjSisyfosChannel>({
				id: '',
				enable: enable!,
				priority: 1,
				layer,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNEL,
					isPgm: 1
				}
			})
		)
	})
	return audioTimeline
}

export function GetLayersForEkstern(context: IStudioUserContext, sources: SourceInfo[], sourceType: string) {
	const eksternProps = sourceType.match(/^(?:LIVE|SKYPE|FEED) ?([^\s]+)(?: (.+))?$/i)
	const eksternLayers: string[] = []
	if (eksternProps) {
		const sourceInfo = FindSourceInfoStrict(context, sources, SourceLayerType.REMOTE, sourceType)
		if (sourceInfo && sourceInfo.sisyfosLayers) {
			eksternLayers.push(...sourceInfo.sisyfosLayers)
		}
	}
	return eksternLayers
}

export function GetSisyfosTimelineObjForCamera(
	context: IStudioUserContext,
	config: { sources: SourceInfo[]; studio: { StudioMics: string[] } },
	sourceType: string,
	channelLayer: string,
	enable?: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosChannels {
	if (!enable) {
		enable = { start: 0 }
	}

	const useMic = !sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+) minus mic(.*)$/i)
	const camName = sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+)$/i)
	const nonCam = !!sourceType.match(/server|telefon|full|evs/i)
	const mappedChannels: TSR.TimelineObjSisyfosChannels['content']['channels'] = []
	if ((useMic && camName) || nonCam) {
		const camLayers: string[] = []
		if (useMic && camName) {
			const sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, sourceType)
			if (sourceInfo) {
				if (sourceInfo.sisyfosLayers) {
					camLayers.push(...sourceInfo.sisyfosLayers)
				}
				if (sourceInfo.useStudioMics) {
					camLayers.push(...config.studio.StudioMics)
				}
			}
		} else if (nonCam) {
			camLayers.push(...config.studio.StudioMics)
		}
		camLayers.forEach(layer => {
			mappedChannels.push({
				mappedLayer: layer,
				isPgm: 1
			})
		})
	}

	return literal<TSR.TimelineObjSisyfosChannels>({
		id: '',
		enable: enable ? enable : { start: 0 },
		priority: mappedChannels.length ? 2 : 0,
		layer: channelLayer,
		content: {
			deviceType: TSR.DeviceType.SISYFOS,
			type: TSR.TimelineContentTypeSisyfos.CHANNELS,
			channels: mappedChannels,
			overridePriority: 2
		}
	})
}

export function GetSisyfosTimelineObjForEVS(sourceInfo: SourceInfo, vo: boolean) {
	return literal<TSR.TimelineObjSisyfosChannel>({
		id: '',
		enable: {
			start: 0
		},
		priority: 1,
		layer: SisyfosEVSSource(sourceInfo.id.replace(/^DP/i, '')),
		content: {
			deviceType: TSR.DeviceType.SISYFOS,
			type: TSR.TimelineContentTypeSisyfos.CHANNEL,
			isPgm: vo ? 2 : 1
		}
	})
}

export function MapSisyfosPersistMetaDataToPieces(pieces: IBlueprintPiece[]) {
	return pieces.map(piece => {
		const metaData = piece.metaData as PieceMetaData
		piece.metaData = {
			...metaData,
			sisyfosPersistMetaData: literal<SisyfosPersistMetaData>({
				sisyfosLayers: []
			})
		}
		return piece
	})
}
