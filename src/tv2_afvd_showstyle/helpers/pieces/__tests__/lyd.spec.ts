import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IBlueprintRundownDB,
	PieceLifespan
} from '@sofie-automation/blueprints-integration'
import { CueDefinitionLYD, literal, ParseCue, PartDefinitionKam } from 'tv2-common'
import { NoteType, PartType } from 'tv2-constants'
import { SegmentContext } from '../../../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../../../tv2_afvd_showstyle/__tests__/configs'
import { StudioConfig } from '../../../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { getConfig, ShowStyleConfig } from '../../config'
import { EvaluateLYD } from '../lyd'

const RUNDOWN_EXTERNAL_ID = 'TEST.SOFIE.JEST'

function makeMockContext() {
	const rundown = literal<IBlueprintRundownDB>({
		externalId: RUNDOWN_EXTERNAL_ID,
		name: RUNDOWN_EXTERNAL_ID,
		_id: '',
		showStyleVariantId: ''
	})
	const mockContext = new SegmentContext(rundown, mappingsDefaults)
	mockContext.studioConfig = defaultStudioConfig as any
	mockContext.showStyleConfig = defaultShowStyleConfig as any

	return mockContext
}

const config = getConfig(makeMockContext())

describe('lyd', () => {
	test('Lyd with no out time', () => {
		const parsedCue = ParseCue(['LYD=SN_INTRO', ';0.00'], config) as CueDefinitionLYD
		const pieces: IBlueprintPiece[] = []
		const adlibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const mockPart = literal<PartDefinitionKam>({
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '0001',
			rawType: 'Kam 1',
			cues: [],
			script: '',
			storyName: '',
			fields: {},
			modified: 0,
			segmentExternalId: ''
		})

		EvaluateLYD(
			makeMockContext(),
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: [],
				mediaPlayers: [],
				stickyLayers: [],
				liveAudio: []
			},
			pieces,
			adlibPieces,
			actions,
			parsedCue,
			mockPart
		)

		expect(pieces[0].enable).toEqual(
			literal<IBlueprintPiece['enable']>({
				start: 0
			})
		)

		expect(pieces[0].lifespan).toEqual(PieceLifespan.OutOnRundownEnd)
	})

	test('Lyd with out time', () => {
		const parsedCue = ParseCue(['LYD=SN_INTRO', ';0.00-0.10'], config) as CueDefinitionLYD
		const pieces: IBlueprintPiece[] = []
		const adlibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const mockPart = literal<PartDefinitionKam>({
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '0001',
			rawType: 'Kam 1',
			cues: [],
			script: '',
			storyName: '',
			fields: {},
			modified: 0,
			segmentExternalId: ''
		})

		EvaluateLYD(
			makeMockContext(),
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: [],
				mediaPlayers: [],
				stickyLayers: [],
				liveAudio: []
			},
			pieces,
			adlibPieces,
			actions,
			parsedCue,
			mockPart
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
		const parsedCue = ParseCue(['LYD=SN_MISSING', ';0.00-0.10'], config) as CueDefinitionLYD
		const pieces: IBlueprintPiece[] = []
		const adlibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const mockPart = literal<PartDefinitionKam>({
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '0001',
			rawType: 'Kam 1',
			cues: [],
			script: '',
			storyName: '',
			fields: {},
			modified: 0,
			segmentExternalId: ''
		})

		const context = makeMockContext()

		EvaluateLYD(
			context,
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: [],
				mediaPlayers: [],
				stickyLayers: [],
				liveAudio: []
			},
			pieces,
			adlibPieces,
			actions,
			parsedCue,
			mockPart
		)

		expect(pieces.length).toEqual(0)
		expect(context.getNotes().length).toEqual(1)
		expect(context.getNotes()[0].type).toEqual(NoteType.WARNING)
	})
})
