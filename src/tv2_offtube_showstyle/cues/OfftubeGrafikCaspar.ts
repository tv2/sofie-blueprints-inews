import { AtemTransitionStyle, DeviceType, TimelineContentTypeAtem, TimelineContentTypeCasparCg, TimelineObjAtemME, TimelineObjCCGMedia } from 'timeline-state-resolver-types'
import {
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { CreateAdlibServer, CueDefinitionGrafik, literal, PartDefinition, TranslateEngine } from 'tv2-common'
import { Enablers, VizEngine } from 'tv2-constants'
import { TableConfigItemGFXTemplates } from '../../tv2_afvd_showstyle/helpers/config'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OffTubeSourceLayer } from '../layers'

export function OfftubeEvaluateGrafikCaspar(
	config: OffTubeShowstyleBlueprintConfig,
	_context: PartContext,
	_pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_partid: string,
	parsedCue: CueDefinitionGrafik,
	_engine: VizEngine,
	_adlib: boolean,
	partDefinition: PartDefinition,
	_isTlfPrimary?: boolean,
	_rank?: number
) {
	let engine = _engine
	let template: TableConfigItemGFXTemplates | undefined
	if (config.showStyle.GFXTemplates) {
		const templ = config.showStyle.GFXTemplates.find(
			t =>
				t.INewsName.toUpperCase() === parsedCue.template.toUpperCase() &&
				t.INewsCode.toString()
					.replace(/=/gi, '')
					.toUpperCase() === parsedCue.iNewsCommand.toUpperCase()
		)
		if (templ) {
			if (templ.IsDesign) {
				return
			}

			template = templ

			engine = TranslateEngine(templ.VizDestination)
		}
	}

	if (engine === 'FULL') {
		const piece = CreateFull(config, partDefinition, template?.VizTemplate ?? parsedCue.template)
		adlibPieces.push(piece)
	} else {
		// TODO: HTML Graphics
		const piece = CreateAdlibServer(
			config,
			0,
			partDefinition.externalId,
			partDefinition.externalId,
			partDefinition,
			template?.VizTemplate ?? parsedCue.template,
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
				PgmServer: OffTubeSourceLayer.PgmGraphicsLower, // TODO: Get source layer from config
				PgmVoiceOver: OffTubeSourceLayer.PgmGraphicsLower
			},
			{
				isOfftube: true,
				tagAsAdlib: false,
				enabler: Enablers.OFFTUBE_ENABLE_FULL
			}
		)
		piece.name = template?.VizTemplate ?? parsedCue.template
		adlibPieces.push(piece)
	}
}

function CreateFull(
	config: OffTubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	template: string
): IBlueprintAdLibPiece {
	return literal<IBlueprintAdLibPiece>({
		_rank: 0,
		externalId: partDefinition.externalId,
		name: `${template}`,
		sourceLayerId: OffTubeSourceLayer.SelectedAdlibGraphicsFull,
		outputLayerId: OfftubeOutputLayers.SELECTED_ADLIB,
		toBeQueued: true,
		canCombineQueue: true,
		infiniteMode: PieceLifespan.Infinite,
		content: {
			timelineObjects: [
				literal<TimelineObjCCGMedia>({
					id: '',
					enable: {
						while: `.${Enablers.OFFTUBE_ENABLE_FULL}`
					},
					priority: 100,
					layer: OfftubeCasparLLayer.CasparGraphicsFull,
					content: {
						deviceType: DeviceType.CASPARCG,
						type: TimelineContentTypeCasparCg.MEDIA,
						file: template,
						loop: true,
						mixer: {
							opacity: 100
						}
					}
				}),
				literal<TimelineObjAtemME>({
					id: '',
					enable: {
						while: `.${Enablers.OFFTUBE_ENABLE_FULL}`
					},
					priority: 100,
					layer: OfftubeCasparLLayer.CasparGraphicsFull,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.ME,
						me: {
							input: config.studio.AtemSource.GFXFull,
							transition: AtemTransitionStyle.CUT
						}
					}
				})
			]
		}
	})
}
