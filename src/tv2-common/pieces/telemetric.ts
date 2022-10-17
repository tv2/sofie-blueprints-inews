import { IBlueprintPiece, PieceLifespan, TSR } from '@tv2media/blueprints-integration'
import { RobotCameraLayer, SharedOutputLayers, SharedSourceLayers } from '../../tv2-constants'
import { literal } from '../util'

export const TELEMETRICS_NAME_PREFIX: string = 'Robot'

export function createTelemetricsPiece(externalId: string, preset: number, startTime: number | 'now'): IBlueprintPiece {
	return {
		externalId,
		name: `${TELEMETRICS_NAME_PREFIX}[${preset}]`,
		enable: {
			start: startTime,
			duration: 100
		},
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SharedSourceLayers.Telemetrics,
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
