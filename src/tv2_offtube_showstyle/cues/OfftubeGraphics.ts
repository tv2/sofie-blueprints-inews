import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPiece } from 'blueprints-integration'
import {
	Adlib,
	CreateInternalGraphic,
	CreatePilotGraphic,
	CueDefinitionGraphic,
	ExtendedShowStyleContext,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	PartDefinition,
	PilotGeneratorSettings
} from 'tv2-common'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'

export const pilotGeneratorSettingsOfftube: PilotGeneratorSettings = {
	ProgramLayer: OfftubeAtemLLayer.AtemMEClean
}

export function OfftubeEvaluateGrafikCaspar(
	context: ExtendedShowStyleContext<OfftubeBlueprintConfig>,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	partDefinition: PartDefinition,
	adlib?: Adlib
) {
	if (GraphicIsPilot(parsedCue)) {
		CreatePilotGraphic(pieces, adlibPieces, actions, {
			context,
			partId,
			parsedCue,
			settings: pilotGeneratorSettingsOfftube,
			adlib,
			segmentExternalId: partDefinition.segmentExternalId
		})
	} else if (GraphicIsInternal(parsedCue)) {
		CreateInternalGraphic(context, pieces, adlibPieces, partId, parsedCue, partDefinition, adlib)
	}
}
