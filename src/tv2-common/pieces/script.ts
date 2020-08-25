import { IBlueprintPiece, PieceLifespan, ScriptContent } from 'tv-automation-sofie-blueprints-integration'
import { literal, PartDefinition } from 'tv2-common'

const PREVIEW_CHARACTERS = 30

// export function AddScript(part: PartDefinition, pieces: IBlueprintPiece[], duration: number, slutord: boolean) {
export function AddScript(part: PartDefinition, pieces: IBlueprintPiece[], duration: number, sourceLayerId: string) {
	if (!pieces.length) {
		return
	}

	let script = part.script.replace(/^\**/i, '').trim()
	if (part.endWords) {
		script = script.length ? `${script} SLUTORD: ${part.endWords}` : part.endWords
	}
	if (script.length) {
		const stripLength = Math.min(PREVIEW_CHARACTERS, script.length)
		pieces.push(
			literal<IBlueprintPiece>({
				externalId: part.externalId,
				name: script.slice(0, stripLength),
				enable: {
					start: 0
				},
				outputLayerId: 'manus',
				sourceLayerId,
				lifespan: PieceLifespan.WithinPart,
				content: literal<ScriptContent>({
					firstWords: script.slice(0, stripLength),
					lastWords: script
						.replace(/\n/gi, ' ')
						.trim()
						.slice(script.length - stripLength)
						.trim(),
					fullScript: script,
					sourceDuration: duration,
					lastModified: part.modified * 1000
				})
			})
		)
	}
}
