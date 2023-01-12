import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from 'blueprints-integration'
import { CueDefinitionLYD, EvaluateLYD, literal, ParseCue, PartDefinitionKam } from 'tv2-common'
import { AdlibTags, NoteType, PartType, SharedOutputLayers, SharedSourceLayers, SourceType } from 'tv2-constants'
import { SegmentUserContext } from '../../../../__mocks__/context'
import {
	DEFAULT_GRAPHICS_SETUP,
	defaultShowStyleConfig,
	defaultStudioConfig,
	EMPTY_SOURCE_CONFIG
} from '../../../../tv2_afvd_showstyle/__tests__/configs'
import {
	defaultDSKConfig,
	parseConfig as parseStudioConfig,
	StudioConfig
} from '../../../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { getConfig, parseConfig as parseShowStyleConfig, ShowStyleConfig } from '../../config'

function makeMockContext() {
	const mockContext = new SegmentUserContext('test', mappingsDefaults, parseStudioConfig, parseShowStyleConfig)
	mockContext.studioConfig = defaultStudioConfig as any
	mockContext.showStyleConfig = defaultShowStyleConfig as any

	return mockContext
}

const CONFIG = getConfig(makeMockContext())
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

		EvaluateLYD(
			makeMockContext(),
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: EMPTY_SOURCE_CONFIG,
				mediaPlayers: [],
				dsk: defaultDSKConfig,
				selectedGraphicsSetup: DEFAULT_GRAPHICS_SETUP
			},
			pieces,
			adlibPieces,
			actions,
			parsedCue,
			MOCK_PART
		)

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

		EvaluateLYD(
			makeMockContext(),
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: EMPTY_SOURCE_CONFIG,
				mediaPlayers: [],
				dsk: defaultDSKConfig,
				selectedGraphicsSetup: DEFAULT_GRAPHICS_SETUP
			},
			pieces,
			adlibPieces,
			actions,
			parsedCue,
			MOCK_PART
		)

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

		const context = makeMockContext()

		EvaluateLYD(
			context,
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: EMPTY_SOURCE_CONFIG,
				mediaPlayers: [],
				dsk: defaultDSKConfig,
				selectedGraphicsSetup: DEFAULT_GRAPHICS_SETUP
			},
			pieces,
			adlibPieces,
			actions,
			parsedCue,
			MOCK_PART
		)

		expect(pieces.length).toEqual(0)
		expect(context.getNotes().length).toEqual(1)
		expect(context.getNotes()[0].type).toEqual(NoteType.NOTIFY_USER_WARNING)
	})

	test('Lyd adlib', () => {
		const parsedCue = ParseCue(['LYD=SN_INTRO', ';x.xx'], CONFIG) as CueDefinitionLYD
		const pieces: IBlueprintPiece[] = []
		const adlibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []

		EvaluateLYD(
			makeMockContext(),
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: EMPTY_SOURCE_CONFIG,
				mediaPlayers: [],
				dsk: defaultDSKConfig,
				selectedGraphicsSetup: DEFAULT_GRAPHICS_SETUP
			},
			pieces,
			adlibPieces,
			actions,
			parsedCue,
			MOCK_PART,
			true
		)

		expect(adlibPieces.length).toEqual(1)
		expect(adlibPieces[0]).toMatchObject(
			literal<Partial<IBlueprintAdLibPiece>>({
				name: 'SN_INTRO',
				outputLayerId: SharedOutputLayers.MUSIK,
				sourceLayerId: SharedSourceLayers.PgmAudioBed,
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

		EvaluateLYD(makeMockContext(), CONFIG, pieces, adLibPieces, actions, parsedCue, MOCK_PART)

		expect(pieces).toHaveLength(1)
		const timelineObject: TSR.TSRTimelineObj<TSR.TimelineContentCCGMedia> = pieces[0].content
			.timelineObjects[0] as TSR.TSRTimelineObj<TSR.TimelineContentCCGMedia>
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
		CONFIG.studio.AudioBedFolder = audioBedFolder

		const fileName: string = 'someFileName'
		CONFIG.showStyle.LYDConfig = [
			{
				_id: 'someId',
				INewsName: iNewsName,
				FileName: fileName
			}
		]

		EvaluateLYD(makeMockContext(), CONFIG, pieces, adLibPieces, actions, parsedCue, MOCK_PART)

		expect(pieces).toHaveLength(1)
		const timelineObject: TSR.TSRTimelineObj<TSR.TimelineContentCCGMedia> = pieces[0].content
			.timelineObjects[0] as TSR.TSRTimelineObj<TSR.TimelineContentCCGMedia>
		const file = timelineObject.content.file
		expect(file).toBe(`${audioBedFolder}/${fileName}`)
	})
})
