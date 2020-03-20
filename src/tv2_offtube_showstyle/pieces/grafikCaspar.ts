import { IBlueprintAdLibPiece, IBlueprintPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { CreateAdlibServer, CueDefinitionGrafik, PartDefinition } from 'tv2-common'
import { Enablers } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OffTubeSourceLayer } from '../layers'

export function EvaluateGrafikCaspar(
	config: OffTubeShowstyleBlueprintConfig,
	_context: PartContext,
	_pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	parsedCue: CueDefinitionGrafik,
	partDefinition: PartDefinition,
	adlib: boolean
) {
	if (config.showStyle.GFXTemplates) {
		const template = config.showStyle.GFXTemplates.find(
			templ =>
				templ.INewsName === parsedCue.template &&
				templ.INewsCode.toString()
					.replace(/=/gi, '')
					.toUpperCase() === parsedCue.cue.toUpperCase()
		)
		if (template) {
			console.log(JSON.stringify(template))
			if (template.IsDesign) {
				/* config.showStyle.IsOfftube */
				if ([].length === 999) {
					return
				}
			}
		}
	}

	if (adlib) {
		const piece = CreateAdlibServer(
			config,
			0,
			partDefinition.externalId,
			partDefinition.externalId,
			partDefinition,
			parsedCue.template,
			false,
			{
				Caspar: {
					ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
				},
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
				},
				ATEM: {
					MEPGM: OfftubeAtemLLayer.AtemMEProgram
				},
				PgmServer: OffTubeSourceLayer.SelectedAdlibGraphicsFull,
				PgmVoiceOver: OffTubeSourceLayer.SelectedAdlibGraphicsFull
			},
			{
				isOfftube: true,
				tagAsAdlib: false,
				enabler: Enablers.OFFTUBE_ENABLE_FULL
			}
		)
		adlibPieces.push(piece)
	}
}
