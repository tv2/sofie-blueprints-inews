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
	...getCreateVariantMigrationSteps(),
	...remapTableColumnValues('0.1.0', 'GFXTemplates', 'LayerMapping', remapVizLLayer),
	// Rename "viz-d-ovl" to "OVL1"
	...remapTableColumnValues('0.1.0', 'GFXTemplates', 'VizDestination', remapVizDOvl),
	// Update all defaults for 1.3.0
	...getSourceLayerDefaultsMigrationSteps('1.3.0', true),
	// Fill in any layers that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getSourceLayerDefaultsMigrationSteps(VERSION),
	...getOutputLayerDefaultsMigrationSteps(VERSION)
])
