import { IBlueprintPiece, NotesContext } from '@sofie-automation/blueprints-integration'
import { CreateEffektForPartBase, PartDefinition } from 'tv2-common'
import { SharedSourceLayers } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'

export function CreateEffektForpart(
	context: NotesContext,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[]
) {
	return CreateEffektForPartBase(context, config, partDefinition, pieces, {
		sourceLayer: SharedSourceLayers.PgmJingle,
		atemLayer: OfftubeAtemLLayer.AtemDSKGraphics,
		casparLayer: OfftubeCasparLLayer.CasparPlayerJingle,
		sisyfosLayer: OfftubeSisyfosLLayer.SisyfosSourceJingle
	})
}
