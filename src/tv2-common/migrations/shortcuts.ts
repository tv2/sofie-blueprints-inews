import { ISourceLayer, MigrationContextShowStyle, MigrationStepShowStyle } from '@tv2media/blueprints-integration'
import { literal } from 'tv2-common'

export function SetSourceLayerNameMigrationStep(
	versionStr: string,
	sourceLayerId: string,
	newValue: string
): MigrationStepShowStyle {
	return literal<MigrationStepShowStyle>({
		id: `${versionStr}.remapSourceLayerName.${sourceLayerId}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const sourceLayer = context.getSourceLayer(sourceLayerId)

			if (!sourceLayer) {
				return `Sourcelayer ${sourceLayerId} does not exists`
			}

			return sourceLayer.name !== newValue
		},
		migrate: (context: MigrationContextShowStyle) => {
			const sourceLayer = context.getSourceLayer(sourceLayerId) as ISourceLayer

			sourceLayer.name = newValue

			context.updateSourceLayer(sourceLayerId, sourceLayer)
		}
	})
}
