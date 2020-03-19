import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjAtemME,
	TimelineObjCCGMedia,
	TimelineObjSisyfosAny,
	TSRTimelineObjBase
} from 'timeline-state-resolver-types'
import { TimelineObjectCoreExt, VTContent } from 'tv-automation-sofie-blueprints-integration'
import { AddParentClass, literal, PartDefinition, ServerParentClass } from 'tv2-common'
import { Enablers } from 'tv2-constants'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { TimelineBlueprintExt } from '../../../tv2_afvd_studio/onTimelineGenerate'
import { MEDIA_PLAYER_AUTO } from '../../../types/constants'
import { BlueprintConfig } from '../../helpers/config'
import { STICKY_LAYERS } from '../sisyfos/sisyfos'
import { TransitionFromString } from '../transitionFromString'
import { TransitionSettings } from '../transitionSettings'

export function MakeContentServer(
	file: string,
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition,
	config: BlueprintConfig,
	adLib?: boolean,
	stickyLevels?: boolean,
	enabler?: Enablers,
	offtube?: boolean
): VTContent {
	return literal<VTContent>({
		studioLabel: '',
		fileName: file, // playing casparcg
		path: `${config.studio.ClipSourcePath}\\${file}${config.studio.ClipFileExtension}`, // full path on the source network storage
		mediaFlowIds: [config.studio.MediaFlowId],
		firstWords: '',
		lastWords: '',
		timelineObjects: literal<TimelineObjectCoreExt[]>([
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
					loop: adLib,
					...(offtube ? { playing: false } : {})
				},
				...(offtube
					? {
							keyframes: [
								{
									id: '',
									enable: {
										while: `.${enabler ?? Enablers.OFFTUBE_ENABLE_SERVER}`
									},
									content: {
										inPoint: 0,
										playing: true
									}
								}
							]
					  }
					: {}),
				metaData: {
					mediaPlayerSession: adLib ? MEDIA_PLAYER_AUTO : mediaPlayerSessionId
				},
				...(AddParentClass(partDefinition) && !adLib ? { classes: [ServerParentClass('studio0', file)] } : {})
			}),

			literal<TimelineObjAtemME & TimelineBlueprintExt>({
				id: '',
				enable: getServerAdlibEnable(
					!!adLib,
					config.studio.CasparPrerollDuration,
					enabler ?? Enablers.OFFTUBE_ENABLE_SERVER,
					!!offtube
				),
				priority: 1,
				layer: AtemLLayer.AtemMEProgram,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.ME,
					me: {
						input: undefined,
						transition: partDefinition.transition
							? TransitionFromString(partDefinition.transition.style)
							: AtemTransitionStyle.CUT,
						transitionSettings: TransitionSettings(partDefinition)
					}
				},
				metaData: {
					mediaPlayerSession: adLib ? MEDIA_PLAYER_AUTO : mediaPlayerSessionId
				},
				...(adLib ? { classes: ['adlib_deparent'] } : {})
			}),

			literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
				id: '',
				enable: getServerAdlibEnable(!!adLib, 0, enabler ?? Enablers.OFFTUBE_ENABLE_SERVER, !!offtube),
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceClipPending,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					// isPgm: voiceOver ? 2 : 1
					isPgm: 1
				},
				metaData: {
					mediaPlayerSession: adLib ? MEDIA_PLAYER_AUTO : mediaPlayerSessionId
				}
			}),

			...(stickyLevels
				? STICKY_LAYERS.map<TimelineObjSisyfosAny & TimelineBlueprintExt>(layer => {
						return literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
							id: '',
							enable: getServerAdlibEnable(!!adLib, 0, enabler ?? Enablers.OFFTUBE_ENABLE_SERVER, !!offtube),
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
				: [])
		])
	})
}

function getServerAdlibEnable(
	adlib: boolean,
	startTime: number,
	enabler: Enablers,
	offtube: boolean
): TSRTimelineObjBase['enable'] {
	if (adlib && offtube) {
		return {
			while: `.${enabler}`
		}
	}

	return {
		start: startTime
	}
}
