import {
	AtemTransitionStyle,
	DeviceType,
	Timeline,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjAtemME,
	TimelineObjAtemSsrc,
	TimelineObjAtemSsrcProps,
	TimelineObjCCGMedia,
	TimelineObjCCGTemplate,
	TimelineObjSisyfosAny,
	TimelineObjSisyfosMessage,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import {
	CameraContent,
	GraphicsContent,
	NotesContext,
	PartContext,
	RemoteContent,
	SourceLayerType,
	SplitsContent,
	SplitsContentBoxProperties,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { createEmptyObject, literal } from '../../../common/util'
import { BlueprintConfig, DVEConfigInput } from '../../../tv2_afvd_showstyle/helpers/config'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { FindSourceInfoStrict, SourceInfo, SourceInfoType } from '../../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { TimelineBlueprintExt } from '../../../tv2_afvd_studio/onTimelineGenerate'
import { AtemSourceIndex } from '../../../types/atem'
import { MEDIA_PLAYER_AUTO } from '../../../types/constants'
import { CueDefinitionDVE, DVEParentClass, DVESources } from '../../inewsConversion/converters/ParseCue'
import { ControlClasses, SourceLayer } from '../../layers'
import { DVEConfig } from '../pieces/dve'
import {
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	LIVE_AUDIO,
	STICKY_LAYERS
} from '../sisyfos/sisyfos'

export const boxLayers: DVESources = {
	INP1: SourceLayer.PgmDVEBox1,
	INP2: SourceLayer.PgmDVEBox2,
	INP3: SourceLayer.PgmDVEBox3
}
export const boxMappings = [AtemLLayer.AtemSSrcBox1, AtemLLayer.AtemSSrcBox2, AtemLLayer.AtemSSrcBox3]

export function MakeContentDVE(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	dveConfig: DVEConfigInput | undefined,
	addClass?: boolean,
	adlib?: boolean
): { content: SplitsContent; valid: boolean; stickyLayers: SisyfosLLAyer[] } {
	if (!dveConfig) {
		context.warning(`DVE ${parsedCue.template} is not configured`)
		return {
			valid: false,
			content: {
				boxSourceConfiguration: [],
				timelineObjects: [],
				dveConfiguration: []
			},
			stickyLayers: []
		}
	}

	// console.log('boxmap1', boxMap)
	// boxMap = boxMap.filter(map => map !== '')
	// console.log('boxmap2', boxMap)

	const graphicsTemplateContent: { [key: string]: string } = {}
	parsedCue.labels.forEach((label, i) => {
		graphicsTemplateContent[`locator${i + 1}`] = label
	})

	return MakeContentDVE2(
		context,
		config,
		dveConfig,
		graphicsTemplateContent,
		parsedCue.sources,
		addClass ? DVEParentClass('studio0', dveConfig.DVEName) : undefined,
		adlib,
		partDefinition
	)
}

export function MakeContentDVE2(
	context: NotesContext,
	config: BlueprintConfig,
	dveConfig: DVEConfigInput,
	graphicsTemplateContent: { [key: string]: string },
	sources: DVESources | undefined,
	className?: string,
	adlib?: boolean,
	partDefinition?: PartDefinition
): { content: SplitsContent; valid: boolean; stickyLayers: SisyfosLLAyer[] } {
	const template: DVEConfig = JSON.parse(dveConfig.DVEJSON as string) as DVEConfig

	const inputs = dveConfig.DVEInputs
		? dveConfig.DVEInputs.toString().split(';')
		: '1:INP1;2:INP2;3:INP3;4:INP4'.split(';')
	const boxMap: Array<{ source: string; sourceLayer: SourceLayer }> = []

	const classes: string[] = []

	inputs.forEach(source => {
		const sourceProps = source.split(':')
		const fromCue = sourceProps[1]
		const targetBox = Number(sourceProps[0])
		if (!fromCue || !targetBox || isNaN(targetBox)) {
			context.warning(`Invalid DVE mapping: ${sourceProps}`)
			return
		}

		const sourceLayer = boxLayers[fromCue as keyof DVESources] as SourceLayer
		classes.push(`${sourceLayer}_${boxMappings[targetBox - 1]}`)

		let usedServer = false

		if (sources) {
			const prop = sources[fromCue as keyof DVESources]
			if (prop?.match(/[K|C]AM(?:era)? ?.*/i)) {
				const match = prop.match(/[K|C]AM(?:era)? ?(.*)/i) as RegExpExecArray

				boxMap[targetBox - 1] = { source: `KAM ${match[1]}`, sourceLayer }
			} else if (prop?.match(/LIVE ?.*/i)) {
				const match = prop.match(/LIVE ?(.*)/i) as RegExpExecArray

				boxMap[targetBox - 1] = { source: `LIVE ${match[1]}`, sourceLayer }
			} else if (prop?.match(/full/i)) {
				boxMap[targetBox - 1] = { source: `ENGINE FULL`, sourceLayer }
			} else if (prop?.match(/EVS ?.*/i)) {
				const match = prop.match(/EVS ?(.*)/i) as RegExpExecArray

				boxMap[targetBox - 1] = { source: `EVS ${match[1]}`, sourceLayer }
			} else if (prop) {
				if (partDefinition && partDefinition.fields.videoId && !usedServer) {
					boxMap[targetBox - 1] = { source: `SERVER ${partDefinition.fields.videoId}`, sourceLayer }
					usedServer = true
				} else {
					boxMap[targetBox - 1] = { source: prop, sourceLayer }
				}
			} else {
				context.warning(`Missing mapping for ${targetBox}`)
				boxMap[targetBox - 1] = { source: '', sourceLayer }
			}
		} else {
			// Need something to keep the layout etc
			boxMap[targetBox - 1] = { source: '', sourceLayer }
		}
	})

	const boxes = _.map(template.boxes, box => ({ ...box, source: config.studio.AtemSource.Default }))
	const dveTimeline: TSRTimelineObj[] = []
	const boxSources: Array<(VTContent | CameraContent | RemoteContent | GraphicsContent) &
		SplitsContentBoxProperties> = []

	const setBoxSource = (num: number, sourceInfo: SourceInfo, mappingFrom: string) => {
		if (boxes[num]) {
			boxes[num].source = Number(sourceInfo.port)

			boxSources.push({
				// TODO - draw box geometry
				...boxSource(sourceInfo, mappingFrom),
				...literal<CameraContent | RemoteContent>({
					studioLabel: '',
					switcherInput: Number(sourceInfo.port),
					timelineObjects: []
				})
			})
		}
	}

	let valid = true
	let server = false

	boxMap.forEach((mappingFrom, num) => {
		if (mappingFrom === undefined || mappingFrom.source === '') {
			if (sources) {
				// If it is intentional there are no sources, then ignore
				// TODO - should this warn?
				context.warning(`Missing source type for DVE box: ${num + 1}`)
				valid = false
			}
		} else {
			const props = mappingFrom.source.split(' ')
			const sourceType = props[0]
			const sourceInput = props[1]
			if (!sourceType || !sourceInput) {
				context.warning(`Invalid DVE source: ${mappingFrom.source}`)
				return
			}
			const audioEnable: Timeline.TimelineEnable = {
				while: `!\$${mappingFrom.sourceLayer}`
				// while: `!.${ControlClasses.DVEBoxOverridePrefix + boxMappings[num]}`
			} // TODO - test
			if (sourceType.match(/KAM/i)) {
				const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, mappingFrom.source)
				if (sourceInfoCam === undefined) {
					context.warning(`Invalid source: ${mappingFrom.source}`)
					valid = false
					return
				}

				setBoxSource(num, sourceInfoCam, mappingFrom.source)
				dveTimeline.push(...GetSisyfosTimelineObjForCamera(mappingFrom.source, audioEnable))
			} else if (sourceType.match(/LIVE/i) || sourceType.match(/SKYPE/i)) {
				const sourceInfoLive = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, mappingFrom.source)
				if (sourceInfoLive === undefined) {
					context.warning(`Invalid source: ${mappingFrom.source}`)
					valid = false
					return
				}

				setBoxSource(num, sourceInfoLive, mappingFrom.source)
				dveTimeline.push(...GetSisyfosTimelineObjForEkstern(context, mappingFrom.source, audioEnable))
			} else if (sourceType.match(/EVS/i)) {
				// TODO: When adding more EVS sources in the future
				const sourceInfoEVS: SourceInfo = {
					type: SourceLayerType.REMOTE,
					id: sourceInput,
					port: config.studio.AtemSource.DelayedPlayback
				}

				setBoxSource(num, sourceInfoEVS, mappingFrom.source)
				dveTimeline.push(...GetSisyfosTimelineObjForCamera('evs'))
			} else if (sourceType.match(/ENGINE/i)) {
				if (sourceInput.match(/full/i)) {
					const sourceInfoFull: SourceInfo = {
						type: SourceLayerType.GRAPHICS,
						id: 'full',
						port: config.studio.AtemSource.DSK1F
					}
					setBoxSource(num, sourceInfoFull, mappingFrom.source)
					dveTimeline.push(...GetSisyfosTimelineObjForCamera('full'))
				} else {
					context.warning(`Unsupported engine for DVE: ${sourceInput}`)
				}
			} else if (sourceType.match(/SERVER/i)) {
				const file = partDefinition ? partDefinition.fields.videoId : undefined

				if (!file || !file.length) {
					context.warning('No video id provided for ADLIBPIX')
					valid = false
					return
				}
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
				dveTimeline.push(
					literal<TimelineObjCCGMedia & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: CasparLLayer.CasparPlayerClipPending,
						content: {
							deviceType: DeviceType.CASPARCG,
							type: TimelineContentTypeCasparCg.MEDIA,
							file,
							loop: true
						},
						metaData: {
							mediaPlayerSession: MEDIA_PLAYER_AUTO // TODO: Maybe this should be segment-level?
						}
					}),
					literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: SisyfosLLAyer.SisyfosSourceClipPending,
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
							isPgm: 1
						},
						metaData: {
							mediaPlayerSession: MEDIA_PLAYER_AUTO // TODO: Maybe this should be segment-level?
						}
					})
				)
				return
			} else {
				context.warning(`Unknown source type for DVE: ${mappingFrom.source}`)
				valid = false
			}
		}
	})

	const graphicsTemplateName = dveConfig.DVEGraphicsTemplate ? dveConfig.DVEGraphicsTemplate.toString() : ''
	const graphicsTemplateStyle = dveConfig.DVEGraphicsTemplateJSON
		? JSON.parse(dveConfig.DVEGraphicsTemplateJSON.toString())
		: ''
	const keyFile = dveConfig.DVEGraphicsKey ? dveConfig.DVEGraphicsKey.toString() : ''
	const frameFile = dveConfig.DVEGraphicsFrame ? dveConfig.DVEGraphicsFrame.toString() : ''

	if (adlib) {
		dveTimeline.push(
			...STICKY_LAYERS.filter(layer => dveTimeline.map(obj => obj.layer).indexOf(layer) === -1)
				.filter(layer => LIVE_AUDIO.indexOf(layer) === -1)
				.map<TimelineObjSisyfosMessage>(layer => {
					return literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer,
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
							isPgm: 0
						},
						metaData: {
							sisyfosPersistLevel: true
						}
					})
				})
		)
	}

	return {
		valid,
		content: literal<SplitsContent>({
			boxSourceConfiguration: boxSources,
			dveConfiguration: {},
			timelineObjects: _.compact<TSRTimelineObj>([
				// Setup classes for adlibs to be able to override boxes
				createEmptyObject({
					enable: { start: 0 },
					layer: 'dve_lookahead_control',
					classes: [ControlClasses.DVEOnAir]
				}),

				// setup ssrc
				literal<TimelineObjAtemSsrc & TimelineBlueprintExt>({
					id: '',
					enable: { start: 0 },
					priority: 1,
					layer: AtemLLayer.AtemSSrcDefault,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.SSRC,
						ssrc: { boxes }
					},
					classes: className ? [...classes, className] : classes,
					metaData: {
						mediaPlayerSession: server ? MEDIA_PLAYER_AUTO : undefined // TODO: Maybe this should be segment-level?
					}
				}),
				literal<TimelineObjAtemSsrcProps>({
					id: '',
					enable: { start: Number(config.studio.CasparPrerollDuration) - 10 }, // TODO - why 10ms?
					priority: 1,
					layer: AtemLLayer.AtemSSrcArt,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.SSRCPROPS,
						ssrcProps: {
							artFillSource: config.studio.AtemSource.SplitArtF,
							artCutSource: config.studio.AtemSource.SplitArtK,
							artOption: 1,
							artPreMultiplied: true
						}
					}
				}),

				literal<TimelineObjAtemME>({
					id: '',
					enable: { start: Number(config.studio.CasparPrerollDuration) - 80 }, // let caspar update, but give the ssrc 2 frames to get configured
					priority: 1,
					layer: AtemLLayer.AtemMEProgram,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.ME,
						me: {
							input: AtemSourceIndex.SSrc,
							transition: AtemTransitionStyle.CUT
						}
					},
					...(adlib ? { classes: ['adlib_deparent'] } : {})
				}),
				...(graphicsTemplateName
					? [
							literal<TimelineObjCCGTemplate>({
								id: '',
								enable: { start: 0 },
								priority: 1,
								layer: CasparLLayer.CasparCGDVETemplate,
								content: {
									deviceType: DeviceType.CASPARCG,
									type: TimelineContentTypeCasparCg.TEMPLATE,
									templateType: 'html',
									name: graphicsTemplateName,
									data: {
										display: {
											isPreview: false,
											displayState: 'locators'
										},
										locators: {
											style: graphicsTemplateStyle ? graphicsTemplateStyle : {},
											content: graphicsTemplateContent
										}
									},
									useStopCommand: false
								}
							})
					  ]
					: []),
				...(keyFile
					? [
							literal<TimelineObjCCGMedia>({
								id: '',
								enable: { start: 0 },
								priority: 1,
								layer: CasparLLayer.CasparCGDVEKey,
								content: {
									deviceType: DeviceType.CASPARCG,
									type: TimelineContentTypeCasparCg.MEDIA,
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
							literal<TimelineObjCCGMedia>({
								id: '',
								enable: { start: 0 },
								priority: 1,
								layer: CasparLLayer.CasparCGDVEFrame,
								content: {
									deviceType: DeviceType.CASPARCG,
									type: TimelineContentTypeCasparCg.MEDIA,
									file: frameFile,
									loop: true
								}
							})
					  ]
					: []),

				...dveTimeline
			])
		}),
		stickyLayers: [
			...dveTimeline
				.filter(obj => obj.content.deviceType === DeviceType.SISYFOS)
				.filter(obj => Object.values(SisyfosLLAyer).includes(obj.layer as SisyfosLLAyer))
				.filter(
					obj =>
						![
							SisyfosLLAyer.SisyfosSourceClipPending,
							SisyfosLLAyer.SisyfosSourceServerA,
							SisyfosLLAyer.SisyfosSourceServerB
						].includes(obj.layer as SisyfosLLAyer)
				)
				.map<SisyfosLLAyer>(obj => obj.layer as SisyfosLLAyer)
		]
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
