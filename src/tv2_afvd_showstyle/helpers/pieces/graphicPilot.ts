import {
	Adlib,
	CreatePilotGraphic,
	CueDefinitionGraphic,
	EvaluateCueResult,
	GraphicPilot,
	ShowStyleContext
} from 'tv2-common'

export function EvaluateCueGraphicPilot(
	context: ShowStyleContext,
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	segmentExternalId: string,
	rank: number,
	adlib?: Adlib
): EvaluateCueResult {
	return CreatePilotGraphic({
		context,
		partId,
		parsedCue,
		adlib,
		segmentExternalId,
		rank
	})
}
