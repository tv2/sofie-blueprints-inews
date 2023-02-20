import {
	EvaluateCueResult,
	IsTargetingFull,
	IsTargetingOVL,
	PilotGraphicGenerator,
	PilotGraphicProps
} from 'tv2-common'

export function CreatePilotGraphic(pilotGraphicProps: PilotGraphicProps): EvaluateCueResult {
	const result = new EvaluateCueResult()
	const { context, adlib, parsedCue } = pilotGraphicProps
	if (parsedCue.graphic.vcpid < 0) {
		context.core.notifyUserWarning('No valid VCPID provided')
		return result
	}

	const generator = PilotGraphicGenerator.createPilotGraphicGenerator(pilotGraphicProps)

	if (IsTargetingOVL(parsedCue.target) && adlib) {
		result.adlibPieces.push(generator.createAdlibPiece())
	} else {
		result.pieces.push(generator.createPiece())
	}

	if (IsTargetingFull(parsedCue.target)) {
		result.actions.push(generator.createFullPilotAdLibAction())
		result.pieces.push(generator.createFullDataStore())
	}
	return result
}
