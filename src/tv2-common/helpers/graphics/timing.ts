import { TSR } from 'blueprints-integration'

// @todo: this has to go somewhere
export function GetEnableForWall(): TSR.TSRTimelineObj['enable'] {
	return {
		while: '1'
	}
}
