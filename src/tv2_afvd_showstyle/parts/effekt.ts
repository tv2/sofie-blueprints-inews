import { IBlueprintPiece } from 'tv-automation-sofie-blueprints-integration'
import { CreateEffektForPartBase, PartContext2, PartDefinition } from 'tv2-common'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { SourceLayer } from '../layers'

export function CreateEffektForpart(
	context: PartContext2,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[]
) {
	return CreateEffektForPartBase(context, config, partDefinition, pieces, {
		sourceLayer: SourceLayer.PgmJingle,
		atemLayer: AtemLLayer.AtemDSKEffect,
		casparLayer: CasparLLayer.CasparPlayerJingle,
		sisyfosLayer: SisyfosLLAyer.SisyfosSourceJingle
	})
}
