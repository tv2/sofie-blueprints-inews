import { IBlueprintPiece, PieceLifespan, TSR } from 'blueprints-integration'
import { RobotCameraLayer, SharedOutputLayer, SharedSourceLayer } from '../../tv2-constants'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { Tv2PieceType } from '../../tv2-constants/tv2-piece-type'
import { PlayoutContentType } from '../../tv2-constants/tv2-playout-content'
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
		sourceLayerId: SharedSourceLayer.RobotCamera,
		outputLayerId: SharedOutputLayer.SEC,
		content: {
			timelineObjects: [createTelemetricsTimelineObject(preset)]
		},
		metaData: {
			playoutContent: {
				type: PlayoutContentType.COMMAND
			},
			type: Tv2PieceType.COMMAND,
			outputLayer: Tv2OutputLayer.SECONDARY
		}
	}
}

function createTelemetricsTimelineObject(preset: number): TSR.TimelineObjTelemetrics {
	return literal<TSR.TimelineObjTelemetrics>({
		id: `telemetrics_preset_${preset}_${Math.floor(Math.random() * 1000)}`,
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
