import { IOutputLayer } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'

export default literal<IOutputLayer[]>([
	{
		_id: 'key',
		name: 'KEY',
		isPGM: false,
		_rank: 10000,
		isDefaultCollapsed: true
	},
	{
		_id: 'pgm',
		name: 'PGM',
		isPGM: true,
		_rank: 1000,
		isFlattened: true
	},
	{
		_id: 'sec',
		name: 'SEC',
		isPGM: false,
		_rank: 100,
		isDefaultCollapsed: true
	},
	{
		_id: 'aux',
		name: 'AUX',
		isPGM: false,
		_rank: 10,
		isDefaultCollapsed: true
	}
])
