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
	ExtendedShowStyleContext,
	FindDSKFullGFX,
	findSourceInfo,
	joinAssetToFolder,
	literal,
	PartDefinition,
	PieceMetaData,
	TimelineBlueprintExt,
	TransitionStyle,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { MEDIA_PLAYER_AUTO, SharedGraphicLLayer, SourceType } from 'tv2-constants'
import * as _ from 'underscore'
import { AtemSourceIndex } from '../../types/atem'
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
	ATEM: {
		SSrcDefault: string
		SSrcArt: string
		MEProgram: string
	}
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

export interface DVEMetaData {
	mediaPlayerSession?: string
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
	/** All audio layers */
	AUDIO_LAYERS: string[]
}

type BoxConfig = DVEConfigBox & { source: number }
type BoxSources = Array<(VTContent | CameraContent | RemoteContent | GraphicsContent) & SplitsContentBoxProperties>

export function MakeContentDVEBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ExtendedShowStyleContext<ShowStyleConfig>,
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
	context: ExtendedShowStyleContext<ShowStyleConfig>,
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
							port: FindDSKFullGFX(context.config).Fill
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
						port: -1
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

	return {
		valid,
		content: literal<WithTimeline<SplitsContent>>({
			boxSourceConfiguration: boxSources,
			timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
				// setup ssrc
				literal<TSR.TimelineObjAtemSsrc & TimelineBlueprintExt>({
					id: '',
					enable: {
						while: '1'
					},
					priority: 1,
					layer: dveGeneratorOptions.dveLayers.ATEM.SSrcDefault,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.SSRC,
						ssrc: { boxes }
					},
					metaData: literal<DVEMetaData>({
						mediaPlayerSession: hasServer ? mediaPlayerSessionId ?? MEDIA_PLAYER_AUTO : undefined
					})
				}),
				literal<TSR.TimelineObjAtemSsrcProps>({
					id: '',
					enable: getDVEEnable(Number(context.config.studio.CasparPrerollDuration) - 10), // TODO - why 10ms?
					priority: 1,
					layer: dveGeneratorOptions.dveLayers.ATEM.SSrcArt,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.SSRCPROPS,
						ssrcProps: {
							artFillSource: context.config.studio.SwitcherSource.SplitArtF,
							artCutSource: context.config.studio.SwitcherSource.SplitArtK,
							artOption: 1,
							...(template.properties && template.properties?.artPreMultiplied === false
								? {
										artPreMultiplied: false,
										artInvertKey: template.properties.artInvertKey,
										artClip: template.properties.artClip * 10,
										artGain: template.properties.artGain * 10
								  }
								: { artPreMultiplied: true }),
							...(template.border?.borderEnabled
								? {
										...template.border
								  }
								: { borderEnabled: false })
						}
					}
				}),
				context.videoSwitcher.getMixEffectTimelineObject({
					id: '',
					enable: getDVEEnable(Number(context.config.studio.CasparPrerollDuration)),
					priority: 1,
					layer: dveGeneratorOptions.dveLayers.ATEM.MEProgram,
					content: {
						input: AtemSourceIndex.SSrc,
						transition: TransitionStyle.CUT
					}
				}),
				literal<TSR.TimelineObjCCGTemplate>({
					id: '',
					enable: getDVEEnable(),
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
								enable: getDVEEnable(),
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
								enable: getDVEEnable(),
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
			// TODO - draw box geometry
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
		port: AtemSourceIndex.Blk,
		sourceLayerType: SourceLayerType.UNKNOWN
	})
}

function makeBoxAssignments(
	inputs: string[],
	context: IShowStyleUserContext,
	sources: DVESources | undefined
) {
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

function getDVEEnable(offsetFromStart?: number, media?: boolean): TSR.TSRTimelineObj['enable'] {
	if (offsetFromStart) {
		return { start: offsetFromStart ?? 0 }
	}
	return media ? { while: '1' } : { start: offsetFromStart ?? 0 }
}

export function getUniquenessIdDVE(parsedCue: CueDefinitionDVE) {
	return `dve_${parsedCue.template}_${parsedCue.labels.join('')}_${
		parsedCue.sources
			? `${parsedCue.sources.INP1}${parsedCue.sources.INP2}${parsedCue.sources.INP3}${parsedCue.sources.INP4}`
			: ''
	}`
}
