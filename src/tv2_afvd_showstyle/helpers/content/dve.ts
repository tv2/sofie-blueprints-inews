import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineObjAtemME,
	TimelineObjAtemSsrc,
	TimelineObjAtemSsrcProps,
	TimelineObjCCGMedia,
	TimelineObjCCGTemplate,
	TSRTimelineObj,
	Timeline
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
import { FindSourceInfoStrict, SourceInfo } from '../../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer, CasparLLayer } from '../../../tv2_afvd_studio/layers'
import { AtemSourceIndex } from '../../../types/atem'
import { CueDefinitionDVE, DVESources } from '../../inewsConversion/converters/ParseCue'
import { ControlClasses, SourceLayer } from '../../layers'
import { DVEConfig } from '../pieces/dve'
import { GetSisyfosTimelineObjForCamera, GetSisyfosTimelineObjForEkstern } from '../sisyfos/sisyfos'

export const boxLayers: DVESources = {
	INP1: SourceLayer.PgmDVEBox1,
	INP2: SourceLayer.PgmDVEBox2,
	INP3: SourceLayer.PgmDVEBox3
}
export const boxMappings = [AtemLLayer.AtemSSrcBox1, AtemLLayer.AtemSSrcBox2, AtemLLayer.AtemSSrcBox3]

export function MakeContentDVE(
	context: PartContext,
	config: BlueprintConfig,
	_partId: string,
	parsedCue: CueDefinitionDVE,
	dveConfig: DVEConfigInput | undefined
): { content: SplitsContent; valid: boolean } {
	if (!dveConfig) {
		context.warning(`DVE ${parsedCue.template} is not configured`)
		return {
			valid: false,
			content: {
				boxSourceConfiguration: [],
				timelineObjects: [],
				dveConfiguration: []
			}
		}
	}

	// console.log('boxmap1', boxMap)
	// boxMap = boxMap.filter(map => map !== '')
	// console.log('boxmap2', boxMap)

	const graphicsTemplateContent: { [key: string]: string } = {}
	parsedCue.labels.forEach((label, i) => {
		graphicsTemplateContent[`locator${i + 1}`] = label
	})

	return MakeContentDVE2(context, config, dveConfig, graphicsTemplateContent, parsedCue.sources)
}

export function MakeContentDVE2(
	context: NotesContext,
	config: BlueprintConfig,
	dveConfig: DVEConfigInput,
	graphicsTemplateContent: { [key: string]: string },
	sources: DVESources | undefined
) {
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

		if (sources) {
			const prop = sources[fromCue as keyof DVESources]
			if (!prop) {
				context.warning(`Missing mapping for ${targetBox}`)
				// Need something to keep the layout etc
				boxMap[targetBox - 1] = { source: '', sourceLayer }
			} else {
				boxMap[targetBox - 1] = { source: prop, sourceLayer }
			}
		} else {
			// Need something to keep the layout etc
			boxMap[targetBox - 1] = { source: '', sourceLayer }
		}
	})

	const boxes = _.map(template.boxes, box => ({ ...box, source: config.studio.AtemSource.Default }))
	const audioTimeline: TSRTimelineObj[] = []
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
				audioTimeline.push(...GetSisyfosTimelineObjForCamera(mappingFrom.source, audioEnable))
			} else if (sourceType.match(/LIVE/i) || sourceType.match(/SKYPE/i)) {
				const sourceInfoLive = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, mappingFrom.source)
				if (sourceInfoLive === undefined) {
					context.warning(`Invalid source: ${mappingFrom.source}`)
					valid = false
					return
				}

				setBoxSource(num, sourceInfoLive, mappingFrom.source)
				audioTimeline.push(...GetSisyfosTimelineObjForEkstern(mappingFrom.source, audioEnable))
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
				literal<TimelineObjAtemSsrc>({
					id: '',
					enable: { start: 0 },
					priority: 1,
					layer: AtemLLayer.AtemSSrcDefault,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.SSRC,
						ssrc: { boxes }
					},
					classes
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
					}
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

				...audioTimeline
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
	type: SourceLayerType.CAMERA | SourceLayerType.REMOTE | SourceLayerType.AUDIO
} {
	return {
		studioLabel: label,
		switcherInput: info.port,
		type: info.type
	}
}
