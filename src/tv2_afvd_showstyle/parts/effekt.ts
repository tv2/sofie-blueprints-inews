import { IBlueprintPiece } from 'blueprints-integration'
import { CreateEffektForPartBase, ExtendedShowStyleContext, PartDefinition } from 'tv2-common'
import { CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { GalleryBlueprintConfig } from '../helpers/config'
import { SourceLayer } from '../layers'

export function CreateEffektForpart(
	context: ExtendedShowStyleContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[]
) {
	return CreateEffektForPartBase(context, partDefinition, pieces, {
		sourceLayer: SourceLayer.PgmJingle,
		casparLayer: CasparLLayer.CasparPlayerJingle,
		sisyfosLayer: SisyfosLLAyer.SisyfosSourceJingle
	})
}
