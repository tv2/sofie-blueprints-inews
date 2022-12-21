import { IShowStyleUserContext, SplitsContent, WithTimeline } from 'blueprints-integration'
import { CueDefinitionDVE, DVEConfigInput, DVEOptions, MakeContentDVEBase, PartDefinition } from 'tv2-common'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'

export const NUMBER_OF_DVE_BOXES = 4

export const AFVD_DVE_GENERATOR_OPTIONS: DVEOptions = {
	dveLayers: {
		ATEM: {
			SSrcDefault: AtemLLayer.AtemSSrcDefault,
			SSrcArt: AtemLLayer.AtemSSrcArt,
			MEProgram: AtemLLayer.AtemMEProgram
		},
		CASPAR: {
			CGDVEKey: CasparLLayer.CasparCGDVEKey,
			CGDVEFrame: CasparLLayer.CasparCGDVEFrame
		},
		SisyfosLLayer: {
			ClipPending: SisyfosLLAyer.SisyfosSourceClipPending,
			StudioMics: SisyfosLLAyer.SisyfosGroupStudioMics
		},
		CasparLLayer: {
			ClipPending: CasparLLayer.CasparPlayerClipPending
		}
	},
	boxMappings: [AtemLLayer.AtemSSrcBox1, AtemLLayer.AtemSSrcBox2, AtemLLayer.AtemSSrcBox3, AtemLLayer.AtemSSrcBox4],
	AUDIO_LAYERS: Object.keys(SisyfosLLAyer)
}

export function MakeContentDVE(
	context: IShowStyleUserContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	dveConfig: DVEConfigInput | undefined
): { content: WithTimeline<SplitsContent>; valid: boolean } {
	return MakeContentDVEBase(context, config, partDefinition, parsedCue, dveConfig, AFVD_DVE_GENERATOR_OPTIONS)
}
