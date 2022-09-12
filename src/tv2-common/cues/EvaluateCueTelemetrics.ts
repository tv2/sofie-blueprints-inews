import { IBlueprintPiece, IShowStyleUserContext, PieceLifespan, TSR } from '@tv2media/blueprints-integration'
import { SharedOutputLayers } from '../../tv2-constants'
import { AFVDSourceLayer } from '../../tv2_afvd_showstyle/layers'
import { RobotCameraLayer } from '../../tv2_afvd_studio/layers'
import { CalculateTime } from '../cueTiming'
import { CueDefinitionTelemetrics } from '../inewsConversion'
import { literal } from '../util'

const TELEMETRICS_NAME_PREFIX: string = 'Robot'

export function EvaluateCueTelemetrics(
	_context: IShowStyleUserContext,
	cueDefinition: CueDefinitionTelemetrics,
	pieces: IBlueprintPiece[],
	externalId: string
): void {
	const startTime: number = cueDefinition.start ? CalculateTime(cueDefinition.start) ?? 1 : 1

	const existingPiece = findExistingPieceForExternalIdAndStartTime(pieces, externalId, startTime)
	if (existingPiece) {
		addPresetIdentifierToTimelineObject(existingPiece, cueDefinition.presetIdentifier)
		addPresetIdentifierToPieceName(existingPiece, cueDefinition.presetIdentifier)
		return
	}

	const newPiece = createTelemetricsPiece(externalId, cueDefinition, startTime)
	pieces.push(newPiece)
}

function findExistingPieceForExternalIdAndStartTime(pieces: IBlueprintPiece[], externalId: string, startTime: number) {
	return pieces.find(
		piece =>
			piece.externalId === externalId &&
			piece.name.startsWith(TELEMETRICS_NAME_PREFIX) &&
			piece.enable.start === startTime
	)
}

function addPresetIdentifierToTimelineObject(piece: IBlueprintPiece, presetIdentifier: number) {
	const existingTimelineObject = piece.content.timelineObjects[0]
	const timelineObject: TSR.TimelineObjTelemetrics = existingTimelineObject as TSR.TimelineObjTelemetrics
	timelineObject.content.presetShotIdentifiers.push(presetIdentifier)
}

function addPresetIdentifierToPieceName(piece: IBlueprintPiece, presetIdentifier: number) {
	piece.name = `${piece.name.split(']')[0]},${presetIdentifier}]`
}

function createTelemetricsTimelineObject(cueDefinition: CueDefinitionTelemetrics): TSR.TimelineObjTelemetrics {
	return literal<TSR.TimelineObjTelemetrics>({
		id: `telemetrics_preset_${cueDefinition.presetIdentifier}`,
		enable: {
			start: 0
		},
		layer: RobotCameraLayer.TELEMETRICS,
		content: {
			deviceType: TSR.DeviceType.TELEMETRICS,
			presetShotIdentifiers: [cueDefinition.presetIdentifier]
		}
	})
}

function createTelemetricsPiece(
	externalId: string,
	cueDefinition: CueDefinitionTelemetrics,
	startTime: number
): IBlueprintPiece {
	return {
		externalId,
		name: `${TELEMETRICS_NAME_PREFIX}[${cueDefinition.presetIdentifier}]`,
		enable: {
			start: startTime,
			duration: 1000
		},
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: AFVDSourceLayer.Telemetrics,
		outputLayerId: SharedOutputLayers.SEC,
		content: {
			timelineObjects: [createTelemetricsTimelineObject(cueDefinition)]
		}
	}
}
