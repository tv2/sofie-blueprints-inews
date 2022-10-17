import { IBlueprintPiece, IShowStyleUserContext, PieceLifespan, TSR } from 'blueprints-integration'
import { RobotCameraLayer, SharedOutputLayers, SharedSourceLayers } from '../../tv2-constants'
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
	const startTime: number = cueDefinition.start ? CalculateTime(cueDefinition.start) ?? 0 : 0

	const existingPiece = findExistingPieceForTelemetricsLayerAndStartTime(pieces, startTime)
	if (!existingPiece) {
		const newPiece = createTelemetricsPiece(externalId, cueDefinition, startTime)
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

function createTelemetricsTimelineObject(cueDefinition: CueDefinitionTelemetrics): TSR.TimelineObjTelemetrics {
	return literal<TSR.TimelineObjTelemetrics>({
		id: `telemetrics_preset_${cueDefinition.presetIdentifier}_${Math.random() * 1000}`,
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
			duration: 100
		},
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SharedSourceLayers.Telemetrics,
		outputLayerId: SharedOutputLayers.SEC,
		content: {
			timelineObjects: [createTelemetricsTimelineObject(cueDefinition)]
		}
	}
}
