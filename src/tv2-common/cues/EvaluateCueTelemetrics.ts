import { IBlueprintPiece, IShowStyleUserContext, TSR } from '@tv2media/blueprints-integration'
import { SharedSourceLayers } from '../../tv2-constants'
import { CalculateTime } from '../cueTiming'
import { CueDefinitionTelemetrics } from '../inewsConversion'
import { createTelemetricsPiece, TELEMETRICS_NAME_PREFIX } from '../pieces/telemetric'

export function EvaluateCueTelemetrics(
	_context: IShowStyleUserContext,
	cueDefinition: CueDefinitionTelemetrics,
	pieces: IBlueprintPiece[],
	externalId: string
): void {
	const startTime: number = cueDefinition.start ? CalculateTime(cueDefinition.start) ?? 0 : 0

	const existingPiece = findExistingPieceForTelemetricsLayerAndStartTime(pieces, startTime)
	if (!existingPiece) {
		const newPiece = createTelemetricsPiece(externalId, cueDefinition.presetIdentifier, startTime)
		pieces.push(newPiece)
		return
	}
	if (!containsPresetIdentifier(existingPiece, cueDefinition.presetIdentifier)) {
		addPresetIdentifierToTimelineObject(existingPiece, cueDefinition.presetIdentifier)
		addPresetIdentifierToPieceName(existingPiece, cueDefinition.presetIdentifier)
	}
}

function findExistingPieceForTelemetricsLayerAndStartTime(
	pieces: IBlueprintPiece[],
	startTime: number
): IBlueprintPiece | undefined {
	return pieces.find(
		piece =>
			piece.sourceLayerId === SharedSourceLayers.Telemetrics &&
			piece.name.startsWith(TELEMETRICS_NAME_PREFIX) &&
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
