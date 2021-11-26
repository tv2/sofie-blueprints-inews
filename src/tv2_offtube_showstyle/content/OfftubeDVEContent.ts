import { ISegmentUserContext, SplitsContent, WithTimeline } from '@tv2media/blueprints-integration'
import {
	CueDefinitionDVE,
	DVEConfigInput,
	DVEOptions,
	GetLayersForEkstern,
	GetSisyfosTimelineObjForEkstern,
	MakeContentDVEBase,
	PartDefinition
} from 'tv2-common'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'

export const NUMBER_OF_DVE_BOXES = 4

export const boxMappings: [string, string, string, string] = [
	OfftubeAtemLLayer.AtemSSrcBox1,
	OfftubeAtemLLayer.AtemSSrcBox2,
	OfftubeAtemLLayer.AtemSSrcBox3,
	OfftubeAtemLLayer.AtemSSrcBox4
]

export const OFFTUBE_DVE_GENERATOR_OPTIONS: DVEOptions = {
	dveLayers: {
		ATEM: {
			SSrcDefault: OfftubeAtemLLayer.AtemSSrcDefault,
			SSrcArt: OfftubeAtemLLayer.AtemSSrcArt,
			MEProgram: OfftubeAtemLLayer.AtemMEClean
		},
		CASPAR: {
			CGDVEKey: OfftubeCasparLLayer.CasparCGDVEKey,
			CGDVEFrame: OfftubeCasparLLayer.CasparCGDVEFrame
		},
		SisyfosLLayer: {
			ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
			StudioMics: OfftubeSisyfosLLayer.SisyfosGroupStudioMics,
			PersistedLevels: OfftubeSisyfosLLayer.SisyfosPersistedLevels
		},
		CasparLLayer: {
			ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
		}
	},
	dveTimelineGenerators: {
		GetSisyfosTimelineObjForEkstern,
		GetLayersForEkstern
	},
	boxMappings,
	AUDIO_LAYERS: [], // TODO
	EXCLUDED_LAYERS: [] // TODO
}

export function OfftubeMakeContentDVE(
	context: ISegmentUserContext,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	dveConfig: DVEConfigInput | undefined,
	addClass?: boolean,
	adlib?: boolean
): { content: WithTimeline<SplitsContent>; valid: boolean; stickyLayers: string[] } {
	return MakeContentDVEBase(
		context,
		config,
		partDefinition,
		parsedCue,
		dveConfig,
		OFFTUBE_DVE_GENERATOR_OPTIONS,
		addClass,
		adlib
	)
}
