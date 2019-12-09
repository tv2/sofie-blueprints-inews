import {
	DeviceType,
	TimelineContentTypeVizMSE,
	TimelineObjVIZMSEElementInternal,
	TimelineObjVIZMSEElementPilot,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import {
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { assertUnreachable } from '../../../common/util'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { CueDefinition, CueDefinitionBase, CueTime, CueType } from '../../inewsConversion/converters/ParseCue'
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

const FRAME_TIME = 1000 / 25 // TODO: This should be pulled from config.

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
	// const filteredCues = cues.filter(cue => cue.type !== CueType.Grafik)
	// const grafikCues = cues.filter(cue => cue.type === CueType.Grafik)
	// const isDVE = containsDVE(cues)
	cues.forEach((cue: CueDefinition) => {
		if (cue) {
			const shouldAdlib = adlib ? true : cue.adlib ? true : false
			switch (cue.type) {
				case CueType.Grafik:
					EvaluateGrafik(
						config,
						context,
						pieces,
						adLibPieces,
						partDefinition.externalId,
						cue,
						shouldAdlib,
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
					EvaluateDVE(context, config, pieces, adLibPieces, partDefinition.externalId, cue, shouldAdlib, adLibRank)
					// Always make an adlib for DVEs
					if (!shouldAdlib) {
						EvaluateDVE(context, config, pieces, adLibPieces, partDefinition.externalId, cue, true, adLibRank)
					}
					break
				case CueType.AdLib:
					EvaluateAdLib(context, config, adLibPieces, partDefinition.externalId, cue, partDefinition, adLibRank)
					break
				case CueType.Telefon:
					EvaluateTelefon(config, context, pieces, adLibPieces, partDefinition.externalId, cue, shouldAdlib, adLibRank)
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
					EvaluateDesign(config, pieces, adLibPieces, partDefinition.externalId, cue, shouldAdlib, adLibRank)
					break
				case CueType.TargetEngine:
					EvaluateTargetEngine(context, config, pieces, adLibPieces, partDefinition.externalId, cue)
					break
				case CueType.ClearGrafiks:
					EvaluateClearGrafiks(pieces, partDefinition.externalId, cue)
					break
				default:
					if (
						cue.type !== CueType.Unknown &&
						cue.type !== CueType.Profile &&
						cue.type !== CueType.Mic &&
						cue.type !== CueType.TargetWall
					) {
						// TODO: Profile -> Change the profile as defined in VIZ device settings
						// TODO: Mic -> For the future
						// TODO: Wall -> For the future
						// context.warning(`Unimplemented cue type: ${CueType[cue.type]}`)
						assertUnreachable(cue)
					}
					break
			}
			if (shouldAdlib || cue.type === CueType.AdLib || cue.type === CueType.DVE) {
				adLibRank++
			}
		}
	})

	pieces.forEach(piece => {
		if (piece.content && piece.content.timelineObjects) {
			piece.content.timelineObjects.forEach((obj: TSRTimelineObj) => {
				if (obj.content.deviceType === DeviceType.VIZMSE) {
					if (!piece.expectedPlayoutItems) {
						piece.expectedPlayoutItems = []
					}

					if (obj.content.type === TimelineContentTypeVizMSE.ELEMENT_INTERNAL) {
						piece.expectedPlayoutItems.push({
							deviceSubType: DeviceType.VIZMSE,
							content: {
								templateName: (obj as TimelineObjVIZMSEElementInternal).content.templateName,
								templateData: (obj as TimelineObjVIZMSEElementInternal).content.templateData,
								channelName: undefined // Currently not used
							}
						})
					} else if (obj.content.type === TimelineContentTypeVizMSE.ELEMENT_PILOT) {
						piece.expectedPlayoutItems.push({
							deviceSubType: DeviceType.VIZMSE,
							content: {
								templateName: (obj as TimelineObjVIZMSEElementPilot).content.templateVcpId,
								channelName: (obj as TimelineObjVIZMSEElementPilot).content.channelName
							}
						})
					}
				}
			})
		}
	})
}

export function CreateTiming(
	cue: CueDefinition
): Pick<IBlueprintPiece, 'enable' | 'infiniteMode'> | Pick<IBlueprintAdLibPiece, 'infiniteMode' | 'expectedDuration'> {
	if (cue.adlib) {
		return CreateTimingAdLib(cue)
	} else {
		return CreateTimingEnable(cue)
	}
}

export function CreateTimingEnable(cue: CueDefinition) {
	const result: Pick<IBlueprintPiece, 'enable' | 'infiniteMode'> = {
		enable: {},
		infiniteMode: PieceLifespan.Normal
	}

	if (cue.start) {
		;(result.enable as any).start = CalculateTime(cue.start)
	} else {
		;(result.enable as any).start = 0
	}

	if (cue.end) {
		if (cue.end.infiniteMode) {
			result.infiniteMode = InfiniteMode(cue.end.infiniteMode, PieceLifespan.Normal)
		} else {
			;(result.enable as any).end = CalculateTime(cue.end)
		}
	} else {
		result.infiniteMode = PieceLifespan.OutOnNextPart
	}

	return result
}

export function CreateTimingAdLib(
	cue: CueDefinitionBase
): Pick<IBlueprintAdLibPiece, 'infiniteMode' | 'expectedDuration'> {
	const result: Pick<IBlueprintAdLibPiece, 'infiniteMode' | 'expectedDuration'> = {
		infiniteMode: PieceLifespan.OutOnNextPart,
		expectedDuration: 0
	}

	if (cue.end) {
		if (cue.end.infiniteMode) {
			result.infiniteMode = InfiniteMode(cue.end.infiniteMode, PieceLifespan.OutOnNextPart)
		} else {
			result.expectedDuration = CalculateTime(cue.end)
		}
	}

	return result
}

export function InfiniteMode(mode: 'B' | 'S' | 'O', defaultLifespan: PieceLifespan): PieceLifespan {
	switch (mode) {
		case 'B':
			return PieceLifespan.OutOnNextPart
		case 'S':
			return PieceLifespan.OutOnNextSegment
		case 'O':
			return PieceLifespan.Infinite
	}

	return defaultLifespan
}

export function CalculateTime(time: CueTime): number | undefined {
	if (time.infiniteMode) {
		return
	}

	let result = 0
	if (time.seconds) {
		result += time.seconds * 1000
	}

	if (time.frames) {
		result += time.frames * FRAME_TIME
	}

	return result
}
