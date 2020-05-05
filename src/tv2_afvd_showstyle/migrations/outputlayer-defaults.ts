import { IOutputLayer } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'

export default literal<IOutputLayer[]>([
	{
		_id: 'overlay',
		name: 'OVERLAY',
		isPGM: false,
		_rank: 10,
		isDefaultCollapsed: true
	},
	{
		_id: 'jingle',
		name: 'JINGLE',
		isPGM: false,
		_rank: 19
	},
	{
		_id: 'pgm',
		name: 'PGM',
		isPGM: true,
		_rank: 20,
		isFlattened: true
	},
	{
		_id: 'musik',
		name: 'MUSIK',
		isPGM: false,
		_rank: 22
	},
	{
		_id: 'manus',
		name: 'MANUS',
		isPGM: false,
		_rank: 23
	},
	{
		_id: 'sec',
		name: 'SEC',
		isPGM: false,
		_rank: 30,
		isDefaultCollapsed: true
	},
	{
		_id: 'aux',
		name: 'AUX',
		isPGM: false,
		_rank: 40,
		isDefaultCollapsed: true
	}
])
