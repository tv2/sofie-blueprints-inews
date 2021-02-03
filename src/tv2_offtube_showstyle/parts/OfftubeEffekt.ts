import { IBlueprintPiece, NotesContext } from '@sofie-automation/blueprints-integration'
import { CreateEffektForPartBase, PartDefinition } from 'tv2-common'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { SourceLayer } from '../layers'

export function CreateEffektForpart(
	context: NotesContext,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[]
) {
	return CreateEffektForPartBase(context, config, partDefinition, pieces, {
		sourceLayer: SourceLayer.PgmJingle,
		atemLayer: OfftubeAtemLLayer.AtemDSKGraphics,
		casparLayer: OfftubeCasparLLayer.CasparPlayerJingle,
		sisyfosLayer: OfftubeSisyfosLLayer.SisyfosSourceJingle
	})
}
