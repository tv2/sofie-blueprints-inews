import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import { AddScript, CreatePartServerBase, PartDefinition, ServerPartProps } from 'tv2-common'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer, VirtualAbstractLLayer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export function CreatePartServer(
	context: SegmentContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	props: ServerPartProps
): BlueprintResultPart {
	const basePartProps = CreatePartServerBase(context, config, partDefinition, props, {
		SourceLayer: {
			PgmServer: props.vo ? SourceLayer.PgmVoiceOver : SourceLayer.PgmServer, // TODO this actually is shared
			SelectedServer: props.vo ? SourceLayer.SelectedVoiceOver : SourceLayer.SelectedServer
		},
		AbstractLLayer: {
			ServerEnable: VirtualAbstractLLayer.AbstractLLayerServerEnable
		},
		AtemLLayer: {
			MEPgm: AtemLLayer.AtemMEProgram
		},
		Caspar: {
			ClipPending: CasparLLayer.CasparPlayerClipPending
		},
		Sisyfos: {
			ClipPending: SisyfosLLAyer.SisyfosSourceClipPending,
			StudioMicsGroup: SisyfosLLAyer.SisyfosGroupStudioMics
		}
	})

	if (basePartProps.invalid) {
		return basePartProps.part
	}

	let part = basePartProps.part.part
	const pieces = basePartProps.part.pieces
	const adLibPieces = basePartProps.part.adLibPieces
	const duration = basePartProps.duration
	const actions: IBlueprintActionManifest[] = []

	part = {
		...part,
		...CreateEffektForpart(context, config, partDefinition, pieces)
	}
	AddScript(partDefinition, pieces, duration, SourceLayer.PgmScript)

	EvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {})

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
