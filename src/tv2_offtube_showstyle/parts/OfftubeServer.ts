import { BlueprintResultPart, HackPartMediaObjectSubscription, IBlueprintActionManifest } from 'blueprints-integration'
import {
	AddScript,
	CreateAdlibServer,
	CreatePartServerBase,
	PartDefinition,
	SegmentContext,
	ServerPartProps
} from 'tv2-common'
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'
import { CreateEffektForpart } from './OfftubeEffekt'

export async function OfftubeCreatePartServer(
	context: SegmentContext<OfftubeBlueprintConfig>,
	partDefinition: PartDefinition,
	partProps: ServerPartProps
): Promise<BlueprintResultPart> {
	const basePartProps = await CreatePartServerBase(context, partDefinition, partProps, {
		SourceLayer: {
			PgmServer: partProps.voLayer ? OfftubeSourceLayer.PgmVoiceOver : OfftubeSourceLayer.PgmServer, // TODO this actually is shared
			SelectedServer: partProps.voLayer ? OfftubeSourceLayer.SelectedVoiceOver : OfftubeSourceLayer.SelectedServer
		},
		Caspar: {
			ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
		},
		Sisyfos: {
			ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
		}
	})

	if (basePartProps.invalid) {
		return basePartProps.part
	}

	let part = basePartProps.part.part
	const pieces = basePartProps.part.pieces
	const adLibPieces = basePartProps.part.adLibPieces
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []
	const file = basePartProps.file
	const duration = basePartProps.duration

	part = { ...part, ...CreateEffektForpart(context, partDefinition, pieces) }

	actions.push(
		await CreateAdlibServer(
			context,
			0,
			partDefinition,
			file,
			partProps.voLayer,
			partProps.voLevels,
			{
				SourceLayer: {
					PgmServer: partProps.voLayer ? OfftubeSourceLayer.PgmVoiceOver : OfftubeSourceLayer.PgmServer, // TODO this actually is shared
					SelectedServer: partProps.voLayer ? OfftubeSourceLayer.SelectedVoiceOver : OfftubeSourceLayer.SelectedServer
				},
				Caspar: {
					ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
				},
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
				}
			},
			false
		)
	)

	await OfftubeEvaluateCues(
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

	AddScript(partDefinition, pieces, duration, OfftubeSourceLayer.PgmScript)

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
