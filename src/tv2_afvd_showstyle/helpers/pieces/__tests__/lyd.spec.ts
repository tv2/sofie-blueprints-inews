import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from 'blueprints-integration'
import { CueDefinitionLYD, EvaluateLYD, literal, ParseCue, PartDefinitionKam } from 'tv2-common'
import { AdlibTags, NoteType, PartType, SharedOutputLayer, SharedSourceLayer, SourceType } from 'tv2-constants'
import { makeMockGalleryContext, SegmentUserContextMock } from '../../../../__mocks__/context'

const CONFIG = makeMockGalleryContext().config
const MOCK_PART = literal<PartDefinitionKam>({
	type: PartType.Kam,
	sourceDefinition: { sourceType: SourceType.KAM, id: '1', raw: 'Kam 1', minusMic: false, name: 'KAM 1' },
	externalId: '0001',
	rawType: 'Kam 1',
	cues: [],
	script: '',
	storyName: '',
	fields: {},
	modified: 0,
	segmentExternalId: ''
})

describe('lyd', () => {
	test('Lyd with no out time', () => {
		const parsedCue = ParseCue(['LYD=SN_INTRO', ';0.00'], CONFIG) as CueDefinitionLYD
		const pieces: IBlueprintPiece[] = []
		const adlibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []

		EvaluateLYD(makeMockGalleryContext(), pieces, adlibPieces, actions, parsedCue, MOCK_PART)

		expect(pieces[0].enable).toEqual(
			literal<IBlueprintPiece['enable']>({
				start: 0
			})
		)

		expect(pieces[0].lifespan).toEqual(PieceLifespan.OutOnRundownChange)
	})

	test('Lyd with out time', () => {
		const parsedCue = ParseCue(['LYD=SN_INTRO', ';0.00-0.10'], CONFIG) as CueDefinitionLYD
		const pieces: IBlueprintPiece[] = []
		const adlibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []

		EvaluateLYD(makeMockGalleryContext(), pieces, adlibPieces, actions, parsedCue, MOCK_PART)

		expect(pieces[0].enable).toEqual(
			literal<IBlueprintPiece['enable']>({
				start: 0,
				duration: 10000
			})
		)

		expect(pieces[0].lifespan).toEqual(PieceLifespan.WithinPart)
	})

	test('Lyd not configured', () => {
		const parsedCue = ParseCue(['LYD=SN_MISSING', ';0.00-0.10'], CONFIG) as CueDefinitionLYD
		const pieces: IBlueprintPiece[] = []
		const adlibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []

		const context = makeMockGalleryContext()

		EvaluateLYD(context, pieces, adlibPieces, actions, parsedCue, MOCK_PART)

		expect(pieces.length).toEqual(0)
		expect((context.core as SegmentUserContextMock).getNotes().length).toEqual(1)
		expect((context.core as SegmentUserContextMock).getNotes()[0].type).toEqual(NoteType.NOTIFY_USER_WARNING)
	})

	test('Lyd adlib', () => {
		const parsedCue = ParseCue(['LYD=SN_INTRO', ';x.xx'], CONFIG) as CueDefinitionLYD
		const pieces: IBlueprintPiece[] = []
		const adlibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []

		EvaluateLYD(makeMockGalleryContext(), pieces, adlibPieces, actions, parsedCue, MOCK_PART, true)

		expect(adlibPieces.length).toEqual(1)
		expect(adlibPieces[0]).toMatchObject(
			literal<Partial<IBlueprintAdLibPiece>>({
				name: 'SN_INTRO',
				outputLayerId: SharedOutputLayer.MUSIK,
				sourceLayerId: SharedSourceLayer.PgmAudioBed,
				lifespan: PieceLifespan.OutOnRundownChange,
				tags: [AdlibTags.ADLIB_FLOW_PRODUCER]
			})
		)
	})

	it("should fade, studio audio bed folder is configured, audio file should evaluate to 'empty'", () => {
		const parsedCue = ParseCue(['LYD=FADE 100', ';0.00'], CONFIG) as CueDefinitionLYD
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []

		CONFIG.studio.AudioBedFolder = 'audio'

		EvaluateLYD(makeMockGalleryContext(), pieces, adLibPieces, actions, parsedCue, MOCK_PART)

		expect(pieces).toHaveLength(1)
		const timelineObject: TSR.TimelineObjCCGMedia = pieces[0].content.timelineObjects[0] as TSR.TimelineObjCCGMedia
		const file = timelineObject.content.file
		expect(file).toBe('empty')
	})

	it('should play audio, studio audio bed is configured, audio file should be prepended with the configured audio bed', () => {
		const iNewsName = 'ATP_soundbed'
		const parsedCue = ParseCue([`LYD=${iNewsName}`, ';0.00'], CONFIG) as CueDefinitionLYD
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []

		const audioBedFolder = 'audio'

		const fileName: string = 'someFileName'

		EvaluateLYD(
			makeMockGalleryContext({
				studioConfig: { AudioBedFolder: audioBedFolder },
				showStyleConfig: {
					LYDConfig: [
						{
							_id: 'someId',
							INewsName: iNewsName,
							FileName: fileName
						}
					]
				}
			}),
			pieces,
			adLibPieces,
			actions,
			parsedCue,
			MOCK_PART
		)

		expect(pieces).toHaveLength(1)
		const timelineObject: TSR.TimelineObjCCGMedia = pieces[0].content.timelineObjects[0] as TSR.TimelineObjCCGMedia
		const file = timelineObject.content.file
		expect(file).toBe(`${audioBedFolder}/${fileName}`)
	})
})
