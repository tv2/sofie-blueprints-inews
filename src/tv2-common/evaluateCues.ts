import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	SegmentContext,
	TSR
} from '@sofie-automation/blueprints-integration'
import {
	assertUnreachable,
	CueDefinition,
	CueDefinitionAdLib,
	CueDefinitionClearGrafiks,
	CueDefinitionDVE,
	CueDefinitionEkstern,
	CueDefinitionJingle,
	CueDefinitionLYD,
	CueDefinitionTelefon,
	PartDefinition
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { TV2BlueprintConfig } from './blueprintConfig'
import {
	CueDefinitionBackgroundLoop,
	CueDefinitionGraphic,
	CueDefinitionGraphicDesign,
	CueDefinitionRouting,
	GraphicInternalOrPilot,
	GraphicIsPilot
} from './inewsConversion'

export interface EvaluateCuesShowstyleOptions {
	EvaluateCueGraphic?: (
		config: TV2BlueprintConfig,
		context: SegmentContext,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partId: string,
		parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
		adlib: boolean,
		partDefinition: PartDefinition,
		rank?: number
	) => void
	EvaluateCueBackgroundLoop?: (
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
		context: SegmentContext,
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
		context: SegmentContext,
		pieces: IBlueprintPiece[],
		_adlibPieces: IBlueprintAdLibPiece[],
		_actions: IBlueprintActionManifest[],
		partId: string,
		parsedCue: CueDefinitionRouting
	) => void
	EvaluateCueEkstern?: (
		context: SegmentContext,
		config: TV2BlueprintConfig,
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
		context: SegmentContext,
		config: TV2BlueprintConfig,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partDefinition: PartDefinition,
		parsedCue: CueDefinitionDVE,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueAdLib?: (
		context: SegmentContext,
		config: TV2BlueprintConfig,
		adLibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		mediaSubscriptions: HackPartMediaObjectSubscription[],
		partId: string,
		parsedCue: CueDefinitionAdLib,
		partDefinition: PartDefinition,
		rank: number
	) => void
	EvaluateCueTelefon?: (
		config: TV2BlueprintConfig,
		context: SegmentContext,
		pieces: IBlueprintPiece[],
		adlibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		partId: string,
		partDefinition: PartDefinition,
		parsedCue: CueDefinitionTelefon,
		adlib?: boolean,
		rank?: number
	) => void
	EvaluateCueJingle?: (
		context: SegmentContext,
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
		context: SegmentContext,
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
	/** TODO: Profile -> Change the profile as defined in VIZ device settings */
	EvaluateCueProfile?: () => void
	/** TODO: Mic -> For the future */
	EvaluateCueMic?: () => void
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

export function EvaluateCuesBase(
	showStyleOptions: EvaluateCuesShowstyleOptions,
	context: SegmentContext,
	config: TV2BlueprintConfig,
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
			const shouldAdlib = /* config.showStyle.IsOfftube || */ options.adlib ? true : cue.adlib ? true : false

			switch (cue.type) {
				case CueType.Graphic:
					if (showStyleOptions.EvaluateCueGraphic) {
						if (
							config.studio.PreventOverlayWithFull &&
							GraphicIsPilot(cue) &&
							cue.target === 'OVL' &&
							cues.some(c => c.type === CueType.Graphic && GraphicIsPilot(c) && c.target === 'FULL')
						) {
							context.warning(`Cannot create overlay graphic with FULL`)
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
							shouldAdlib,
							partDefinition,
							adLibRank
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
							mediaSubscriptions,
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
							actions,
							partDefinition.externalId,
							partDefinition,
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
				case CueType.UNPAIRED_TARGET:
					context.warning(`No graphic found after ${cue.iNewsCommand} cue`)
					break
				case CueType.UNPAIRED_PILOT:
					context.warning(`Graphic found without target engine`)
					break
				default:
					if (cue.type !== CueType.Profile && cue.type !== CueType.Mic && cue.type !== CueType.UNKNOWN) {
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
									rundownId: context.rundownId,
									playlistId: ''
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
									rundownId: context.rundownId,
									playlistId: ''
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
								rundownId: context.rundownId,
								playlistId: ''
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
