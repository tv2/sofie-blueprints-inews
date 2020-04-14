import { PartContext, SplitsContent } from 'tv-automation-sofie-blueprints-integration'
import {
	CueDefinitionDVE,
	DVEConfigInput,
	DVEOptions,
	DVESources,
	MakeContentDVEBase,
	PartDefinition
} from 'tv2-common'
import * as _ from 'underscore'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'
import { GetSisyfosTimelineObjForCamera, GetSisyfosTimelineObjForEkstern } from '../sisyfos/sisyfos'

export const boxLayers: DVESources = {
	INP1: SourceLayer.PgmDVEBox1,
	INP2: SourceLayer.PgmDVEBox2,
	INP3: SourceLayer.PgmDVEBox3
}
export const boxMappings = [AtemLLayer.AtemSSrcBox1, AtemLLayer.AtemSSrcBox2, AtemLLayer.AtemSSrcBox3]

export const AFVD_DVE_GENERATOR_OPTIONS: DVEOptions = {
	dveLayers: {
		ATEM: {
			SSrcDefault: AtemLLayer.AtemSSrcDefault,
			SSrcArt: AtemLLayer.AtemSSrcArt,
			MEProgram: AtemLLayer.AtemMEProgram
		},
		CASPAR: {
			CGDVEKey: CasparLLayer.CasparCGDVEKey,
			CGDVEFrame: CasparLLayer.CasparCGDVEFrame,
			CGDVETemplate: CasparLLayer.CasparCGDVETemplate
		},
		SisyfosLLayer: {
			ClipPending: SisyfosLLAyer.SisyfosSourceClipPending
		},
		CasparLLayer: {
			ClipPending: CasparLLayer.CasparPlayerClipPending
		}
	},
	dveTimelineGenerators: {
		GetSisyfosTimelineObjForCamera,
		GetSisyfosTimelineObjForEkstern
	},
	boxLayers: {
		INP1: SourceLayer.PgmDVEBox1,
		INP2: SourceLayer.PgmDVEBox2,
		INP3: SourceLayer.PgmDVEBox3,
		INP4: SourceLayer.PgmDVEBox4
	},
	boxMappings: [AtemLLayer.AtemSSrcBox1, AtemLLayer.AtemSSrcBox2, AtemLLayer.AtemSSrcBox3, AtemLLayer.AtemSSrcBox4],
	AUDIO_LAYERS: Object.keys(SisyfosLLAyer),
	EXCLUDED_LAYERS: [
		SisyfosLLAyer.SisyfosSourceClipPending,
		SisyfosLLAyer.SisyfosSourceServerA,
		SisyfosLLAyer.SisyfosSourceServerB
	]
}

export function MakeContentDVE(
	context: PartContext,
	config: BlueprintConfig,
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
		AFVD_DVE_GENERATOR_OPTIONS,
		addClass,
		adlib
	)
}
