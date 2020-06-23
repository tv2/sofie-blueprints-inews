import { IBlueprintAdLibPiece, IBlueprintPiece, PieceLifespan, TSR } from 'tv-automation-sofie-blueprints-integration'
import {
	AddParentClass,
	CalculateTime,
	CueDefinitionDVE,
	GetDVETemplate,
	literal,
	PartContext2,
	PartDefinition,
	PieceMetaData,
	TemplateIsValid,
	TimelineBlueprintExt
} from 'tv2-common'
import { AdlibTags, ControlClasses, Enablers } from 'tv2-constants'
import { OfftubeAbstractLLayer, OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { AtemSourceIndex } from '../../types/atem'
import { OfftubeMakeContentDVE } from '../content/OfftubeDVEContent'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'
import { makeofftubeDVEIDsUniqueForFlow } from './OfftubeAdlib'

export function OfftubeEvaluateDVE(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	_adlib?: boolean,
	rank?: number
) {
	if (!parsedCue.template) {
		return
	}

	const rawTemplate = GetDVETemplate(config.showStyle.DVEStyles, parsedCue.template)
	if (!rawTemplate) {
		context.warning(`Could not find template ${parsedCue.template}`)
		return
	}

	if (!TemplateIsValid(JSON.parse(rawTemplate.DVEJSON as string))) {
		context.warning(`Invalid DVE template ${parsedCue.template}`)
		return
	}

	const adlibContent = OfftubeMakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(partDefinition),
		true
	)

	const adlibContentFlow = OfftubeMakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(partDefinition),
		true,
		true
	)

	const pieceContent = OfftubeMakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(partDefinition),
		false,
		true
	)

	if (adlibContent.valid && pieceContent.valid) {
		const dveAdlib = literal<IBlueprintAdLibPiece>({
			_rank: rank || 0,
			externalId: partDefinition.externalId,
			name: `${partDefinition.storyName}`,
			outputLayerId: 'selectedAdlib',
			sourceLayerId: OfftubeSourceLayer.SelectedAdLibDVE,
			infiniteMode: PieceLifespan.OutOnNextSegment,
			toBeQueued: true,
			canCombineQueue: true,
			content: {
				...adlibContent.content,
				timelineObjects: adlibContent.content.timelineObjects.map(tlObj => {
					return {
						...tlObj,
						classes: tlObj.classes ? [...tlObj.classes, ControlClasses.NOLookahead] : [ControlClasses.NOLookahead]
					}
				})
			},
			adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
			tags: [AdlibTags.ADLIB_KOMMENTATOR]
		})
		dveAdlib.additionalPieces = [
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: 'setNextToDVE',
				name: 'DVE',
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				outputLayerId: OfftubeOutputLayers.PGM,
				infiniteMode: PieceLifespan.OutOnNextPart,
				toBeQueued: true,
				canCombineQueue: true,
				content: {
					timelineObjects: [
						literal<TSR.TimelineObjAbstractAny>({
							id: 'dveProgramEnabler',
							enable: {
								while: '1'
							},
							priority: 1,
							layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
							content: {
								deviceType: TSR.DeviceType.ABSTRACT
							},
							classes: [Enablers.OFFTUBE_ENABLE_DVE]
						}),
						literal<TSR.TimelineObjAtemME>({
							id: `dvePgm`,
							enable: { start: Number(config.studio.CasparPrerollDuration) },
							priority: 1,
							layer: OfftubeAtemLLayer.AtemMEClean,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									input: AtemSourceIndex.SSrc,
									transition: TSR.AtemTransitionStyle.CUT
								}
							},
							classes: ['adlib_deparent']
						}),
						literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
							id: `dveNext`,
							enable: { start: 0 },
							priority: 0, // Must be below lookahead, except when forced by hold
							layer: OfftubeAtemLLayer.AtemMENext,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									previewInput: AtemSourceIndex.SSrc
								}
							},
							metaData: {
								context: `Lookahead-lookahead for dveProgramEnabler`
							},
							classes: ['ab_on_preview']
						})
					]
				},
				tags: [AdlibTags.OFFTUBE_SET_DVE_NEXT]
			})
		]
		adlibPieces.push(dveAdlib)

		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				...dveAdlib,
				outputLayerId: 'pgm',
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				infiniteMode: PieceLifespan.OutOnNextPart,
				tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
				additionalPieces: [],
				content: {
					...adlibContentFlow.content,
					timelineObjects: makeofftubeDVEIDsUniqueForFlow([
						...adlibContentFlow.content.timelineObjects,
						literal<TSR.TimelineObjAbstractAny>({
							id: '',
							enable: {
								while: '1'
							},
							priority: 1,
							layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
							content: {
								deviceType: TSR.DeviceType.ABSTRACT
							},
							classes: [Enablers.OFFTUBE_ENABLE_DVE]
						})
					])
				}
			})
		)

		let start = parsedCue.start ? CalculateTime(parsedCue.start) : 0
		start = start ? start : 0
		const end = parsedCue.end ? CalculateTime(parsedCue.end) : undefined
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partDefinition.externalId,
				name: `${parsedCue.template}`,
				enable: {
					start,
					...(end ? { duration: end - start } : {})
				},
				outputLayerId: 'pgm',
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				infiniteMode: PieceLifespan.OutOnNextPart,
				toBeQueued: true,
				content: {
					...pieceContent.content,
					timelineObjects: [
						...pieceContent.content.timelineObjects,
						literal<TSR.TimelineObjAbstractAny>({
							id: '',
							enable: {
								while: '1'
							},
							priority: 1,
							layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
							content: {
								deviceType: TSR.DeviceType.ABSTRACT
							},
							classes: [Enablers.OFFTUBE_ENABLE_DVE]
						})
					]
				},
				adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
				metaData: literal<PieceMetaData>({
					mediaPlayerSessions: [partDefinition.segmentExternalId]
				})
			})
		)
	}
}
