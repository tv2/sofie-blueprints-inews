import { IBlueprintPiece } from 'blueprints-integration'
import { CreateEffektForPartBase, ExtendedShowStyleContext, PartDefinition } from 'tv2-common'
import { SharedSourceLayers } from 'tv2-constants'
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'

export function CreateEffektForpart(
	context: ExtendedShowStyleContext<OfftubeBlueprintConfig>,
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[]
) {
	return CreateEffektForPartBase(context, partDefinition, pieces, {
		sourceLayer: SharedSourceLayers.PgmJingle,
		casparLayer: OfftubeCasparLLayer.CasparPlayerJingle,
		sisyfosLayer: OfftubeSisyfosLLayer.SisyfosSourceJingle
	})
}
