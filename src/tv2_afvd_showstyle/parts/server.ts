import { BlueprintResultPart, HackPartMediaObjectSubscription, IBlueprintActionManifest } from 'blueprints-integration'
import { AddScript, CreatePartServerBase, PartDefinition, SegmentContext, ServerPartProps } from 'tv2-common'
import { CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { GalleryBlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartServer(
	context: SegmentContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinition,
	partProps: ServerPartProps
): Promise<BlueprintResultPart> {
	const basePartProps = await CreatePartServerBase(context, partDefinition, partProps, {
		SourceLayer: {
			PgmServer: partProps.voLayer ? SourceLayer.PgmVoiceOver : SourceLayer.PgmServer, // TODO this actually is shared
			SelectedServer: partProps.voLayer ? SourceLayer.SelectedVoiceOver : SourceLayer.SelectedServer
		},
		Caspar: {
			ClipPending: CasparLLayer.CasparPlayerClipPending
		},
		Sisyfos: {
			ClipPending: SisyfosLLAyer.SisyfosSourceClipPending
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
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	part = {
		...part,
		...CreateEffektForpart(context, partDefinition, pieces)
	}
	AddScript(partDefinition, pieces, duration, SourceLayer.PgmScript)

	await EvaluateCues(
		context,
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
