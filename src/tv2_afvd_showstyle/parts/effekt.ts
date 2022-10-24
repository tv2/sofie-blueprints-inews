import { IBlueprintPiece, ISegmentUserContext } from 'blueprints-integration'
import { CreateEffektForPartBase, PartDefinition } from 'tv2-common'
import { CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { SourceLayer } from '../layers'

export function CreateEffektForpart(
	context: ISegmentUserContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[]
) {
	return CreateEffektForPartBase(context, config, partDefinition, pieces, {
		sourceLayer: SourceLayer.PgmJingle,
		casparLayer: CasparLLayer.CasparPlayerJingle,
		sisyfosLayer: SisyfosLLAyer.SisyfosSourceJingle
	})
}
