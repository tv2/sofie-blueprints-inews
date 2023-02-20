import {
	Adlib,
	CreatePilotGraphic,
	CueDefinitionGraphic,
	EvaluateCueResult,
	ExtendedShowStyleContext,
	GraphicPilot
} from 'tv2-common'

export function EvaluateCueGraphicPilot(
	context: ExtendedShowStyleContext,
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	segmentExternalId: string,
	adlib?: Adlib
): EvaluateCueResult {
	return CreatePilotGraphic({
		context,
		partId,
		parsedCue,
		adlib,
		segmentExternalId
	})
}
