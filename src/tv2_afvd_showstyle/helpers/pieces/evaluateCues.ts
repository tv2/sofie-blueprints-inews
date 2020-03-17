import {
	DeviceType,
	TimelineContentTypeVizMSE,
	TimelineObjVIZMSEElementInternal,
	TimelineObjVIZMSEElementPilot,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { PartContext } from 'tv-automation-sofie-blueprints-integration'
import { assertUnreachable, CueDefinition, PartDefinition } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { EvaluateAdLib } from './adlib'
import { EvaluateClearGrafiks } from './clearGrafiks'
// import { EvaluateClearGrafiks } from './clearGrafiks'
import { EvaluateDesign } from './design'
import { EvaluateDVE } from './dve'
import { EvaluateEkstern } from './ekstern'
import { IBlueprintAdLibPieceEPI, IBlueprintPieceEPI } from './expectedPlayoutItems'
import { EvaluateGrafik } from './grafik'
import { EvaluateJingle } from './jingle'
import { EvaluateLYD } from './lyd'
import { EvaluateMOS } from './mos'
import { EvaluateTargetEngine } from './targetEngine'
import { EvaluateTelefon } from './telefon'
import { EvaluateVIZ } from './viz'

export function EvaluateCues(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPieceEPI[],
	adLibPieces: IBlueprintAdLibPieceEPI[],
	cues: CueDefinition[],
	partDefinition: PartDefinition,
	adlib?: boolean,
	isGrafikPart?: boolean
) {
	let adLibRank = 0

	for (const cue of cues) {
		if (cue) {
			const shouldAdlib = config.showStyle.IsOfftube || adlib ? true : cue.adlib ? true : false

			switch (cue.type) {
				case CueType.Grafik:
					EvaluateGrafik(
						config,
						context,
						pieces,
						adLibPieces,
						partDefinition.externalId,
						cue,
						'OVL',
						shouldAdlib,
						partDefinition,
						false,
						adLibRank
					)
					break
				case CueType.MOS:
					EvaluateMOS(
						config,
						context,
						pieces,
						adLibPieces,
						partDefinition.externalId,
						cue,
						cue.type === CueType.MOS && cue.engine?.match(/FULL/i) ? 'FULL' : 'OVL',
						shouldAdlib,
						false,
						adLibRank,
						isGrafikPart
					)
					break
				case CueType.Ekstern:
					EvaluateEkstern(
						context,
						config,
						pieces,
						adLibPieces,
						partDefinition.externalId,
						cue,
						partDefinition,
						shouldAdlib,
						adLibRank
					)
					break
				case CueType.DVE:
					EvaluateDVE(context, config, pieces, adLibPieces, partDefinition, cue, shouldAdlib, adLibRank)
					// Always make an adlib for DVEs
					if (!shouldAdlib) {
						EvaluateDVE(context, config, pieces, adLibPieces, partDefinition, cue, true, adLibRank)
					}
					break
				case CueType.AdLib:
					EvaluateAdLib(context, config, adLibPieces, partDefinition.externalId, cue, partDefinition, adLibRank)
					break
				case CueType.Telefon:
					EvaluateTelefon(
						config,
						context,
						pieces,
						adLibPieces,
						partDefinition.externalId,
						partDefinition,
						cue,
						shouldAdlib,
						adLibRank
					)
					break
				case CueType.VIZ:
					EvaluateVIZ(context, config, pieces, adLibPieces, partDefinition.externalId, cue, shouldAdlib, adLibRank)
					break
				case CueType.Jingle:
					EvaluateJingle(context, config, pieces, adLibPieces, cue, partDefinition, shouldAdlib, adLibRank)
					break
				case CueType.LYD:
					EvaluateLYD(context, config, pieces, adLibPieces, cue, partDefinition, shouldAdlib, adLibRank)
					break
				case CueType.Design:
					EvaluateDesign(config, context, pieces, adLibPieces, partDefinition.externalId, cue, shouldAdlib, adLibRank)
					break
				case CueType.TargetEngine:
					EvaluateTargetEngine(context, config, pieces, adLibPieces, partDefinition.externalId, cue, shouldAdlib)
					break
				case CueType.ClearGrafiks:
					EvaluateClearGrafiks(pieces, partDefinition.externalId, cue, shouldAdlib)
					break
				default:
					if (cue.type !== CueType.Unknown && cue.type !== CueType.Profile && cue.type !== CueType.Mic) {
						// TODO: Profile -> Change the profile as defined in VIZ device settings
						// TODO: Mic -> For the future
						// context.warning(`Unimplemented cue type: ${CueType[cue.type]}`)
						assertUnreachable(cue)
					}
					break
			}
			if (shouldAdlib || cue.type === CueType.AdLib || cue.type === CueType.DVE) {
				adLibRank++
			}
		}
	}

	;[...pieces, ...adLibPieces].forEach(piece => {
		if (piece.content && piece.content.timelineObjects) {
			piece.content.timelineObjects.forEach((obj: TSRTimelineObj) => {
				if (obj.content.deviceType === DeviceType.VIZMSE) {
					if (!piece.expectedPlayoutItems) {
						piece.expectedPlayoutItems = []
					}

					if (obj.content.type === TimelineContentTypeVizMSE.ELEMENT_INTERNAL) {
						const o = obj as TimelineObjVIZMSEElementInternal
						const name = (obj as TimelineObjVIZMSEElementInternal).content.templateName
						if (name && name.length) {
							piece.expectedPlayoutItems.push({
								deviceSubType: DeviceType.VIZMSE,
								content: {
									templateName: (obj as TimelineObjVIZMSEElementInternal).content.templateName,
									templateData: (obj as TimelineObjVIZMSEElementInternal).content.templateData,
									channelName: o.content.channelName,
									rundownId: ''
								}
							})
						}
					} else if (obj.content.type === TimelineContentTypeVizMSE.ELEMENT_PILOT) {
						const name = (obj as TimelineObjVIZMSEElementPilot).content.templateVcpId
						if (name !== undefined && name.toString().length) {
							piece.expectedPlayoutItems.push({
								deviceSubType: DeviceType.VIZMSE,
								content: {
									templateName: (obj as TimelineObjVIZMSEElementPilot).content.templateVcpId,
									channelName: (obj as TimelineObjVIZMSEElementPilot).content.channelName,
									rundownId: ''
								}
							})
						}
					} else if (obj.content.type === TimelineContentTypeVizMSE.CLEAR_ALL_ELEMENTS) {
						piece.expectedPlayoutItems.push({
							deviceSubType: DeviceType.VIZMSE,
							content: {
								templateName: 'altud',
								channelName: 'OVL1',
								templateData: [],
								rundownId: ''
							}
						})
					}
				}
			})
		}
	})
}
