import { MigrationStepShowStyle } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import { remapVizDOvl, remapVizLLayer } from '../../tv2_offtube_showstyle/migrations'
import { enforceShortcuts, remapTableColumnValues } from '../../tv2_offtube_showstyle/migrations/util'
import { SourceLayer } from '../layers'
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
	...enforceShortcuts(
		'1.3.0',
		SourceLayer.PgmCam,
		'f1,f2,f3,f4,ctrl+shift+alt+c,shift+ctrl+f1,shift+ctrl+f2,shift+ctrl+f3,shift+ctrl+f4,shift+ctrl+f5'
	),
	...enforceShortcuts('1.3.0', SourceLayer.PgmLive, '1,2,3,4,5,6,7,8,9,0'),
	...enforceShortcuts('1.3.0', SourceLayer.PgmDVE, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmDVEAdlib, 'm,comma,.,n,c,b,v'),
	...enforceShortcuts(
		'1.3.0',
		SourceLayer.PgmDVEBox1,
		'shift+f1,shift+f2,shift+f3,shift+f4,shift+f5,shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9,shift+0,shift+e,shift+d,shift+i,shift+u,ctrl+alt+shift+h'
	),
	...enforceShortcuts(
		'1.3.0',
		SourceLayer.PgmDVEBox2,
		'ctrl+f1,ctrl+f2,ctrl+f3,ctrl+shift+alt+f4,ctrl+f5,ctrl+1,ctrl+2,ctrl+3,ctrl+4,ctrl+5,ctrl+6,ctrl+7,ctrl+8,ctrl+9,ctrl+0,ctrl+e,ctrl+d,ctrl+i,ctrl+shift+alt+i,ctrl+alt+shift+g'
	),
	...enforceShortcuts(
		'1.3.0',
		SourceLayer.PgmDVEBox3,
		'alt+shift+f1,alt+shift+f2,alt+shift+f3,alt+shift+f4,alt+shift+f5,alt+shift+1,alt+shift+2,alt+shift+3,alt+shift+4,alt+shift+5,alt+shift+6,alt+shift+7,alt+shift+8,alt+shift+9,alt+shift+0,alt+shift+e,alt+shift+d,alt+shift+g'
	),
	...enforceShortcuts('1.3.0', SourceLayer.PgmDVEBox4, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmServer, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmVoiceOver, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmPilot, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmGraphicsTLF, 'i'),
	...enforceShortcuts('1.3.0', SourceLayer.PgmDelayed, 'r,e,i,u'),
	...enforceShortcuts('1.3.0', SourceLayer.PgmContinuity, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmGraphicsIdent, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmGraphicsIdentPersistent, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmJingle, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmAdlibVizCmd, ',space,,q'),
	...enforceShortcuts('1.3.0', SourceLayer.VizFullIn1, 'ctrl+shift+alt+f'),
	...enforceShortcuts('1.3.0', SourceLayer.PgmGraphicsTop, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmScript, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmDSK, ','),
	...enforceShortcuts(
		'1.3.0',
		SourceLayer.AuxStudioScreen,
		'shift+ctrl+1,shift+ctrl+2,shift+ctrl+3,shift+ctrl+4,shift+ctrl+5,shift+ctrl+6,shift+ctrl+7,shift+ctrl+8,shift+ctrl+9,shift+ctrl+0,shift+ctrl+e'
	),
	...enforceShortcuts('1.3.0', SourceLayer.PgmGraphicsLower, 'a,s,d,f,g'),
	...enforceShortcuts('1.3.0', SourceLayer.PgmAudioBed, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmDesign, 'shift+a'),
	...enforceShortcuts('1.3.0', SourceLayer.PgmGraphicsHeadline, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmDVEBackground, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmGraphicsTema, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmSisyfosAdlibs, 'ctrl+shift+alt+e,ctrl+shift+alt+d'),
	...enforceShortcuts('1.3.0', SourceLayer.PgmGraphicsOverlay, ''),
	...enforceShortcuts('1.3.0', SourceLayer.PgmPilotOverlay, ''),
	...enforceShortcuts('1.3.0', SourceLayer.WallGraphics, ''),
	// Fill in any layers that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getSourceLayerDefaultsMigrationSteps(VERSION),
	...getOutputLayerDefaultsMigrationSteps(VERSION)
])
