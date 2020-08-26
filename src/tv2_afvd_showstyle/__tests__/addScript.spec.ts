import { IBlueprintPiece, PieceLifespan, ScriptContent } from 'tv-automation-sofie-blueprints-integration'
import { AddScript, literal, PartDefinitionKam } from 'tv2-common'
import { PartType } from 'tv2-constants'
import { SourceLayer } from '../layers'

describe('addScript', () => {
	test('adds A script', () => {
		const part = literal<PartDefinitionKam>({
			externalId: '00000000001-0',
			type: PartType.Kam,
			variant: {
				name: '2'
			},
			rawType: 'KAM 2',
			cues: [],
			script: 'Hallo, I wnat to tell you......\nHEREEEELLLLOOOK\nYES\n',
			fields: {},
			modified: 0,
			storyName: '',
			segmentExternalId: '00000000001'
		})
		const result: IBlueprintPiece[] = [
			literal<IBlueprintPiece>({
				enable: {
					start: 0
				},
				externalId: '',
				name: 'Kam 2',
				lifespan: PieceLifespan.WithinPart,
				sourceLayerId: SourceLayer.PgmCam,
				outputLayerId: 'pgm'
			})
		]
		AddScript(part, result, 1000, SourceLayer.PgmScript)
		expect(result[result.length - 1]).toStrictEqual(
			literal<IBlueprintPiece>({
				externalId: part.externalId,
				name: 'Hallo, I wnat to tell you.....',
				enable: {
					start: 0
				},
				outputLayerId: 'manus',
				sourceLayerId: SourceLayer.PgmScript,
				lifespan: PieceLifespan.WithinPart,
				content: literal<ScriptContent>({
					firstWords: 'Hallo, I wnat to tell you.....',
					lastWords: 'you...... HEREEEELLLLOOOK YES',
					fullScript: 'Hallo, I wnat to tell you......\nHEREEEELLLLOOOK\nYES',
					sourceDuration: 1000,
					lastModified: part.modified * 1000
				})
			})
		)
	})
})
