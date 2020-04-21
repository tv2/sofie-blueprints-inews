import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineObjAtemME
} from 'timeline-state-resolver-types'
import {
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	RemoteContent,
	SourceLayerType,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddParentClass,
	createEmptyObject,
	CreateTimingEnable,
	CueDefinitionEkstern,
	EksternParentClass,
	FindSourceInfoStrict,
	GetEksternMetaData,
	GetLayersForEkstern,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	literal,
	PartDefinition,
	TransitionFromString,
	TransitionSettings
} from 'tv2-common'
import { ControlClasses } from 'tv2-constants'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function EvaluateEkstern(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionEkstern,
	partDefinition: PartDefinition,
	adlib?: boolean,
	rank?: number
) {
	const eksternProps = parsedCue.source
		.replace(/\s+/i, ' ')
		.trim()
		.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
	if (!eksternProps) {
		context.warning(`Could not find live source for ${parsedCue.source}, missing properties`)
		return
	}
	const source = eksternProps[1]
	if (!source) {
		context.warning(`Could not find live source for ${parsedCue.source}`)
		return
	}
	const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, parsedCue.source)
	if (sourceInfoCam === undefined) {
		context.warning(`Could not find ATEM input for source ${parsedCue.source}`)
		return
	}
	const atemInput = sourceInfoCam.port

	const layers = GetLayersForEkstern(context, config.sources, parsedCue.source)

	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: eksternProps[0],
				outputLayerId: 'pgm',
				sourceLayerId: SourceLayer.PgmLive,
				toBeQueued: true,
				metaData: GetEksternMetaData(config.stickyLayers, config.studio.StudioMics, layers),
				content: literal<RemoteContent>({
					studioLabel: '',
					switcherInput: atemInput,
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TimelineObjAtemME>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									input: atemInput,
									transition: partDefinition.transition
										? TransitionFromString(partDefinition.transition.style)
										: AtemTransitionStyle.CUT,
									transitionSettings: TransitionSettings(partDefinition)
								}
							}
						}),

						...GetSisyfosTimelineObjForEkstern(context, config.sources, parsedCue.source, GetLayersForEkstern),
						...GetSisyfosTimelineObjForCamera(context, config, 'telefon')
					])
				})
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: eksternProps[0],
				...CreateTimingEnable(parsedCue),
				outputLayerId: 'pgm',
				sourceLayerId: SourceLayer.PgmLive,
				toBeQueued: true,
				metaData: GetEksternMetaData(config.stickyLayers, config.studio.StudioMics, layers),
				content: literal<RemoteContent>({
					studioLabel: '',
					switcherInput: atemInput,
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						createEmptyObject({
							// Only want the ident for original versions (or clones)
							enable: { start: 0 },
							layer: 'ekstern_enable_ident',
							classes: [ControlClasses.ShowIdentGraphic]
						}),
						literal<TimelineObjAtemME>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									input: atemInput,
									transition: partDefinition.transition
										? TransitionFromString(partDefinition.transition.style)
										: AtemTransitionStyle.CUT,
									transitionSettings: TransitionSettings(partDefinition)
								}
							},
							...(AddParentClass(partDefinition) ? { classes: [EksternParentClass('studio0', parsedCue.source)] } : {})
						}),

						...GetSisyfosTimelineObjForEkstern(context, config.sources, parsedCue.source, GetLayersForEkstern),
						...GetSisyfosTimelineObjForCamera(context, config, 'telefon')
					])
				})
			})
		)
	}
}
