import { GraphicsContent, TSR, WithTimeline } from 'blueprints-integration'
import {
	assertUnreachable,
	EnableDSK,
	FindDSKFullGFX,
	GetSisyfosTimelineObjForFull,
	IsTargetingFull,
	IsTargetingOVL,
	IsTargetingWall,
	literal,
	PilotGraphicProps,
	TransitionStyle
} from 'tv2-common'
import { ControlClasses } from 'tv2-constants'

import { PilotGraphicGenerator } from '../pilot'

export class VizPilotGraphicGenerator extends PilotGraphicGenerator {
	constructor(graphicProps: PilotGraphicProps) {
		super(graphicProps)
	}
	public getContent(): WithTimeline<GraphicsContent> {
		return {
			fileName: 'PILOT_' + this.cue.graphic.vcpid.toString(),
			path: this.cue.graphic.vcpid.toString(),
			timelineObjects: [
				literal<TSR.TimelineObjVIZMSEElementPilot>({
					id: '',
					enable: this.getEnable(),
					priority: 1,
					layer: this.getLayerMappingName(),
					content: {
						deviceType: TSR.DeviceType.VIZMSE,
						type: TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT,
						templateVcpId: this.cue.graphic.vcpid,
						continueStep: this.cue.graphic.continueCount,
						noAutoPreloading: false,
						channelName: this.getChannelName(),
						...this.getOutTransitionProperties()
					},
					...(IsTargetingFull(this.engine) ? { classes: ['full'] } : {})
				}),
				...(IsTargetingFull(this.engine) ? this.getFullPilotTimeline() : [])
			]
		}
	}

	private getEnable() {
		if (IsTargetingOVL(this.engine) || IsTargetingWall(this.engine)) {
			return this.GetEnableForGraphic()
		}
		return { start: 0 }
	}

	private getChannelName() {
		switch (this.engine) {
			case 'WALL':
				return 'WALL1'
			case 'OVL':
				return 'OVL1'
			case 'FULL':
			case 'TLF':
				return 'FULL1'
			default:
				assertUnreachable(this.engine)
		}
	}

	private getOutTransitionProperties(): Partial<TSR.TimelineObjVIZMSEElementPilot['content']> {
		if (IsTargetingWall(this.engine) || !this.config.studio.PreventOverlayWithFull) {
			return {}
		}
		return {
			delayTakeAfterOutTransition: true,
			outTransition: {
				type: TSR.VIZMSETransitionType.DELAY,
				delay: this.config.studio.VizPilotGraphics.OutTransitionDuration
			}
		}
	}

	private getFullPilotTimeline() {
		const fullDSK = FindDSKFullGFX(this.config)
		const timelineObjects = [
			this.context.videoSwitcher.getMixEffectTimelineObject({
				enable: {
					start: this.config.studio.VizPilotGraphics.CutToMediaPlayer
				},
				priority: 1,
				layer: this.settings.ProgramLayer,
				content: {
					input: this.config.studio.VizPilotGraphics.FullGraphicBackground,
					transition: TransitionStyle.CUT
				}
			}),
			// Assume DSK is off by default (config table)
			...EnableDSK(this.context, 'FULL'),
			...GetSisyfosTimelineObjForFull(this.config)
		]
		if (this.settings.AuxProgramLayer) {
			timelineObjects.push(
				literal<TSR.TimelineObjAtemAUX>({
					id: '',
					enable: {
						start: this.config.studio.VizPilotGraphics.CutToMediaPlayer
					},
					priority: 1,
					layer: this.settings.AuxProgramLayer,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.AUX,
						aux: {
							input: fullDSK.Fill
						}
					},
					classes: [ControlClasses.MixMinusOverrideDsk, ControlClasses.Placeholder]
				})
			)
		}
		return timelineObjects
	}
}
