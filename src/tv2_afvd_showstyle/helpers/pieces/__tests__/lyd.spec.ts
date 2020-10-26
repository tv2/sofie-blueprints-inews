import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionLYD, literal, ParseCue, PartContext2, PartDefinitionKam } from 'tv2-common'
import { PartType } from 'tv2-constants'
import { SegmentContext } from '../../../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../../../tv2_afvd_showstyle/__tests__/configs'
import { StudioConfig } from '../../../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { ShowStyleConfig } from '../../config'
import { EvaluateLYD } from '../lyd'

const mockContext = new SegmentContext(
	{
		_id: '',
		externalId: '',
		name: '',
		showStyleVariantId: ''
	},
	mappingsDefaults
)
mockContext.studioConfig = defaultStudioConfig as any
mockContext.showStyleConfig = defaultShowStyleConfig as any

const partContext = new PartContext2(mockContext, '00001')

describe('lyd', () => {
	test('Lyd with no out time', () => {
		const parsedCue = ParseCue(['LYD=SN_INTRO', ';0.00']) as CueDefinitionLYD
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
			partContext,
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
		const parsedCue = ParseCue(['LYD=SN_INTRO', ';0.00-0.10']) as CueDefinitionLYD
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
			partContext,
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
})
