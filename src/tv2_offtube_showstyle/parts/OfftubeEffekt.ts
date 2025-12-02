import { IBlueprintPiece } from 'blueprints-integration'
import { CreateEffektForPartBase, PartDefinition, ShowStyleContext } from 'tv2-common'
import { SharedSourceLayer } from 'tv2-constants'
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'

export function CreateEffektForpart(
	context: ShowStyleContext<OfftubeBlueprintConfig>,
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[]
) {
	return CreateEffektForPartBase(context, partDefinition, pieces, {
		sourceLayer: SharedSourceLayer.PgmTransition,
		casparLayer: OfftubeCasparLLayer.CasparPlayerJingle,
		sisyfosLayer: OfftubeSisyfosLLayer.SisyfosSourceJingle
	})
}
