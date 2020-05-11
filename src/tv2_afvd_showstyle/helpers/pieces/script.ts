import { IBlueprintPiece, PieceLifespan, ScriptContent } from 'tv-automation-sofie-blueprints-integration'
import { literal, PartDefinition } from 'tv2-common'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'

const PREVIEW_CHARACTERS = 30

// export function AddScript(part: PartDefinition, pieces: IBlueprintPiece[], duration: number, slutord: boolean) {
export function AddScript(part: PartDefinition, pieces: IBlueprintPiece[], duration: number) {
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
				_id: '',
				externalId: part.externalId,
				name: script.slice(0, stripLength),
				enable: {
					start: 0,
					duration
				},
				outputLayerId: 'manus',
				// sourceLayerId: slutord ? SourceLayer.PgmSlutord : SourceLayer.PgmScript,
				sourceLayerId: SourceLayer.PgmScript,
				infiniteMode: PieceLifespan.OutOnNextPart,
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
