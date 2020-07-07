import {
	ActionExecutionContext,
	BlueprintMappings,
	ConfigItemValue,
	IBlueprintPart,
	IBlueprintPartInstance,
	IBlueprintPiece,
	IBlueprintPieceInstance,
	IBlueprintResolvedPieceInstance,
	OmitId
} from 'tv-automation-sofie-blueprints-integration'
import { DVEConfigInput, literal, TableConfigItemSourceMappingWithSisyfos } from 'tv2-common'
import { OfftubeStudioConfig } from '../../tv2_offtube_studio/helpers/config'
import { OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowStyleConfig } from '../helpers/config'

const mockStudioConfig: OfftubeStudioConfig = {
	SofieHostURL: '',

	MediaFlowId: '',
	SourcesCam: [
		literal<TableConfigItemSourceMappingWithSisyfos>({
			SisyfosLayers: [],
			StudioMics: true,
			SourceName: '1',
			AtemSource: 4
		})
	],
	SourcesRM: [],
	SourcesSkype: [],
	ABMediaPlayers: [],
	StudioMics: [
		OfftubeSisyfosLLayer.SisyfosSourceHost_1_ST_A,
		OfftubeSisyfosLLayer.SisyfosSourceHost_2_ST_A,
		OfftubeSisyfosLLayer.SisyfosSourceHost_3_ST_A
	],
	ABPlaybackDebugLogging: false,

	AtemSource: {
		DSK1F: 0,
		DSK1K: 0,
		SplitArtF: 0,
		SplitArtK: 0,
		Default: 0,
		Continuity: 0,
		SplitBackground: 0,
		GFXFull: 0,
		Loop: 0,
		JingleFill: 0,
		JingleKey: 0
	},
	AtemSettings: {
		CCGClip: 0,
		CCGGain: 0
	},
	AudioBedSettings: {
		fadeIn: 0,
		fadeOut: 0,
		volume: 0
	},
	CasparPrerollDuration: 0,
	ClipFileExtension: 'mxf',
	NetworkBasePath: '/',
	JingleBasePath: 'jingler',
	ClipBasePath: 'clips',
	MaximumPartDuration: 0,
	DefaultPartDuration: 0,
	IdleSource: 0,
	FullKeepAliveDuration: 0
}

const mockShowStyleConfig: OfftubeShowStyleConfig = {
	DVEStyles: [
		literal<DVEConfigInput>({
			DVEName: 'morbarn',
			DVEJSON: '{}',
			DVEGraphicsTemplate: '',
			DVEGraphicsFrame: '',
			DVEGraphicsKey: '',
			DVEGraphicsTemplateJSON: '',
			DVEInputs: ''
		}),
		literal<DVEConfigInput>({
			DVEName: 'barnmor',
			DVEJSON: '{}',
			DVEGraphicsTemplate: '',
			DVEGraphicsFrame: '',
			DVEGraphicsKey: '',
			DVEGraphicsTemplateJSON: '',
			DVEInputs: ''
		})
	],
	GFXTemplates: [],
	WipesConfig: [],
	BreakerConfig: [],
	DefaultTemplateDuration: 4,
	LYDConfig: [],
	CasparCGLoadingClip: ''
}

export class MockContext implements ActionExecutionContext {
	public warnings: string[] = []
	public errors: string[] = []

	/** Get the mappings for the studio */
	public getStudioMappings: () => Readonly<BlueprintMappings>

	constructor(
		public segmentId: string,
		public currentPart: IBlueprintPartInstance,
		public currentPieceInstances: IBlueprintPieceInstance[],
		public nextPart?: IBlueprintPartInstance,
		public nextPieceInstances?: IBlueprintPieceInstance[]
	) {}
	/** Returns a map of the ShowStyle configs */
	public getShowStyleConfig(): Readonly<{
		[key: string]: ConfigItemValue
	}> {
		return JSON.parse(JSON.stringify(mockShowStyleConfig))
	}
	/** Returns a map of the studio configs */
	public getStudioConfig(): Readonly<{
		[key: string]: ConfigItemValue
	}> {
		return JSON.parse(JSON.stringify(mockStudioConfig))
	}
	/** Un-hash, is return the string that created the hash */
	public unhashId(hash: string) {
		return hash
	}
	/**
	 * Hash a string. Will return a unique string, to be used for all _id:s that are to be inserted in database
	 * @param originString A representation of the origin of the hash (for logging)
	 * @param originIsNotUnique If the originString is not guaranteed to be unique, set this to true
	 */
	public getHashId(originString: string, _originIsNotUnique?: boolean) {
		return originString
	}
	public warning(message: string) {
		this.warnings.push(message)
	}
	public error(message: string) {
		this.errors.push(message)
	}
	/** Returns a reference to a studio config value, that can later be resolved in Core */
	public getStudioConfigRef(_configKey: string): string {
		return ''
	}
	/** Returns a reference to a showStyle config value, that can later be resolved in Core */
	public getShowStyleConfigRef(_configKey: string): string {
		return ''
	}
	/** Get a PartInstance which can be modified */
	public getPartInstance(part: 'current' | 'next'): IBlueprintPartInstance | undefined {
		if (part === 'current') {
			return this.currentPart
		}
		return this.nextPart
	}
	/** Get the PieceInstances for a modifiable PartInstance */
	public getPieceInstances(part: 'current' | 'next'): IBlueprintPieceInstance[] {
		if (part === 'current') {
			return this.currentPieceInstances
		}

		return this.nextPieceInstances || []
	}
	/** Get the resolved PieceInstances for a modifiable PartInstance */
	public getResolvedPieceInstances(_part: 'current' | 'next'): IBlueprintResolvedPieceInstance[] {
		return []
	}
	/** Get the last active piece on given layer */
	public findLastPieceOnLayer(
		_sourceLayerId: string,
		_options?: {
			excludeCurrentPart?: boolean
			originalOnly?: boolean
			pieceMetaDataFilter?: any
		}
	): IBlueprintPieceInstance | undefined {
		return undefined
	}
	/** Fetch the showstyle config for the specified part */
	/** Creative actions */
	/** Insert a piece. Returns id of new PieceInstance. Any timelineObjects will have their ids changed, so are not safe to reference from another piece */
	public insertPiece(part: 'current' | 'next', piece: IBlueprintPiece): IBlueprintPieceInstance {
		let partId: string = ''
		if (part === 'current') {
			partId = this.currentPart.part._id
		} else {
			if (this.nextPart) {
				partId = this.nextPart.part._id
			}
		}
		return {
			_id: '',
			piece: {
				...piece,
				partId: partId || ''
			}
		}
	}
	/** Update a piecesInstances */
	public updatePieceInstance(
		_pieceInstanceId: string,
		piece: Partial<OmitId<IBlueprintPiece>>
	): IBlueprintPieceInstance {
		return {
			_id: '',
			piece: {
				_id: '',
				...(piece as IBlueprintPiece),
				partId: ''
			}
		}
	}
	/** Insert a queued part to follow the current part */
	public queuePart(part: IBlueprintPart, pieces: IBlueprintPiece[]): IBlueprintPartInstance {
		const instance = literal<IBlueprintPartInstance>({
			_id: '',
			segmentId: this.segmentId,
			part: {
				_id: '',
				...part,
				segmentId: this.segmentId
			}
		})

		this.nextPart = instance
		this.nextPieceInstances = pieces.map<IBlueprintPieceInstance>(p => ({
			_id: '',
			piece: {
				...p,
				partId: ''
			}
		}))

		return instance
	}
	/** Destructive actions */
	/** Stop any piecesInstances on the specified sourceLayers. Returns ids of piecesInstances that were affected */
	public stopPiecesOnLayers(_sourceLayerIds: string[], _timeOffset?: number): string[] {
		return []
	}
	/** Stop piecesInstances by id. Returns ids of piecesInstances that were removed */
	public stopPieceInstances(_pieceInstanceIds: string[], _timeOffset?: number): string[] {
		return []
	}
}
