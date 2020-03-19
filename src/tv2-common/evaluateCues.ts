import {
	DeviceType,
	TimelineContentTypeVizMSE,
	TimelineObjVIZMSEElementInternal,
	TimelineObjVIZMSEElementPilot,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { IBlueprintAdLibPiece, IBlueprintPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import {
	assertUnreachable,
	CueDefinition,
	CueDefinitionAdLib,
	CueDefinitionClearGrafiks,
	CueDefinitionDesign,
	CueDefinitionDVE,
	CueDefinitionEkstern,
	CueDefinitionGrafik,
	CueDefinitionJingle,
	CueDefinitionLYD,
	CueDefinitionMOS,
	CueDefinitionTargetEngine,
	CueDefinitionTelefon,
	CueDefinitionVIZ,
	IBlueprintAdLibPieceEPI,
	IBlueprintPieceEPI,
	PartDefinition,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { VizEngine } from '../types/constants'

export interface EvaluateCuesShowstyleOptions<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
> {
	EvaluateCueGrafik?: (
		config: ShowStyleConfig,
		context: PartContext,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		parsedCue: CueDefinitionGrafik,
		engine: VizEngine, // TODO: Generic name for offtubes?
		adlib: boolean,
		partDefinition?: PartDefinition,
		isTlfPrimary?: boolean,
		rank?: number
	) => void
	EvaluateCueMOS?: (
		config: ShowStyleConfig,
		context: PartContext,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		parsedCue: CueDefinitionMOS,
		engine: VizEngine,
		adlib?: boolean,
		isTlf?: boolean,
		rank?: number,
		isGrafikPart?: boolean,
		overrideOverlay?: boolean
	) => void
	EvaluateCueEkstern?: (
		context: PartContext,
		config: ShowStyleConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		parsedCue: CueDefinitionEkstern,
		partDefinition: PartDefinition,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueDVE?: (
		context: PartContext,
		config: ShowStyleConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partDefinition: PartDefinition,
		parsedCue: CueDefinitionDVE,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueAdLib?: (
		context: PartContext,
		config: ShowStyleConfig,
		adLibPieces: IBlueprintAdLibPiece[],
		partId: string,
		parsedCue: CueDefinitionAdLib,
		partDefinition: PartDefinition,
		rank: number
	) => void
	EvaluateCueTelefon?: (
		config: ShowStyleConfig,
		context: PartContext,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		partDefinition: PartDefinition,
		parsedCue: CueDefinitionTelefon,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueVIZ?: (
		context: PartContext,
		config: ShowStyleConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		parsedCue: CueDefinitionVIZ,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueJingle?: (
		context: PartContext,
		config: ShowStyleConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		parsedCue: CueDefinitionJingle,
		part: PartDefinition,
		adlib?: boolean,
		rank?: number,
		effekt?: boolean
	) => void
	EvaluateCueLYD?: (
		context: PartContext,
		config: ShowStyleConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		parsedCue: CueDefinitionLYD,
		part: PartDefinition,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueDesign?: (
		config: ShowStyleConfig,
		context: PartContext,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		parsedCue: CueDefinitionDesign,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueTargetEngine?: (
		context: PartContext,
		config: ShowStyleConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		partDefinition: PartDefinition,
		parsedCue: CueDefinitionTargetEngine,
		adlib: boolean
	) => void
	EvaluateCueClearGrafiks?: (
		pieces: IBlueprintPiece[],
		partId: string,
		parsedCue: CueDefinitionClearGrafiks,
		shouldAdlib: boolean
	) => void
	/** TODO: Profile -> Change the profile as defined in VIZ device settings */
	EvaluateCueProfile?: () => void
	/** TODO: Mic -> For the future */
	EvaluateCueMic?: () => void
	/** Should never be used */
	EvaluateCueUnknown?: () => void
}

export function EvaluateCues<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	showStyleOptions: EvaluateCuesShowstyleOptions<StudioConfig, ShowStyleConfig>,
	context: PartContext,
	config: ShowStyleConfig,
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
			const shouldAdlib = /* config.showStyle.IsOfftube || */ adlib ? true : cue.adlib ? true : false

			switch (cue.type) {
				case CueType.Grafik:
					if (showStyleOptions.EvaluateCueGrafik) {
						showStyleOptions.EvaluateCueGrafik(
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
					}
					break
				case CueType.MOS:
					if (showStyleOptions.EvaluateCueMOS) {
						showStyleOptions.EvaluateCueMOS(
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
					}
					break
				case CueType.Ekstern:
					if (showStyleOptions.EvaluateCueEkstern) {
						showStyleOptions.EvaluateCueEkstern(
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
					}
					break
				case CueType.DVE:
					if (showStyleOptions.EvaluateCueDVE) {
						showStyleOptions.EvaluateCueDVE(
							context,
							config,
							pieces,
							adLibPieces,
							partDefinition,
							cue,
							shouldAdlib,
							adLibRank
						)
						// Always make an adlib for DVEs
						if (!shouldAdlib) {
							showStyleOptions.EvaluateCueDVE(
								context,
								config,
								pieces,
								adLibPieces,
								partDefinition,
								cue,
								true,
								adLibRank
							)
						}
					}
					break
				case CueType.AdLib:
					if (showStyleOptions.EvaluateCueAdLib) {
						showStyleOptions.EvaluateCueAdLib(
							context,
							config,
							adLibPieces,
							partDefinition.externalId,
							cue,
							partDefinition,
							adLibRank
						)
					}
					break
				case CueType.Telefon:
					if (showStyleOptions.EvaluateCueTelefon) {
						showStyleOptions.EvaluateCueTelefon(
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
					}
					break
				case CueType.VIZ:
					if (showStyleOptions.EvaluateCueVIZ) {
						showStyleOptions.EvaluateCueVIZ(
							context,
							config,
							pieces,
							adLibPieces,
							partDefinition.externalId,
							cue,
							shouldAdlib,
							adLibRank
						)
					}
					break
				case CueType.Jingle:
					if (showStyleOptions.EvaluateCueJingle) {
						showStyleOptions.EvaluateCueJingle(
							context,
							config,
							pieces,
							adLibPieces,
							cue,
							partDefinition,
							shouldAdlib,
							adLibRank
						)
					}
					break
				case CueType.LYD:
					if (showStyleOptions.EvaluateCueLYD) {
						showStyleOptions.EvaluateCueLYD(
							context,
							config,
							pieces,
							adLibPieces,
							cue,
							partDefinition,
							shouldAdlib,
							adLibRank
						)
					}
					break
				case CueType.Design:
					if (showStyleOptions.EvaluateCueDesign) {
						showStyleOptions.EvaluateCueDesign(
							config,
							context,
							pieces,
							adLibPieces,
							partDefinition.externalId,
							cue,
							shouldAdlib,
							adLibRank
						)
					}
					break
				case CueType.TargetEngine:
					if (showStyleOptions.EvaluateCueTargetEngine) {
						showStyleOptions.EvaluateCueTargetEngine(
							context,
							config,
							pieces,
							adLibPieces,
							partDefinition.externalId,
							partDefinition,
							cue,
							shouldAdlib
						)
					}
					break
				case CueType.ClearGrafiks:
					if (showStyleOptions.EvaluateCueClearGrafiks) {
						showStyleOptions.EvaluateCueClearGrafiks(pieces, partDefinition.externalId, cue, shouldAdlib)
					}
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
