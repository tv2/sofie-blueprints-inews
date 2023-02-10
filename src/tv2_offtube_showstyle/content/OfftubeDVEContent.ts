import { SplitsContent, WithTimeline } from 'blueprints-integration'
import {
	CueDefinitionDVE,
	DVEConfigInput,
	DVEOptions,
	ExtendedShowStyleContext,
	MakeContentDVEBase,
	PartDefinition
} from 'tv2-common'
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'

export const NUMBER_OF_DVE_BOXES = 4

export const OFFTUBE_DVE_GENERATOR_OPTIONS: DVEOptions = {
	dveLayers: {
		CASPAR: {
			CGDVEKey: OfftubeCasparLLayer.CasparCGDVEKey,
			CGDVEFrame: OfftubeCasparLLayer.CasparCGDVEFrame
		},
		SisyfosLLayer: {
			ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
			StudioMics: OfftubeSisyfosLLayer.SisyfosGroupStudioMics
		},
		CasparLLayer: {
			ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
		}
	}
}

export function OfftubeMakeContentDVE(
	context: ExtendedShowStyleContext<OfftubeBlueprintConfig>,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	dveConfig: DVEConfigInput | undefined
): { content: WithTimeline<SplitsContent>; valid: boolean } {
	return MakeContentDVEBase(context, partDefinition, parsedCue, dveConfig, OFFTUBE_DVE_GENERATOR_OPTIONS)
}
