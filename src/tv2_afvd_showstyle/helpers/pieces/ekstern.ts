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
	literal,
	PartDefinition
} from 'tv2-common'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { FindSourceInfoStrict } from '../../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { PieceMetaData } from '../../../tv2_afvd_studio/onTimelineGenerate'
import { ControlClasses, SourceLayer } from '../../layers'
import {
	GetLayerForEkstern,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	GetStickyForPiece,
	STUDIO_MICS
} from '../sisyfos/sisyfos'
import { TransitionFromString } from '../transitionFromString'
import { TransitionSettings } from '../transitionSettings'

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

	const layer = GetLayerForEkstern(parsedCue.source)

	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: eksternProps[0],
				outputLayerId: 'pgm',
				sourceLayerId: SourceLayer.PgmLive,
				toBeQueued: true,
				metaData: GetEksternMetaData(layer),
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

						...GetSisyfosTimelineObjForEkstern(context, parsedCue.source),
						...GetSisyfosTimelineObjForCamera('telefon')
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
				metaData: GetEksternMetaData(layer),
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

						...GetSisyfosTimelineObjForEkstern(context, parsedCue.source),
						...GetSisyfosTimelineObjForCamera('telefon')
					])
				})
			})
		)
	}
}

export function GetEksternMetaData(layer?: SisyfosLLAyer): PieceMetaData | undefined {
	return layer
		? GetStickyForPiece([
				{ layer, isPgm: 1 },
				...STUDIO_MICS.map<{ layer: SisyfosLLAyer; isPgm: 0 | 1 | 2 }>(l => {
					return { layer: l, isPgm: 1 }
				})
		  ])
		: undefined
}
