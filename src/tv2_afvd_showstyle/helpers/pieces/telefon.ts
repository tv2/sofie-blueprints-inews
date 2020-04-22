import { IBlueprintAdLibPiece, IBlueprintPiece, TSR } from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionTelefon, GetSisyfosTimelineObjForCamera, literal, PartContext2, PartDefinition } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'
import { EvaluateGrafikViz } from './grafikViz'
import { EvaluateMOSViz } from './mos'

export function EvaluateTelefon(
	config: BlueprintConfig,
	context: PartContext2,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionTelefon,
	adlib?: boolean,
	rank?: number
) {
	if (parsedCue.vizObj) {
		if (parsedCue.vizObj.type === CueType.Grafik) {
			EvaluateGrafikViz(
				config,
				context,
				pieces,
				adlibPieces,
				partId,
				parsedCue.vizObj,
				'OVL',
				adlib ? adlib : parsedCue.adlib ? parsedCue.adlib : false,
				partDefinition,
				true,
				rank
			)
		} else {
			EvaluateMOSViz(
				config,
				context,
				pieces,
				adlibPieces,
				partId,
				parsedCue.vizObj,
				'OVL', // TODO: Change to full if using a separate engine
				adlib ? adlib : parsedCue.adlib ? parsedCue.adlib : false,
				true,
				rank
			)
		}

		if ((!adlib && pieces.length) || (adlib && adlibPieces.length)) {
			if (adlib) {
				const index = adlibPieces.length - 1
				const adlibPiece = adlibPieces[index]
				if (adlibPiece.content && adlibPiece.content.timelineObjects) {
					adlibPiece.content.timelineObjects.push(
						literal<TSR.TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceTLF,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							},

							...GetSisyfosTimelineObjForCamera(context, config, 'telefon')
						})
					)
					adlibPiece.name = `${parsedCue.source}`
					adlibPiece.adlibPreroll = config.studio.PilotPrerollDuration
					adlibPieces[index] = adlibPiece
				}
			} else {
				const index = pieces.length - 1
				const piece = pieces[index]
				if (piece.content && piece.content.timelineObjects) {
					piece.content.timelineObjects.push(
						literal<TSR.TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceTLF,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							}
						}),

						...GetSisyfosTimelineObjForCamera(context, config, 'telefon')
					)
					piece.name = `${parsedCue.source}`
					piece.adlibPreroll = config.studio.PilotPrerollDuration
					pieces[index] = piece
				}
			}
		}
	}
}
