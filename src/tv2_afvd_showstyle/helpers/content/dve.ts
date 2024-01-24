import { SplitsContent, WithTimeline } from 'blueprints-integration'
import {
	CueDefinitionDVE,
	DVEConfigInput,
	DVEOptions,
	MakeContentDVEBase,
	PartDefinition,
	ShowStyleContext,
	SplitScreenPieceActionMetadata
} from 'tv2-common'
import { CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { GalleryBlueprintConfig } from '../config'

export const NUMBER_OF_DVE_BOXES = 4

export const AFVD_DVE_GENERATOR_OPTIONS: DVEOptions = {
	dveLayers: {
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
	}
}

export function MakeContentDVE(
	context: ShowStyleContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	dveConfig: DVEConfigInput | undefined
): {
	content: WithTimeline<SplitsContent>
	valid: boolean
	splitScreenPieceActionMetadata?: SplitScreenPieceActionMetadata
} {
	return MakeContentDVEBase(context, partDefinition, parsedCue, dveConfig, AFVD_DVE_GENERATOR_OPTIONS)
}
