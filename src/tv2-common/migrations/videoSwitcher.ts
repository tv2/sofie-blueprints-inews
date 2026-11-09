import { MigrationStepStudio } from 'blueprints-integration'
import { SwitcherType } from '../videoSwitchers/types'
import { convertStudioTableColumnToFloat, renameStudioConfig, renameStudioTableColumn } from './index'

export function videoSwitcherMigrations(version: string, studio: string): MigrationStepStudio[] {
	const renameMapping = (from: string, to: string): MigrationStepStudio => ({
		id: `${version}.videoSwitcher.mapping.${studio}.${from}`,
		version,
		canBeRunAutomatically: true,
		validate: context => context.getMapping(from) !== undefined,
		migrate: context => {
			const source = context.getMapping(from)
			if (source !== undefined) {
				if (context.getMapping(to) === undefined) {
					context.insertMapping(to, source)
				}
				context.removeMapping(from)
			}
		}
	})
	return [
		...['SourcesCam', 'SourcesRM', 'SourcesReplay', 'SourcesFeed', 'ABMediaPlayers'].map(table =>
			renameStudioTableColumn(version, table, 'AtemSource', 'SwitcherSource')
		),
		renameStudioConfig(version, studio, 'AtemSource', 'SwitcherSource', true),
		renameStudioConfig(version, studio, 'SwitcherSource.SplitArtF', 'SwitcherSource.SplitArtFill', true),
		renameStudioConfig(version, studio, 'SwitcherSource.SplitArtK', 'SwitcherSource.SplitArtKey', true),
		convertStudioTableColumnToFloat(version, 'SwitcherSource.DSK', 'Clip'),
		convertStudioTableColumnToFloat(version, 'SwitcherSource.DSK', 'Gain'),
		{
			id: `${version}.videoSwitcher.defaultType.${studio}`,
			version,
			canBeRunAutomatically: true,
			validate: context => context.getConfig('SwitcherType') === undefined,
			migrate: context => {
				if (context.getConfig('SwitcherType') === undefined) {
					context.setConfig('SwitcherType', SwitcherType.ATEM)
				}
			}
		},
		renameMapping('atem_supersource_art', 'atem_dve'),
		renameMapping('atem_supersource_default', 'atem_dve_boxes')
	]
}
