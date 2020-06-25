import { SplitsContent } from 'tv-automation-sofie-blueprints-integration'
import {
	CueDefinitionDVE,
	DVEConfigInput,
	DVEOptions,
	GetLayersForEkstern,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	MakeContentDVEBase,
	PartContext2,
	PartDefinition
} from 'tv2-common'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export const boxLayers = {
	INP1: OfftubeSourceLayer.PgmDVEBox1,
	INP2: OfftubeSourceLayer.PgmDVEBox2,
	INP3: OfftubeSourceLayer.PgmDVEBox3,
	INP4: OfftubeSourceLayer.PgmDVEBox4
}

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
			CGDVEFrame: OfftubeCasparLLayer.CasparCGDVEFrame,
			CGDVETemplate: OfftubeCasparLLayer.CasparCGDVETemplate
		},
		SisyfosLLayer: {
			ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
			StudioMics: OfftubeSisyfosLLayer.SisyfosGroupStudioMics
		},
		CasparLLayer: {
			ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
		}
	},
	dveTimelineGenerators: {
		GetSisyfosTimelineObjForCamera,
		GetSisyfosTimelineObjForEkstern,
		GetLayersForEkstern
	},
	boxLayers,
	boxMappings,
	AUDIO_LAYERS: [], // TODO
	EXCLUDED_LAYERS: [] // TODO
}

export function OfftubeMakeContentDVE(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	dveConfig: DVEConfigInput | undefined,
	addClass?: boolean,
	adlib?: boolean
): { content: SplitsContent; valid: boolean; stickyLayers: string[] } {
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
