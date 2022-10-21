import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext,
	IShowStyleUserContext,
	TSR
} from 'blueprints-integration'
import {
	assertUnreachable,
	CueDefinition,
	CueDefinitionAdLib,
	CueDefinitionClearGrafiks,
	CueDefinitionDVE,
	CueDefinitionEkstern,
	CueDefinitionJingle,
	CueDefinitionLYD,
	CueDefinitionRobotCamera,
	CueDefinitionTelefon,
	IsTargetingFull,
	IsTargetingOVL,
	PartDefinition
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { TV2BlueprintConfig } from './blueprintConfig'
import {
	CueDefinitionBackgroundLoop,
	CueDefinitionGraphic,
	CueDefinitionGraphicDesign,
	CueDefinitionMixMinus,
	CueDefinitionPgmClean,
	CueDefinitionRouting,
	GraphicInternalOrPilot,
	GraphicIsPilot
} from './inewsConversion'

export interface Adlib {
	rank: number
}
export interface EvaluateCuesShowstyleOptions {
	EvaluateCueGraphic?: (
		config: TV2BlueprintConfig,
		context: ISegmentUserContext,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partId: string,
		parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
		partDefinition: PartDefinition,
		adlib?: Adlib
	) => void
	EvaluateCueBackgroundLoop?: (
		config: TV2BlueprintConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partId: string,
		parsedCue: CueDefinitionBackgroundLoop,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueGraphicDesign?: (
		config: TV2BlueprintConfig,
		context: ISegmentUserContext,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partId: string,
		parsedCue: CueDefinitionGraphicDesign,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueRouting?: (
		config: TV2BlueprintConfig,
		context: ISegmentUserContext,
		pieces: IBlueprintPiece[],
		_adlibPieces: IBlueprintAdLibPiece[],
		_actions: IBlueprintActionManifest[],
		partId: string,
		parsedCue: CueDefinitionRouting
	) => void
	EvaluateCueEkstern?: (
		context: ISegmentUserContext,
		config: TV2BlueprintConfig,
		part: IBlueprintPart,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partId: string,
		parsedCue: CueDefinitionEkstern,
		partDefinition: PartDefinition,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueDVE?: (
		context: ISegmentUserContext,
		config: TV2BlueprintConfig,
		pieces: IBlueprintPiece[],
		actions: IBlueprintActionManifest[],
		partDefinition: PartDefinition,
		parsedCue: CueDefinitionDVE,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueAdLib?: (
		context: ISegmentUserContext,
		config: TV2BlueprintConfig,
		actions: IBlueprintActionManifest[],
		mediaSubscriptions: HackPartMediaObjectSubscription[],
		parsedCue: CueDefinitionAdLib,
		partDefinition: PartDefinition,
		rank: number
	) => Promise<void>
	EvaluateCueTelefon?: (
		config: TV2BlueprintConfig,
		context: ISegmentUserContext,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partId: string,
		partDefinition: PartDefinition,
		parsedCue: CueDefinitionTelefon,
		adlib?: Adlib
	) => void
	EvaluateCueJingle?: (
		context: ISegmentUserContext,
		config: TV2BlueprintConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		parsedCue: CueDefinitionJingle,
		part: PartDefinition,
		adlib?: boolean,
		rank?: number,
		effekt?: boolean
	) => void
	EvaluateCueLYD?: (
		context: ISegmentUserContext,
		config: TV2BlueprintConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		parsedCue: CueDefinitionLYD,
		part: PartDefinition,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueClearGrafiks?: (
		config: TV2BlueprintConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partId: string,
		parsedCue: CueDefinitionClearGrafiks,
		shouldAdlib: boolean
	) => void
	EvaluateCuePgmClean?: (
		context: ISegmentUserContext,
		config: TV2BlueprintConfig,
		pieces: IBlueprintPiece[],
		partId: string,
		parsedCue: CueDefinitionPgmClean
	) => void
	EvaluateCueMixMinus?: (
		context: ISegmentUserContext,
		config: TV2BlueprintConfig,
		pieces: IBlueprintPiece[],
		part: PartDefinition,
		parsedCue: CueDefinitionMixMinus
	) => void
	/** TODO: Profile -> Change the profile as defined in VIZ device settings */
	EvaluateCueProfile?: () => void
	/** TODO: Mic -> For the future */
	EvaluateCueMic?: () => void
	EvaluateCueRobotCamera?: (
		context: IShowStyleUserContext,
		cueDefinition: CueDefinitionRobotCamera,
		pieces: IBlueprintPiece[],
		partId: string
	) => void
}

export interface EvaluateCuesOptions {
	/** Whether to create cues as adlibs. */
	adlib?: boolean
	/** Whether the parent part is a graphic part. */
	isGrafikPart?: boolean
	/** Passing this arguments sets the types of cues to evaluate. */
	selectedCueTypes?: CueType[]
	/** Don't evaluate adlibs. */
	excludeAdlibs?: boolean
	/** Only evaluate adlibs. */
	adlibsOnly?: boolean
}

export async function EvaluateCuesBase(
	showStyleOptions: EvaluateCuesShowstyleOptions,
	context: ISegmentUserContext,
	config: TV2BlueprintConfig,
	part: IBlueprintPart,
	pieces: IBlueprintPiece[],
	adLibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	mediaSubscriptions: HackPartMediaObjectSubscription[],
	cues: CueDefinition[],
	partDefinition: PartDefinition,
	options: EvaluateCuesOptions
) {
	let adLibRank = 0

	for (const cue of cues) {
		if (cue && !SkipCue(cue, options.selectedCueTypes, options.excludeAdlibs, options.adlibsOnly)) {
			const shouldAdlib = options.adlib || cue.adlib ? true : false
			const adlib = shouldAdlib ? { rank: adLibRank } : undefined

			switch (cue.type) {
				case CueType.Graphic:
					if (showStyleOptions.EvaluateCueGraphic) {
						if (
							config.studio.PreventOverlayWithFull &&
							GraphicIsPilot(cue) &&
							IsTargetingOVL(cue.target) &&
							cues.some(c => c.type === CueType.Graphic && GraphicIsPilot(c) && IsTargetingFull(c.target))
						) {
							context.notifyUserWarning(`Cannot create overlay graphic with FULL`)
							break
						}
						showStyleOptions.EvaluateCueGraphic(
							config,
							context,
							pieces,
							adLibPieces,
							actions,
							partDefinition.externalId,
							cue,
							partDefinition,
							adlib
						)
					}
					break
				case CueType.Ekstern:
					if (showStyleOptions.EvaluateCueEkstern) {
						showStyleOptions.EvaluateCueEkstern(
							context,
							config,
							part,
							pieces,
							adLibPieces,
							actions,
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
							actions,
							partDefinition,
							cue,
							shouldAdlib,
							adLibRank
						)
						// Always make an adlib for DVEs
						if (!shouldAdlib) {
							showStyleOptions.EvaluateCueDVE(context, config, pieces, actions, partDefinition, cue, true, adLibRank)
						}
					}
					break
				case CueType.AdLib:
					if (showStyleOptions.EvaluateCueAdLib) {
						await showStyleOptions.EvaluateCueAdLib(
							context,
							config,
							actions,
							mediaSubscriptions,
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
							actions,
							partDefinition.externalId,
							partDefinition,
							cue,
							adlib
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
							actions,
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
							actions,
							cue,
							partDefinition,
							shouldAdlib,
							adLibRank
						)
					}
					break
				case CueType.GraphicDesign:
					if (showStyleOptions.EvaluateCueGraphicDesign) {
						showStyleOptions.EvaluateCueGraphicDesign(
							config,
							context,
							pieces,
							adLibPieces,
							actions,
							partDefinition.externalId,
							cue,
							shouldAdlib,
							adLibRank
						)
					}
					break
				case CueType.ClearGrafiks:
					if (showStyleOptions.EvaluateCueClearGrafiks) {
						showStyleOptions.EvaluateCueClearGrafiks(
							config,
							pieces,
							adLibPieces,
							actions,
							partDefinition.externalId,
							cue,
							shouldAdlib
						)
					}
					break
				case CueType.BackgroundLoop:
					if (showStyleOptions.EvaluateCueBackgroundLoop) {
						showStyleOptions.EvaluateCueBackgroundLoop(
							config,
							pieces,
							adLibPieces,
							actions,
							partDefinition.externalId,
							cue,
							shouldAdlib,
							adLibRank
						)
					}
					break
				case CueType.Routing:
					if (showStyleOptions.EvaluateCueRouting) {
						showStyleOptions.EvaluateCueRouting(
							config,
							context,
							pieces,
							adLibPieces,
							actions,
							partDefinition.externalId,
							cue
						)
					}
					break
				case CueType.PgmClean:
					if (showStyleOptions.EvaluateCuePgmClean) {
						showStyleOptions.EvaluateCuePgmClean(context, config, pieces, partDefinition.externalId, cue)
					}
					break
				case CueType.MixMinus:
					if (showStyleOptions.EvaluateCueMixMinus) {
						showStyleOptions.EvaluateCueMixMinus(context, config, pieces, partDefinition, cue)
					}
					break
				case CueType.UNPAIRED_TARGET:
					context.notifyUserWarning(`No graphic found after ${cue.iNewsCommand} cue`)
					break
				case CueType.UNPAIRED_PILOT:
					context.notifyUserWarning(`Graphic found without target engine`)
					break
				case CueType.RobotCamera:
					if (showStyleOptions.EvaluateCueRobotCamera) {
						showStyleOptions.EvaluateCueRobotCamera(context, cue, pieces, partDefinition.externalId)
					}
					break
				default:
					if (cue.type !== CueType.Profile && cue.type !== CueType.Mic && cue.type !== CueType.UNKNOWN) {
						// TODO: Profile -> Change the profile as defined in VIZ device settings
						// TODO: Mic -> For the future
						// context.notifyUserWarning(`Unimplemented cue type: ${CueType[cue.type]}`)
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
									channel: o.content.channelName,
									showId: o.content.showId
								}
							})
						}
					} else if (obj.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT) {
						const name = (obj as TSR.TimelineObjVIZMSEElementPilot).content.templateVcpId
						if (name !== undefined && name.toString().length) {
							piece.expectedPlayoutItems.push({
								deviceSubType: TSR.DeviceType.VIZMSE,
								content: {
									vcpid: (obj as TSR.TimelineObjVIZMSEElementPilot).content.templateVcpId,
									channel: (obj as TSR.TimelineObjVIZMSEElementPilot).content.channelName
								}
							})
						}
					} else if (obj.content.type === TSR.TimelineContentTypeVizMSE.CLEAR_ALL_ELEMENTS) {
						piece.expectedPlayoutItems.push({
							deviceSubType: TSR.DeviceType.VIZMSE,
							content: {
								templateName: 'altud',
								channel: 'OVL1',
								templateData: [],
								showId: config.selectedGraphicsSetup.OvlShowName
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
