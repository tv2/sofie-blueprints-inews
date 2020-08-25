import { MigrationStepShowStyle } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import { remapVizDOvl, remapVizLLayer } from '../../tv2_offtube_showstyle/migrations'
import { remapTableColumnValues } from '../../tv2_offtube_showstyle/migrations/util'
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
	...remapTableColumnValues(VERSION, 'GFXTemplates', 'LayerMapping', remapVizLLayer),
	// Rename "viz-d-ovl" to "OVL1"
	...remapTableColumnValues(VERSION, 'GFXTemplates', 'VizDestination', remapVizDOvl)
])
