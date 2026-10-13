import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IShowStyleUserContext,
	TSR
} from 'blueprints-integration'
import {
	Adlib,
	CreateInternalGraphic,
	CreatePilotGraphic,
	CueDefinitionGraphic,
	FindDSKFullGFX,
	GetSisyfosTimelineObjForFull,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	IsTargetingOVL,
	literal,
	PartDefinition,
	PieceMetaData,
	PilotGeneratorSettings
} from 'tv2-common'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'

export const pilotGeneratorSettingsOfftube: PilotGeneratorSettings = {
	caspar: {
		createFullPilotTimelineForStudio: createPilotTimeline
	},
	viz: {
		createFullPilotTimelineForStudio: () => []
	}
}

export function OfftubeEvaluateGrafikCaspar(
	config: OfftubeShowstyleBlueprintConfig,
	context: IShowStyleUserContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	partDefinition: PartDefinition,
	adlib?: Adlib
) {
	const firstPieceIndex = pieces.length
	const firstAdlibIndex = adlibPieces.length

	if (GraphicIsPilot(parsedCue)) {
		CreatePilotGraphic(pieces, adlibPieces, actions, {
			config,
			context,
			partId,
			parsedCue,
			settings: pilotGeneratorSettingsOfftube,
			adlib,
			segmentExternalId: partDefinition.segmentExternalId
		})
	} else if (GraphicIsInternal(parsedCue)) {
		CreateInternalGraphic(config, context, pieces, adlibPieces, partId, parsedCue, partDefinition, adlib)
	}

	if (IsTargetingOVL(parsedCue.target)) {
		for (const piece of [...pieces.slice(firstPieceIndex), ...adlibPieces.slice(firstAdlibIndex)]) {
			const metaData = piece.metaData as PieceMetaData | undefined
			piece.metaData = {
				...metaData,
				sisyfosPersistMetaData: {
					sisyfosLayers: [],
					...metaData?.sisyfosPersistMetaData,
					acceptPersistAudio: true
				}
			}
		}
	}
}

function createPilotTimeline(config: OfftubeShowstyleBlueprintConfig): TSR.TSRTimelineObj[] {
	const fullDSK = FindDSKFullGFX(config)
	return [
		literal<TSR.TimelineObjAtemME>({
			id: '',
			enable: {
				start: Number(config.studio.CasparPrerollDuration)
			},
			priority: 1,
			layer: OfftubeAtemLLayer.AtemMEClean,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,
				me: {
					input: fullDSK.Fill,
					transition: TSR.AtemTransitionStyle.WIPE,
					transitionSettings: {
						wipe: {
							rate: Number(config.studio.HTMLGraphics.TransitionSettings.wipeRate),
							pattern: 1,
							reverseDirection: true,
							borderSoftness: config.studio.HTMLGraphics.TransitionSettings.borderSoftness
						}
					}
				}
			}
		}),
		...GetSisyfosTimelineObjForFull(config)
	]
}
