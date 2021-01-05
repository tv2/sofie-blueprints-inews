import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import { AddScript, CreateAdlibServer, CreatePartServerBase, PartDefinition, ServerPartProps } from 'tv2-common'
import {
	OfftubeAbstractLLayer,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'
import { CreateEffektForpart } from './OfftubeEffekt'

export function OfftubeCreatePartServer(
	context: SegmentContext,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	props: ServerPartProps
): BlueprintResultPart {
	const basePartProps = CreatePartServerBase(context, config, partDefinition, props, {
		SourceLayer: {
			PgmServer: props.vo ? OfftubeSourceLayer.PgmVoiceOver : OfftubeSourceLayer.PgmServer, // TODO this actually is shared
			SelectedServer: props.vo ? OfftubeSourceLayer.SelectedVoiceOver : OfftubeSourceLayer.SelectedServer
		},
		AbstractLLayer: {
			ServerEnable: OfftubeAbstractLLayer.OfftubeAbstractLLayerServerEnable
		},
		AtemLLayer: {
			MEPgm: OfftubeAtemLLayer.AtemMEClean
		},
		Caspar: {
			ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
		},
		Sisyfos: {
			ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
			StudioMicsGroup: OfftubeSisyfosLLayer.SisyfosGroupStudioMics
		}
	})

	if (basePartProps.invalid) {
		return basePartProps.part
	}

	let part = basePartProps.part.part
	const pieces = basePartProps.part.pieces
	const adLibPieces = basePartProps.part.adLibPieces
	const actions: IBlueprintActionManifest[] = []
	const file = basePartProps.file
	const duration = basePartProps.duration

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	actions.push(
		CreateAdlibServer(
			config,
			0,
			partDefinition,
			file,
			false,
			{
				SourceLayer: {
					PgmServer: OfftubeSourceLayer.PgmServer,
					SelectedServer: OfftubeSourceLayer.SelectedServer
				},
				Caspar: {
					ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
				},
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
					StudioMicsGroup: OfftubeSisyfosLLayer.SisyfosGroupStudioMics
				},
				AtemLLayer: {
					MEPgm: OfftubeAtemLLayer.AtemMEClean
				},
				AbstractLLayer: {
					ServerEnable: OfftubeAbstractLLayer.OfftubeAbstractLLayerServerEnable
				}
			},
			0,
			false
		)
	)

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {})

	AddScript(partDefinition, pieces, duration, OfftubeSourceLayer.PgmScript)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}
