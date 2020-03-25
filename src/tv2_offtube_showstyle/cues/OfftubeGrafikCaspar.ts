import { IBlueprintAdLibPiece, IBlueprintPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { CreateAdlibServer, CueDefinitionGrafik, PartDefinition } from 'tv2-common'
import { Enablers, VizEngine } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeEvaluateGrafikCaspar(
	config: OffTubeShowstyleBlueprintConfig,
	_context: PartContext,
	_pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_partid: string,
	parsedCue: CueDefinitionGrafik,
	engine: VizEngine,
	_adlib: boolean,
	partDefinition: PartDefinition,
	_isTlfPrimary?: boolean,
	_rank?: number
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
				return
			}
		}
	}

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
			PgmServer: engine === 'FULL' ? OffTubeSourceLayer.SelectedAdlibGraphicsFull : OffTubeSourceLayer.PgmGraphicsLower, // TODO: Get source layer from config
			PgmVoiceOver:
				engine === 'FULL' ? OffTubeSourceLayer.SelectedAdlibGraphicsFull : OffTubeSourceLayer.PgmGraphicsLower
		},
		{
			isOfftube: true,
			tagAsAdlib: false,
			enabler: Enablers.OFFTUBE_ENABLE_FULL
		}
	)
	adlibPieces.push(piece)
}
