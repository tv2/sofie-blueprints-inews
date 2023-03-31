import {
	CameraContent,
	GraphicsContent,
	IShowStyleUserContext,
	RemoteContent,
	SourceLayerType,
	SplitsContent,
	SplitsContentBoxProperties,
	TSR,
	VTContent,
	WithTimeline
} from 'blueprints-integration'
import {
	CueDefinitionDVE,
	DVEConfigInput,
	DVESources,
	findDskFullGfx,
	findSourceInfo,
	getMixMinusTimelineObject,
	joinAssetToFolder,
	literal,
	MixMinusPriority,
	PartDefinition,
	PieceMetaData,
	ShowStyleContext,
	SpecialInput,
	TransitionStyle,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { ControlClasses, MEDIA_PLAYER_AUTO, SharedGraphicLLayer, SourceType } from 'tv2-constants'
import * as _ from 'underscore'
import { ActionSelectDVE } from '../actions'
import {
	CreateHTMLRendererContent,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForFull,
	GetSisyfosTimelineObjForRemote,
	GetSisyfosTimelineObjForReplay
} from '../helpers'
import { SourceDefinition } from '../inewsConversion'
import { EnableServer } from './server'

export interface DVEConfigBox {
	enabled: boolean
	source: number
	x: number
	y: number
	size: number
	cropped: boolean
	cropTop: number
	cropBottom: number
	cropLeft: number
	cropRight: number
}

export interface DVEConfig {
	boxes: {
		[key: number]: DVEConfigBox
	}
	index: number
	properties?: {
		artFillSource: number
		artCutSource: number
		artOption: number
		artPreMultiplied: boolean
		artClip: number
		artGain: number
		artInvertKey: boolean
	}
	border?: {
		borderEnabled: boolean
		borderBevel: number
		borderOuterWidth: number
		borderInnerWidth: number
		borderOuterSoftness: number
		borderInnerSoftness: number
		borderBevelSoftness: number
		borderBevelPosition: number
		borderHue: number
		borderSaturation: number
		borderLuma: number
		borderLightSourceDirection: number
		borderLightSourceAltitude: number
	}
}

export interface DVELayers {
	CASPAR: {
		CGDVEKey: string
		CGDVEFrame: string
	}
	SisyfosLLayer: {
		ClipPending: string
		StudioMics: string
	}
	CasparLLayer: {
		ClipPending: string
	}
}

export interface DVEPieceMetaData extends PieceMetaData {
	config: DVEConfigInput
	sources: DVESources
	userData: ActionSelectDVE
	mediaPlayerSessions?: string[] // TODO: Should probably move to a ServerPieceMetaData
	serverPlaybackTiming?: Array<{ start?: number; end?: number }>
}

export interface DVEOptions {
	dveLayers: DVELayers
}

type BoxConfig = DVEConfigBox & { source: number }
type BoxSources = Array<(VTContent | CameraContent | RemoteContent | GraphicsContent) & SplitsContentBoxProperties>

export function MakeContentDVEBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ShowStyleContext<ShowStyleConfig>,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	dveConfig: DVEConfigInput | undefined,
	dveGeneratorOptions: DVEOptions
): { content: WithTimeline<SplitsContent>; valid: boolean } {
	if (!dveConfig) {
		context.core.notifyUserWarning(`DVE ${parsedCue.template} is not configured`)
		return {
			valid: false,
			content: {
				boxSourceConfiguration: [],
				timelineObjects: []
			}
		}
	}

	const graphicsTemplateContent: { [key: string]: string } = {}
	parsedCue.labels.forEach((label, i) => {
		graphicsTemplateContent[`${i}`] = label
	})

	return MakeContentDVE2(
		context,
		dveConfig,
		graphicsTemplateContent,
		parsedCue.sources,
		dveGeneratorOptions,
		partDefinition.segmentExternalId
	)
}

export function MakeContentDVE2<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ShowStyleContext<ShowStyleConfig>,
	dveConfig: DVEConfigInput,
	graphicsTemplateContent: { [key: string]: string },
	sources: DVESources | undefined,
	dveGeneratorOptions: DVEOptions,
	mediaPlayerSessionId?: string
): { content: WithTimeline<SplitsContent>; valid: boolean } {
	let template: DVEConfig
	try {
		template = JSON.parse(dveConfig.DVEJSON) as DVEConfig
	} catch (e) {
		context.core.notifyUserWarning(`DVE Config JSON is not valid for ${dveConfig.DVEName}`)
		return {
			valid: false,
			content: {
				boxSourceConfiguration: [],
				timelineObjects: []
			}
		}
	}

	const inputs = dveConfig.DVEInputs
		? dveConfig.DVEInputs.toString().split(';')
		: '1:INP1;2:INP2;3:INP3;4:INP4'.split(';')

	const boxAssigments = makeBoxAssignments(inputs, context.core, sources)

	const boxes: BoxConfig[] = Object.entries(template.boxes).map(([_num, box]) => ({
		...box,
		source: context.config.studio.SwitcherSource.Default
	}))
	const dveTimeline: TSR.TSRTimelineObj[] = []
	const boxSources: BoxSources = []
	const cameraSources: number[] = []

	let valid = true
	let hasServer = false

	boxAssigments.forEach((mappingFrom, num) => {
		const box = boxes[num]
		if (mappingFrom === undefined) {
			if (sources) {
				// If it is intentional there are no sources, then ignore
				// TODO - should this warn?
				context.core.notifyUserWarning(`Missing source type for DVE box: ${num + 1}`)
				setBoxToBlack(box, boxSources)
				valid = false
			}
		} else {
			const audioEnable: TSR.Timeline.TimelineEnable = {
				while: `1`
			}
			switch (mappingFrom.sourceType) {
				case SourceType.DEFAULT:
					setBoxSource(box, boxSources, {
						sourceLayerType: SourceLayerType.UNKNOWN,
						port: context.config.studio.SwitcherSource.Default
					})
					break
				case SourceType.KAM:
					const sourceInfoCam = findSourceInfo(context.config.sources, mappingFrom)
					if (sourceInfoCam === undefined) {
						context.core.notifyUserWarning(`Invalid source: ${mappingFrom.raw}`)
						setBoxToBlack(box, boxSources)
						valid = false
						return
					}

					setBoxSource(box, boxSources, sourceInfoCam)
					cameraSources.push(box.source)
					dveTimeline.push(
						...GetSisyfosTimelineObjForCamera(context.config, sourceInfoCam, mappingFrom.minusMic, audioEnable)
					)
					break
				case SourceType.REMOTE:
					const sourceInfoLive = findSourceInfo(context.config.sources, mappingFrom)
					if (sourceInfoLive === undefined) {
						context.core.notifyUserWarning(`Invalid source: ${mappingFrom.raw}`)
						setBoxToBlack(box, boxSources)
						valid = false
						return
					}

					setBoxSource(box, boxSources, sourceInfoLive)
					dveTimeline.push(...GetSisyfosTimelineObjForRemote(context.config, sourceInfoLive, audioEnable))
					break
				case SourceType.REPLAY:
					const sourceInfoReplay = findSourceInfo(context.config.sources, mappingFrom)
					if (sourceInfoReplay === undefined) {
						context.core.notifyUserWarning(`Invalid source: ${mappingFrom.raw}`)
						setBoxToBlack(box, boxSources)
						valid = false
						return
					}

					setBoxSource(box, boxSources, sourceInfoReplay)
					dveTimeline.push(...GetSisyfosTimelineObjForReplay(context.config, sourceInfoReplay, mappingFrom.vo))
					break
				case SourceType.GRAFIK:
					if (mappingFrom.name === 'FULL') {
						setBoxSource(box, boxSources, {
							sourceLayerType: SourceLayerType.GRAPHICS,
							port: findDskFullGfx(context.config).Fill
						})
						dveTimeline.push(...GetSisyfosTimelineObjForFull(context.config))
					} else {
						context.core.notifyUserWarning(`Unsupported engine for DVE: ${mappingFrom.name}`)
						setBoxToBlack(box, boxSources)
					}
					break
				case SourceType.SERVER:
					hasServer = true
					setBoxSource(box, boxSources, {
						sourceLayerType: SourceLayerType.VT,
						port: SpecialInput.AB_PLACEHOLDER
					})
					break
			}
		}
	})

	let graphicsTemplateStyle: any = ''
	try {
		if (dveConfig.DVEGraphicsTemplateJSON) {
			graphicsTemplateStyle = JSON.parse(dveConfig.DVEGraphicsTemplateJSON.toString())
		}
	} catch {
		context.core.notifyUserWarning(`DVE Graphics Template JSON is not valid for ${dveConfig.DVEName}`)
	}

	let keyFile = dveConfig.DVEGraphicsKey ? dveConfig.DVEGraphicsKey.toString() : undefined
	let frameFile = dveConfig.DVEGraphicsFrame ? dveConfig.DVEGraphicsFrame.toString() : undefined

	if (keyFile) {
		keyFile = joinAssetToFolder(context.config.studio.DVEFolder, keyFile)
	}

	if (frameFile) {
		frameFile = joinAssetToFolder(context.config.studio.DVEFolder, frameFile)
	}

	if (cameraSources.length === 1) {
		dveTimeline.push(getMixMinusTimelineObject(context, cameraSources[0], MixMinusPriority.CUSTOM_INPUT))
	}

	return {
		valid,
		content: literal<WithTimeline<SplitsContent>>({
			boxSourceConfiguration: boxSources,
			timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
				// setup ssrc
				...context.videoSwitcher.getDveTimelineObjects({
					priority: 1,
					content: {
						boxes,
						template,
						artFillSource: context.config.studio.SwitcherSource.SplitArtFill,
						artCutSource: context.config.studio.SwitcherSource.SplitArtKey
					},
					metaData: {
						mediaPlayerSession: hasServer ? mediaPlayerSessionId ?? MEDIA_PLAYER_AUTO : undefined
					}
				}),
				...context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
					enable: { start: context.config.studio.CasparPrerollDuration },
					priority: 1,
					content: {
						input: SpecialInput.DVE,
						transition: TransitionStyle.CUT
					},
					classes: [ControlClasses.OVERRIDDEN_ON_MIX_MINUS]
				}),
				literal<TSR.TimelineObjCCGTemplate>({
					id: '',
					enable: { start: 0 },
					priority: 1,
					layer: SharedGraphicLLayer.GraphicLLayerLocators,
					content: CreateHTMLRendererContent(context.config, 'locators', {
						...graphicsTemplateContent,
						style: graphicsTemplateStyle ?? {}
					})
				}),
				...(keyFile
					? [
							literal<TSR.TimelineObjCCGMedia>({
								id: '',
								enable: { start: 0 },
								priority: 1,
								layer: dveGeneratorOptions.dveLayers.CASPAR.CGDVEKey,
								content: {
									deviceType: TSR.DeviceType.CASPARCG,
									type: TSR.TimelineContentTypeCasparCg.MEDIA,
									file: keyFile,
									mixer: {
										keyer: true
									},
									loop: true
								}
							})
					  ]
					: []),
				...(frameFile
					? [
							literal<TSR.TimelineObjCCGMedia>({
								id: '',
								enable: { start: 0 },
								priority: 1,
								layer: dveGeneratorOptions.dveLayers.CASPAR.CGDVEFrame,
								content: {
									deviceType: TSR.DeviceType.CASPARCG,
									type: TSR.TimelineContentTypeCasparCg.MEDIA,
									file: frameFile,
									loop: true
								}
							})
					  ]
					: []),
				...(hasServer && mediaPlayerSessionId ? [EnableServer(mediaPlayerSessionId)] : []),
				...dveTimeline
			])
		})
	}
}

const setBoxSource = (
	boxConfig: BoxConfig,
	boxSources: BoxSources,
	sourceInfo: { port: number; sourceLayerType: SourceLayerType }
) => {
	if (boxConfig) {
		boxConfig.source = sourceInfo.port

		boxSources.push({
			...boxSource(sourceInfo),
			...literal<CameraContent | RemoteContent>({
				studioLabel: '',
				switcherInput: sourceInfo.port
			})
		})
	}
}

const setBoxToBlack = (boxConfig: BoxConfig, boxSources: BoxSources) => {
	setBoxSource(boxConfig, boxSources, {
		port: SpecialInput.BLACK,
		sourceLayerType: SourceLayerType.UNKNOWN
	})
}

function makeBoxAssignments(inputs: string[], context: IShowStyleUserContext, sources: DVESources | undefined) {
	const boxAssignments: Array<SourceDefinition | undefined> = []
	inputs.forEach(source => {
		const sourceProps = source.split(':')
		const fromCue = sourceProps[1]
		const targetBox = Number(sourceProps[0])
		if (!fromCue || !targetBox || isNaN(targetBox)) {
			context.notifyUserWarning(`Invalid DVE mapping: ${sourceProps}`)
			return
		}

		if (!sources) {
			// Need something to keep the layout etc
			boxAssignments[targetBox - 1] = undefined
			return
		}

		const prop = sources[fromCue as keyof DVESources]
		if (prop) {
			boxAssignments[targetBox - 1] = prop
			return
		}

		context.notifyUserWarning(`Missing mapping for ${targetBox}`)
		boxAssignments[targetBox - 1] = undefined
	})
	return boxAssignments
}

function boxSource(info: {
	port: number
	sourceLayerType: SourceLayerType
}): {
	switcherInput: number
	type: SourceLayerType
} {
	return {
		switcherInput: info.port,
		type: info.sourceLayerType
	}
}

export function getUniquenessIdDVE(parsedCue: CueDefinitionDVE) {
	return `dve_${parsedCue.template}_${parsedCue.labels.join('')}_${
		parsedCue.sources
			? `${parsedCue.sources.INP1}${parsedCue.sources.INP2}${parsedCue.sources.INP3}${parsedCue.sources.INP4}`
			: ''
	}`
}
