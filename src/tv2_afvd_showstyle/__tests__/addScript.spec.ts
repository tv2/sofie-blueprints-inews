import { IBlueprintPiece, PieceLifespan, ScriptContent, WithTimeline } from 'blueprints-integration'
import { AddScript, literal, PartDefinitionKam } from 'tv2-common'
import { PartType, SharedOutputLayer, SourceType } from 'tv2-constants'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { Tv2PieceType } from '../../tv2-constants/tv2-piece-type'
import { SourceLayer } from '../layers'

describe('addScript', () => {
	test('adds A script', () => {
		const part = literal<PartDefinitionKam>({
			externalId: '00000000001-0',
			type: PartType.Kam,
			sourceDefinition: {
				sourceType: SourceType.KAM,
				id: '2',
				raw: 'KAM 2',
				name: 'KAM 2',
				minusMic: false
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
				outputLayerId: SharedOutputLayer.PGM,
				content: {
					timelineObjects: []
				}
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
				outputLayerId: SharedOutputLayer.MANUS,
				sourceLayerId: SourceLayer.PgmScript,
				lifespan: PieceLifespan.WithinPart,
				content: literal<WithTimeline<ScriptContent>>({
					firstWords: 'Hallo, I wnat to tell you.....',
					lastWords: 'you...... HEREEEELLLLOOOK YES',
					fullScript: 'Hallo, I wnat to tell you......\nHEREEEELLLLOOOK\nYES',
					sourceDuration: 1000,
					lastModified: part.modified * 1000,
					timelineObjects: []
				}),
				metaData: {
					type: Tv2PieceType.MANUS,
					outputLayer: Tv2OutputLayer.MANUS
				}
			})
		)
	})
})
