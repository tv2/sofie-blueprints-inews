import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import { AddScript, CreatePartServerBase, PartDefinition, ServerPartProps } from 'tv2-common'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
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
			PgmServer: props.voLayer ? SourceLayer.PgmVoiceOver : SourceLayer.PgmServer, // TODO this actually is shared
			SelectedServer: props.voLayer ? SourceLayer.SelectedVoiceOver : SourceLayer.SelectedServer
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
		},
		ATEM: {}
	})

	if (basePartProps.invalid) {
		return basePartProps.part
	}

	let part = basePartProps.part.part
	const pieces = basePartProps.part.pieces
	const adLibPieces = basePartProps.part.adLibPieces
	const duration = basePartProps.duration
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	part = {
		...part,
		...CreateEffektForpart(context, config, partDefinition, pieces)
	}
	AddScript(partDefinition, pieces, duration, SourceLayer.PgmScript)

	EvaluateCues(
		context,
		config,
		part,
		pieces,
		adLibPieces,
		actions,
		mediaSubscriptions,
		partDefinition.cues,
		partDefinition,
		{}
	)

	part.hackListenToMediaObjectUpdates = (part.hackListenToMediaObjectUpdates || []).concat(mediaSubscriptions)

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
