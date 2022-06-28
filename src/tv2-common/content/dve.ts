import {
	CameraContent,
	GraphicsContent,
	IShowStyleUserContext,
	IStudioUserContext,
	RemoteContent,
	SourceLayerType,
	SplitsContent,
	SplitsContentBoxProperties,
	TSR,
	VTContent,
	WithTimeline
} from '@tv2media/blueprints-integration'
import {
	createEmptyObject,
	CueDefinitionDVE,
	DVEConfigInput,
	DVEParentClass,
	DVESources,
	FindDSKFullGFX,
	FindSourceInfoStrict,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEVS,
	JoinAssetToFolder,
	literal,
	PartDefinition,
	SourceInfo,
	SourceInfoType,
	TimelineBlueprintExt,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { ControlClasses, MEDIA_PLAYER_AUTO, SharedGraphicLLayer } from 'tv2-constants'
import * as _ from 'underscore'
import { AtemSourceIndex } from '../../types/atem'
import { ActionSelectDVE } from '../actions'
import { CreateHTMLRendererContent } from '../helpers'
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

export interface DVEPieceMetaData {
	config: DVEConfigInput
	sources: DVESources
	userData: ActionSelectDVE
	mediaPlayerSessions?: string[] // TODO: Should probably move to a ServerPieceMetaData
	serverPlaybackTiming?: Array<{ start?: number; end?: number }>
}

export interface DVETimelineObjectGenerators {
	GetSisyfosTimelineObjForEkstern: (
		context: IStudioUserContext,
		sources: SourceInfo[],
		sourceType: string,
		enable?: TSR.Timeline.TimelineEnable
	) => TSR.TSRTimelineObj[]
	GetLayersForEkstern: (context: IStudioUserContext, sources: SourceInfo[], sourceType: string) => string[]
}

export interface DVEOptions {
	dveLayers: DVELayers
	dveTimelineGenerators: DVETimelineObjectGenerators
	boxMappings: [string, string, string, string]
	/** All audio layers */
	AUDIO_LAYERS: string[]
}

export function MakeContentDVEBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: IShowStyleUserContext,
	config: ShowStyleConfig,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	dveConfig: DVEConfigInput | undefined,
	dveGeneratorOptions: DVEOptions,
	addClass?: boolean,
	adlib?: boolean
): { content: WithTimeline<SplitsContent>; valid: boolean } {
	if (!dveConfig) {
		context.notifyUserWarning(`DVE ${parsedCue.template} is not configured`)
		return {
			valid: false,
			content: {
				boxSourceConfiguration: [],
				timelineObjects: []
			}
		}
	}

	// console.log('boxmap1', boxMap)
	// boxMap = boxMap.filter(map => map !== '')
	// console.log('boxmap2', boxMap)

	const graphicsTemplateContent: { [key: string]: string } = {}
	parsedCue.labels.forEach((label, i) => {
		graphicsTemplateContent[`${i}`] = label
	})

	return MakeContentDVE2(
		context,
		config,
		dveConfig,
		graphicsTemplateContent,
		parsedCue.sources,
		dveGeneratorOptions,
		addClass ? DVEParentClass('studio0', dveConfig.DVEName) : undefined,
		adlib,
		partDefinition.fields.videoId,
		partDefinition.segmentExternalId
	)
}

export function MakeContentDVE2<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: IShowStyleUserContext,
	config: ShowStyleConfig,
	dveConfig: DVEConfigInput,
	graphicsTemplateContent: { [key: string]: string },
	sources: DVESources | undefined,
	dveGeneratorOptions: DVEOptions,
	className?: string,
	adlib?: boolean,
	videoId?: string,
	mediaPlayerSessionId?: string
): { content: WithTimeline<SplitsContent>; valid: boolean } {
	let template: DVEConfig
	try {
		template = JSON.parse(dveConfig.DVEJSON) as DVEConfig
	} catch (e) {
		context.notifyUserWarning(`DVE Config JSON is not valid for ${dveConfig.DVEName}`)
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
	const boxMap: Array<{ source: string }> = []

	const classes: string[] = []

	inputs.forEach(source => {
		const sourceProps = source.split(':')
		const fromCue = sourceProps[1]
		const targetBox = Number(sourceProps[0])
		if (!fromCue || !targetBox || isNaN(targetBox)) {
			context.notifyUserWarning(`Invalid DVE mapping: ${sourceProps}`)
			return
		}

		classes.push(`${fromCue.replace(/\s/g, '')}_${dveGeneratorOptions.boxMappings[targetBox - 1]}`)

		if (sources) {
			const prop = sources[fromCue as keyof DVESources]
			if (prop?.match(/[K|C]AM(?:era)? ?.*/i)) {
				const match = prop.match(/[K|C]AM(?:era)? ?(.*)/i) as RegExpExecArray

				boxMap[targetBox - 1] = { source: `KAM ${match[1]}` }
			} else if (prop?.match(/LIVE ?.*/i)) {
				const match = prop.match(/LIVE ?(.*)/i) as RegExpExecArray

				boxMap[targetBox - 1] = { source: `LIVE ${match[1]}` }
			} else if (prop?.match(/FEED ?.*/i)) {
				const match = prop.match(/FEED ?(.*)/i) as RegExpExecArray

				boxMap[targetBox - 1] = { source: `FEED ${match[1]}` }
			} else if (prop?.match(/full/i)) {
				boxMap[targetBox - 1] = { source: `ENGINE FULL` }
			} else if (prop?.match(/EVS ?(?:\d+)? ?.*/i)) {
				const match = prop.match(/EVS ?(\d+)? ?(.*)/i) as RegExpExecArray

				boxMap[targetBox - 1] = { source: `EVS${match[1]} ${match[2]}` }
			} else if (/EPSIO/.test(prop ?? '')) {
				boxMap[targetBox - 1] = { source: 'EPSIO' }
			} else if (prop?.match(/DEFAULT/)) {
				boxMap[targetBox - 1] = { source: `DEFAULT SOURCE` }
			} else if (prop) {
				boxMap[targetBox - 1] = { source: videoId ? `SERVER ${videoId}` : prop }
			} else {
				if (videoId) {
					boxMap[targetBox - 1] = { source: `SERVER ${videoId}` }
				} else {
					context.notifyUserWarning(`Missing mapping for ${targetBox}`)
					boxMap[targetBox - 1] = { source: '' }
				}
			}
		} else {
			// Need something to keep the layout etc
			boxMap[targetBox - 1] = { source: '' }
		}
	})

	const boxes = _.map(template.boxes, box => ({ ...box, source: config.studio.AtemSource.Default }))
	const dveTimeline: TSR.TSRTimelineObj[] = []
	const boxSources: Array<(VTContent | CameraContent | RemoteContent | GraphicsContent) &
		SplitsContentBoxProperties> = []

	const setBoxSource = (num: number, sourceInfo: SourceInfo, label: string) => {
		if (boxes[num]) {
			boxes[num].source = Number(sourceInfo.port)

			boxSources.push({
				// TODO - draw box geometry
				...boxSource(sourceInfo, label),
				...literal<CameraContent | RemoteContent>({
					studioLabel: '',
					switcherInput: Number(sourceInfo.port)
				})
			})
		}
	}

	const setBoxToBlack = (num: number) => {
		setBoxSource(
			num,
			literal<SourceInfo>({
				type: SourceLayerType.UNKNOWN,
				id: 'black',
				port: AtemSourceIndex.Blk
			}),
			'Black'
		)
	}

	let valid = true
	let server = false

	boxMap.forEach((mappingFrom, num) => {
		if (mappingFrom === undefined || mappingFrom.source === '') {
			if (sources) {
				// If it is intentional there are no sources, then ignore
				// TODO - should this warn?
				context.notifyUserWarning(`Missing source type for DVE box: ${num + 1}`)
				valid = false
			}
		} else {
			const props = mappingFrom.source.split(' ')
			const sourceType = props[0]
			const sourceInput = props[1]
			if ((!sourceType || !sourceInput) && !mappingFrom.source.match(/EVS|EPSIO|SERVER/i)) {
				context.notifyUserWarning(`Invalid DVE source: ${mappingFrom.source}`)
				setBoxToBlack(num)
				return
			}
			const audioEnable: TSR.Timeline.TimelineEnable = {
				while: `1`
			}
			if (sourceType.match(/DEFAULT/)) {
				setBoxSource(
					num,
					{
						type: SourceLayerType.UNKNOWN,
						id: 'DEFAULT',
						port: config.studio.AtemSource.Default
					},
					mappingFrom.source
				)
			} else if (/KAM/i.test(sourceType)) {
				const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, mappingFrom.source)
				if (sourceInfoCam === undefined) {
					context.notifyUserWarning(`Invalid source: ${mappingFrom.source}`)
					setBoxToBlack(num)
					valid = false
					return
				}

				setBoxSource(num, sourceInfoCam, mappingFrom.source)
				dveTimeline.push(
					GetSisyfosTimelineObjForCamera(
						context,
						config,
						mappingFrom.source,
						dveGeneratorOptions.dveLayers.SisyfosLLayer.StudioMics,
						audioEnable
					)
				)
			} else if (/LIVE|FEED/i.test(sourceType)) {
				const sourceInfoLive = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, mappingFrom.source)
				if (sourceInfoLive === undefined) {
					context.notifyUserWarning(`Invalid source: ${mappingFrom.source}`)
					setBoxToBlack(num)
					valid = false
					return
				}

				setBoxSource(num, sourceInfoLive, mappingFrom.source)
				dveTimeline.push(
					...dveGeneratorOptions.dveTimelineGenerators.GetSisyfosTimelineObjForEkstern(
						context,
						config.sources,
						mappingFrom.source,
						audioEnable
					)
				)
			} else if (/EVS|EPSIO/.test(sourceType)) {
				const sourceInfoDelayedPlayback = FindSourceInfoStrict(
					context,
					config.sources,
					SourceLayerType.LOCAL,
					mappingFrom.source
				)
				if (sourceInfoDelayedPlayback === undefined) {
					context.notifyUserWarning(`Invalid source: ${mappingFrom.source}`)
					setBoxToBlack(num)
					valid = false
					return
				}

				setBoxSource(num, sourceInfoDelayedPlayback, mappingFrom.source)
				dveTimeline.push(
					GetSisyfosTimelineObjForEVS(
						sourceInfoDelayedPlayback,
						/VO/i.test(mappingFrom.source) || /EPSIO/i.test(sourceInfoDelayedPlayback.id)
					),
					GetSisyfosTimelineObjForCamera(context, config, 'evs', dveGeneratorOptions.dveLayers.SisyfosLLayer.StudioMics)
				)
			} else if (/ENGINE/i.test(sourceType)) {
				if (sourceInput.match(/full/i)) {
					const sourceInfoFull: SourceInfo = {
						type: SourceLayerType.GRAPHICS,
						id: 'full',
						port: FindDSKFullGFX(config).Fill
					}
					setBoxSource(num, sourceInfoFull, mappingFrom.source)
					dveTimeline.push(
						GetSisyfosTimelineObjForCamera(
							context,
							config,
							'full',
							dveGeneratorOptions.dveLayers.SisyfosLLayer.StudioMics
						)
					)
				} else {
					context.notifyUserWarning(`Unsupported engine for DVE: ${sourceInput}`)
					setBoxToBlack(num)
				}
			} else if (/SERVER/i.test(sourceType)) {
				server = true
				setBoxSource(
					num,
					{
						type: SourceLayerType.VT,
						id: 'SERVER',
						port: -1
					},
					mappingFrom.source
				)
				return
			} else {
				context.notifyUserWarning(`Unknown source type for DVE: ${mappingFrom.source}`)
				setBoxToBlack(num)
				valid = false
			}
		}
	})

	let graphicsTemplateStyle: any = ''
	try {
		if (dveConfig.DVEGraphicsTemplateJSON) {
			graphicsTemplateStyle = JSON.parse(dveConfig.DVEGraphicsTemplateJSON.toString())
		}
	} catch {
		context.notifyUserWarning(`DVE Graphics Template JSON is not valid for ${dveConfig.DVEName}`)
	}

	let keyFile = dveConfig.DVEGraphicsKey ? dveConfig.DVEGraphicsKey.toString() : undefined
	let frameFile = dveConfig.DVEGraphicsFrame ? dveConfig.DVEGraphicsFrame.toString() : undefined

	if (keyFile) {
		keyFile = JoinAssetToFolder(config.studio.DVEFolder, keyFile)
	}

	if (frameFile) {
		frameFile = JoinAssetToFolder(config.studio.DVEFolder, frameFile)
	}

	return {
		valid,
		content: literal<WithTimeline<SplitsContent>>({
			boxSourceConfiguration: boxSources,
			timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
				// Setup classes for adlibs to be able to override boxes
				createEmptyObject({
					enable: getDVEEnable(),
					layer: 'dve_lookahead_control',
					classes: [ControlClasses.DVEOnAir]
				}),

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
					classes: className ? [...classes, className] : classes,
					metaData: literal<DVEMetaData>({
						mediaPlayerSession: server ? mediaPlayerSessionId ?? MEDIA_PLAYER_AUTO : undefined
					})
				}),
				literal<TSR.TimelineObjAtemSsrcProps>({
					id: '',
					enable: getDVEEnable(Number(config.studio.CasparPrerollDuration) - 10), // TODO - why 10ms?
					priority: 1,
					layer: dveGeneratorOptions.dveLayers.ATEM.SSrcArt,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.SSRCPROPS,
						ssrcProps: {
							artFillSource: config.studio.AtemSource.SplitArtF,
							artCutSource: config.studio.AtemSource.SplitArtK,
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
				literal<TSR.TimelineObjAtemME>({
					id: '',
					enable: getDVEEnable(Number(config.studio.CasparPrerollDuration)),
					priority: 1,
					layer: dveGeneratorOptions.dveLayers.ATEM.MEProgram,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: AtemSourceIndex.SSrc,
							transition: TSR.AtemTransitionStyle.CUT
						}
					},
					...(adlib ? { classes: ['adlib_deparent'] } : {})
				}),
				literal<TSR.TimelineObjCCGTemplate>({
					id: '',
					enable: getDVEEnable(),
					priority: 1,
					layer: SharedGraphicLLayer.GraphicLLayerLocators,
					content: CreateHTMLRendererContent(config, 'locators', {
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
				...(server && mediaPlayerSessionId ? [EnableServer(mediaPlayerSessionId)] : []),
				...dveTimeline
			])
		})
	}
}

function boxSource(
	info: SourceInfo,
	label: string
): {
	studioLabel: string
	switcherInput: number
	type: SourceInfoType
} {
	return {
		studioLabel: label,
		switcherInput: info.port,
		type: info.type
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
