import { IOutputLayer } from '@sofie-automation/blueprints-integration'
import { literal } from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'

export default literal<IOutputLayer[]>([
	{
		_id: SharedOutputLayers.OVERLAY,
		name: 'OVERLAY',
		isPGM: false,
		_rank: 10,
		isDefaultCollapsed: true
	},
	{
		_id: SharedOutputLayers.JINGLE,
		name: 'JINGLE',
		isPGM: false,
		_rank: 19
	},
	{
		_id: SharedOutputLayers.PGM,
		name: 'PGM',
		isPGM: true,
		_rank: 20,
		isFlattened: true
	},
	{
		_id: SharedOutputLayers.SELECTED_ADLIB,
		name: 'ADLIB',
		isPGM: false,
		_rank: 30,
		isDefaultCollapsed: true
	},
	{
		_id: SharedOutputLayers.MUSIK,
		name: 'MUSIK',
		isPGM: false,
		_rank: 22
	},
	{
		_id: SharedOutputLayers.MANUS,
		name: 'MANUS',
		isPGM: false,
		_rank: 23
	},
	{
		_id: SharedOutputLayers.SEC,
		name: 'SEC',
		isPGM: false,
		_rank: 30,
		isDefaultCollapsed: true
	},
	{
		_id: SharedOutputLayers.AUX,
		name: 'AUX',
		isPGM: false,
		_rank: 40,
		isDefaultCollapsed: true
	}
])
