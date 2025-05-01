import { IBlueprintPiece, PieceLifespan, ScriptContent, WithTimeline } from 'blueprints-integration'
import { literal, PartDefinition } from 'tv2-common'
import { SharedOutputLayer } from 'tv2-constants'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { Tv2PieceType } from '../../tv2-constants/tv2-piece-type'
import { PlayoutContentType } from '../../tv2-constants/tv2-playout-content'

const PREVIEW_CHARACTERS = 30

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
		pieces.push({
			externalId: part.externalId,
			name: script.slice(0, stripLength),
			enable: {
				start: 0
			},
			outputLayerId: SharedOutputLayer.MANUS,
			sourceLayerId,
			lifespan: PieceLifespan.WithinPart,
			content: literal<WithTimeline<ScriptContent>>({
				firstWords: script.slice(0, stripLength),
				lastWords: script
					.replace(/\n/gi, ' ')
					.trim()
					.slice(script.length - stripLength)
					?.trim(),
				fullScript: script,
				sourceDuration: duration,
				lastModified: part.modified * 1000,
				timelineObjects: []
			}),
			metaData: {
				playoutContent: {
					type: PlayoutContentType.MANUS
				},
				type: Tv2PieceType.MANUS,
				outputLayer: Tv2OutputLayer.MANUS
			}
		})
	}
}
