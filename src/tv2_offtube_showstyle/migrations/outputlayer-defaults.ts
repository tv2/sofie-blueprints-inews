import { IOutputLayer } from 'blueprints-integration'
import { literal } from 'tv2-common'
import { SharedOutputLayer } from 'tv2-constants'

export default literal<IOutputLayer[]>([
	{
		_id: SharedOutputLayer.OVERLAY,
		name: 'OVERLAY',
		isPGM: false,
		_rank: 10,
		isDefaultCollapsed: true
	},
	{
		_id: SharedOutputLayer.JINGLE,
		name: 'JINGLE',
		isPGM: false,
		_rank: 19
	},
	{
		_id: SharedOutputLayer.PGM,
		name: 'PGM',
		isPGM: true,
		_rank: 20,
		isFlattened: true
	},
	{
		_id: SharedOutputLayer.SELECTED_ADLIB,
		name: 'ADLIB',
		isPGM: false,
		_rank: 30,
		isDefaultCollapsed: true
	},
	{
		_id: SharedOutputLayer.MUSIK,
		name: 'MUSIK',
		isPGM: false,
		_rank: 22
	},
	{
		_id: SharedOutputLayer.MANUS,
		name: 'MANUS',
		isPGM: false,
		_rank: 23
	},
	{
		_id: SharedOutputLayer.SEC,
		name: 'SEC',
		isPGM: false,
		_rank: 40,
		isDefaultCollapsed: true
	},
	{
		_id: SharedOutputLayer.AUX,
		name: 'AUX',
		isPGM: false,
		_rank: 50,
		isDefaultCollapsed: true
	}
])
