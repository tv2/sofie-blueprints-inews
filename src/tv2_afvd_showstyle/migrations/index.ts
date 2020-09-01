import { MigrationStepShowStyle } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import { remapVizDOvl, remapVizLLayer } from '../../tv2_offtube_showstyle/migrations'
import { remapShortcuts, remapTableColumnValues } from '../../tv2_offtube_showstyle/migrations/util'
import { SourceLayer } from '../layers'
import { getOutputLayerDefaultsMigrationSteps, getSourceLayerDefaultsMigrationSteps } from './util'
import { getCreateVariantMigrationSteps } from './variants-defaults'

declare const VERSION: string // Injected by webpack

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const showStyleMigrations: MigrationStepShowStyle[] = literal<MigrationStepShowStyle[]>([
	// Fill in any layers that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getCreateVariantMigrationSteps(),
	...getSourceLayerDefaultsMigrationSteps(VERSION),
	...getOutputLayerDefaultsMigrationSteps(VERSION),
	...remapTableColumnValues('0.1.0', 'GFXTemplates', 'LayerMapping', remapVizLLayer),
	// Rename "viz-d-ovl" to "OVL1"
	...remapTableColumnValues('0.1.0', 'GFXTemplates', 'VizDestination', remapVizDOvl),
	...remapShortcuts(
		'1.3.0',
		SourceLayer.PgmDVEBox1,
		'shift+f1,shift+f2,shift+f3,shift+f4,shift+f5,shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9,shift+0,shift+e,shift+d',
		'shift+f1,shift+f2,shift+f3,shift+f4,shift+f5,shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9,shift+0,shift+e,shift+d,shift+i,shift+u,ctrl+alt+shift+h'
	),
	...remapShortcuts(
		'1.3.0',
		SourceLayer.PgmDVEBox2,
		'ctrl+f1,ctrl+f2,ctrl+f3,ctrl+shift+alt+f4,ctrl+f5,ctrl+1,ctrl+2,ctrl+3,ctrl+4,ctrl+5,ctrl+6,ctrl+7,ctrl+8,ctrl+9,ctrl+0,ctrl+e,ctrl+d',
		'ctrl+f1,ctrl+f2,ctrl+f3,ctrl+shift+alt+f4,ctrl+f5,ctrl+1,ctrl+2,ctrl+3,ctrl+4,ctrl+5,ctrl+6,ctrl+7,ctrl+8,ctrl+9,ctrl+0,ctrl+e,ctrl+d,ctrl+i,ctrl+shift+alt+i,ctrl+alt+shift+g'
	),
	...remapShortcuts('1.3.0', SourceLayer.PgmDVEAdlib, 'm,comma,.,n,c,b,v', 'm,comma,nbPeriod,n,c,b,v')
])
