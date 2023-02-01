import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPiece } from 'blueprints-integration'
import {
	Adlib,
	CreatePilotGraphic,
	CueDefinitionGraphic,
	ExtendedShowStyleContext,
	GraphicPilot,
	PilotGeneratorSettings
} from 'tv2-common'
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'

export const pilotGeneratorSettingsAFVD: PilotGeneratorSettings = {
	ProgramLayer: AtemLLayer.AtemMEProgram,
	AuxProgramLayer: AtemLLayer.AtemAuxPGM
}

export function EvaluateCueGraphicPilot(
	context: ExtendedShowStyleContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	segmentExternalId: string,
	adlib?: Adlib
) {
	CreatePilotGraphic(pieces, adlibPieces, actions, {
		context,
		partId,
		parsedCue,
		settings: pilotGeneratorSettingsAFVD,
		adlib,
		segmentExternalId
	})
}
