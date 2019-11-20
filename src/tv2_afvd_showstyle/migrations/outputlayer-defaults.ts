import { IOutputLayer } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'

export default literal<IOutputLayer[]>([
	{
		_id: 'ovl',
		name: 'OVERLAY',
		isPGM: false,
		_rank: 10,
		isDefaultCollapsed: true
	},
	{
		_id: 'key',
		name: 'JINGLE',
		isPGM: false,
		_rank: 10
	},
	{
		_id: 'pgm2',
		name: 'PGM',
		isPGM: true,
		_rank: 20,
		isFlattened: true
	},
	{
		_id: 'pgm3',
		name: 'MUSIK',
		isPGM: false,
		_rank: 10
	},
	{
		_id: 'pgm4',
		name: 'MANUS',
		isPGM: false,
		_rank: 10
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
