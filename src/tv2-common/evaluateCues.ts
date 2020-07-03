import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
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
	PartContext2,
	PartDefinition,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { CueType, GraphicEngine } from 'tv2-constants'

export interface EvaluateCuesShowstyleOptions<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
> {
	EvaluateCueGrafik?: (
		config: ShowStyleConfig,
		context: PartContext2,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		parsedCue: CueDefinitionGrafik,
		engine: GraphicEngine, // TODO: Generic name for offtubes?
		adlib: boolean,
		partDefinition?: PartDefinition,
		isTlfPrimary?: boolean,
		rank?: number
	) => void
	EvaluateCueMOS?: (
		config: ShowStyleConfig,
		context: PartContext2,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		parsedCue: CueDefinitionMOS,
		engine: GraphicEngine,
		adlib?: boolean,
		isTlf?: boolean,
		rank?: number,
		isGrafikPart?: boolean,
		overrideOverlay?: boolean
	) => void
	EvaluateCueEkstern?: (
		context: PartContext2,
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
		context: PartContext2,
		config: ShowStyleConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partDefinition: PartDefinition,
		parsedCue: CueDefinitionDVE,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueAdLib?: (
		context: PartContext2,
		config: ShowStyleConfig,
		adLibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partId: string,
		parsedCue: CueDefinitionAdLib,
		partDefinition: PartDefinition,
		rank: number
	) => void
	EvaluateCueTelefon?: (
		config: ShowStyleConfig,
		context: PartContext2,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		partDefinition: PartDefinition,
		parsedCue: CueDefinitionTelefon,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueVIZ?: (
		context: PartContext2,
		config: ShowStyleConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		parsedCue: CueDefinitionVIZ,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueJingle?: (
		context: PartContext2,
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
		context: PartContext2,
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
		context: PartContext2,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		parsedCue: CueDefinitionDesign,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueTargetEngine?: (
		context: PartContext2,
		config: ShowStyleConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		partId: string,
		partDefinition: PartDefinition,
		parsedCue: CueDefinitionTargetEngine,
		adlib: boolean
	) => void
	EvaluateCueClearGrafiks?: (
		config: ShowStyleConfig,
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

export interface EvaluateCuesOptions {
	/** Whether to create cues as adlibs. */
	adlib?: boolean
	/** Whether the parent part is a graphic part. */
	isGrafikPart?: boolean
	/** Passing this arguments sets the types of cues to evaluate. */
	selectedCueTypes?: CueType[] | undefined
	/** Don't evaluate adlibs. */
	excludeAdlibs?: boolean
	/** Only evaluate adlibs. */
	adlibsOnly?: boolean
}

export function EvaluateCuesBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	showStyleOptions: EvaluateCuesShowstyleOptions<StudioConfig, ShowStyleConfig>,
	context: PartContext2,
	config: ShowStyleConfig,
	pieces: IBlueprintPieceEPI[],
	adLibPieces: IBlueprintAdLibPieceEPI[],
	actions: IBlueprintActionManifest[],
	cues: CueDefinition[],
	partDefinition: PartDefinition,
	options: EvaluateCuesOptions
) {
	let adLibRank = 0

	for (const cue of cues) {
		if (cue && !SkipCue(cue, options.selectedCueTypes, options.excludeAdlibs, options.adlibsOnly)) {
			const shouldAdlib = /* config.showStyle.IsOfftube || */ options.adlib ? true : cue.adlib ? true : false

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
							options.isGrafikPart
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
							actions,
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
								actions,
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
							actions,
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
						showStyleOptions.EvaluateCueClearGrafiks(config, pieces, partDefinition.externalId, cue, shouldAdlib)
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
			piece.content.timelineObjects.forEach((obj: TSR.TSRTimelineObj) => {
				if (obj.content.deviceType === TSR.DeviceType.VIZMSE) {
					if (!piece.expectedPlayoutItems) {
						piece.expectedPlayoutItems = []
					}

					if (obj.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL) {
						const o = obj as TSR.TimelineObjVIZMSEElementInternal
						const name = (obj as TSR.TimelineObjVIZMSEElementInternal).content.templateName
						if (name && name.length) {
							piece.expectedPlayoutItems.push({
								deviceSubType: TSR.DeviceType.VIZMSE,
								content: {
									templateName: (obj as TSR.TimelineObjVIZMSEElementInternal).content.templateName,
									templateData: (obj as TSR.TimelineObjVIZMSEElementInternal).content.templateData,
									channelName: o.content.channelName,
									rundownId: ''
								}
							})
						}
					} else if (obj.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT) {
						const name = (obj as TSR.TimelineObjVIZMSEElementPilot).content.templateVcpId
						if (name !== undefined && name.toString().length) {
							piece.expectedPlayoutItems.push({
								deviceSubType: TSR.DeviceType.VIZMSE,
								content: {
									templateName: (obj as TSR.TimelineObjVIZMSEElementPilot).content.templateVcpId,
									channelName: (obj as TSR.TimelineObjVIZMSEElementPilot).content.channelName,
									rundownId: ''
								}
							})
						}
					} else if (obj.content.type === TSR.TimelineContentTypeVizMSE.CLEAR_ALL_ELEMENTS) {
						piece.expectedPlayoutItems.push({
							deviceSubType: TSR.DeviceType.VIZMSE,
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

export function SkipCue(
	cue: CueDefinition,
	selectedCueTypes?: CueType[] | undefined,
	excludeAdlibs?: boolean,
	adlibsOnly?: boolean
): boolean {
	if (excludeAdlibs === true && cue.adlib) {
		return true
	}

	if (adlibsOnly === true && !cue.adlib) {
		return true
	}

	if (selectedCueTypes && !selectedCueTypes.includes(cue.type)) {
		return true
	}

	return false
}
