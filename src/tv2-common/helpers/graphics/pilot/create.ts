import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPiece } from 'blueprints-integration'
import { IsTargetingFull, IsTargetingOVL, PilotGraphicGenerator, PilotGraphicProps } from 'tv2-common'

export function CreatePilotGraphic(
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	pilotGraphicProps: PilotGraphicProps
) {
	const { context, adlib, parsedCue } = pilotGraphicProps
	if (
		parsedCue.graphic.vcpid === undefined ||
		parsedCue.graphic.vcpid === null ||
		parsedCue.graphic.vcpid.toString() === '' ||
		parsedCue.graphic.vcpid.toString().length === 0
	) {
		context.notifyUserWarning('No valid VCPID provided')
		return
	}

	const generator = PilotGraphicGenerator.createPilotGraphicGenerator(pilotGraphicProps)

	if (IsTargetingOVL(parsedCue.target) && adlib) {
		adlibPieces.push(generator.createAdlibPiece())
	} else {
		pieces.push(generator.createPiece())
	}

	if (IsTargetingFull(parsedCue.target)) {
		actions.push(generator.createFullPilotAdLibAction())
		pieces.push(generator.createFullDataStore())
	}
}
