import { IBlueprintPiece, TSR } from 'blueprints-integration'
import { SharedSourceLayer } from '../../tv2-constants'
import { calculateTime } from '../cueTiming'
import { CueDefinitionRobotCamera } from '../inewsConversion'
import { createTelemetricsPieceForRobotCamera, ROBOT_CAMERA_NAME_PREFIX } from '../pieces/telemetric'

export function EvaluateCueRobotCamera(
	cueDefinition: CueDefinitionRobotCamera,
	pieces: IBlueprintPiece[],
	externalId: string
): void {
	const startTime: number = cueDefinition.start ? calculateTime(cueDefinition.start) ?? 0 : 0

	const existingPiece = findExistingPieceForRobotCameraLayerAndStartTime(pieces, startTime)
	if (!existingPiece) {
		const newPiece = createTelemetricsPieceForRobotCamera(externalId, cueDefinition.presetIdentifier, startTime)
		pieces.push(newPiece)
		return
	}
	if (!containsPresetIdentifier(existingPiece, cueDefinition.presetIdentifier)) {
		addPresetIdentifierToTimelineObject(existingPiece, cueDefinition.presetIdentifier)
		addPresetIdentifierToPieceName(existingPiece, cueDefinition.presetIdentifier)
	}
}

function findExistingPieceForRobotCameraLayerAndStartTime(
	pieces: IBlueprintPiece[],
	startTime: number
): IBlueprintPiece | undefined {
	return pieces.find(
		piece =>
			piece.sourceLayerId === SharedSourceLayer.RobotCamera &&
			piece.name.startsWith(ROBOT_CAMERA_NAME_PREFIX) &&
			piece.enable.start === startTime
	)
}

function containsPresetIdentifier(piece: IBlueprintPiece, presetIdentifier: number): boolean {
	const existingTimelineObject = piece.content.timelineObjects[0]
	const timelineObject: TSR.TimelineObjTelemetrics = existingTimelineObject as TSR.TimelineObjTelemetrics
	return timelineObject.content.presetShotIdentifiers.includes(presetIdentifier)
}

function addPresetIdentifierToTimelineObject(piece: IBlueprintPiece, presetIdentifier: number): void {
	const existingTimelineObject = piece.content.timelineObjects[0]
	const timelineObject: TSR.TimelineObjTelemetrics = existingTimelineObject as TSR.TimelineObjTelemetrics
	timelineObject.content.presetShotIdentifiers.push(presetIdentifier)
}

function addPresetIdentifierToPieceName(piece: IBlueprintPiece, presetIdentifier: number): void {
	piece.name = `${piece.name.split(']')[0]},${presetIdentifier}]`
}
