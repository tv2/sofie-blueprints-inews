import { IBlueprintPiece, PieceLifespan, TSR } from 'blueprints-integration'
import { RobotCameraLayer, SharedOutputLayers, SharedSourceLayers } from '../../tv2-constants'
import { PieceMetaData } from '../onTimelineGenerate'
import { literal } from '../util'

export const ROBOT_CAMERA_NAME_PREFIX: string = 'Robot'

export function createTelemetricsPieceForRobotCamera(
	externalId: string,
	preset: number,
	startTime: number | 'now'
): IBlueprintPiece<PieceMetaData> {
	return {
		externalId,
		name: `${ROBOT_CAMERA_NAME_PREFIX}[${preset}]`,
		enable: {
			start: startTime,
			duration: 100
		},
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SharedSourceLayers.RobotCamera,
		outputLayerId: SharedOutputLayers.SEC,
		content: {
			timelineObjects: [createTelemetricsTimelineObject(preset)]
		}
	}
}

function createTelemetricsTimelineObject(preset: number): TSR.TimelineObjTelemetrics {
	return literal<TSR.TimelineObjTelemetrics>({
		id: `telemetrics_preset_${preset}_${Math.random() * 1000}`,
		enable: {
			start: 0
		},
		layer: RobotCameraLayer.TELEMETRICS,
		content: {
			deviceType: TSR.DeviceType.TELEMETRICS,
			presetShotIdentifiers: [preset]
		}
	})
}
