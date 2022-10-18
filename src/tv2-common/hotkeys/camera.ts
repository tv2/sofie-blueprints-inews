import { IBlueprintTriggeredActions } from 'blueprints-integration'
import { MakeStudioSourceHotkeys, SourceHotkeyTriggers } from './helpers'

export type CameraHotkeyAssignments = SourceHotkeyTriggers

function cameraHotkeyId(showStyleId: string, sourceLayer: string, hotkeyType: string, index: number) {
	return `${showStyleId}_${sourceLayer}_camera_${hotkeyType}_${index}`
}

function cameraHotkeyName(camera: string) {
	return `KAM ${camera}`
}

export function MakeCameraHotkeys(
	showStyleId: string,
	sourceLayerId: string,
	cameras: string[],
	assignments: CameraHotkeyAssignments,
	getNextRank: () => number
): IBlueprintTriggeredActions[] {
	return MakeStudioSourceHotkeys(
		showStyleId,
		sourceLayerId,
		cameras,
		assignments,
		getNextRank,
		cameraHotkeyName,
		cameraHotkeyId
	)
}
