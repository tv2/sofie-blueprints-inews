import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import {
	CalculateTime,
	CueDefinitionGraphic,
	GetGraphicDuration,
	GetInfiniteModeForGraphic,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	IsTargetingWall,
	PartDefinition,
	PartToParentClass
} from 'tv2-common'
import { ControlClasses, GraphicEngine } from 'tv2-constants'
import { BlueprintConfig } from '../config'
import { EvaluateCueGraphicInternal } from './graphicInternal'
import { EvaluateCueGraphicPilot } from './graphicPilot'
import { EvaluateCueRouting } from './routing'

export function EvaluateCueGraphic(
	config: BlueprintConfig,
	context: SegmentContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	adlib: boolean,
	partDefinition: PartDefinition,
	rank?: number
) {
	if (parsedCue.routing) {
		EvaluateCueRouting(config, context, pieces, adlibPieces, actions, partId, parsedCue.routing)
	}

	if (GraphicIsInternal(parsedCue)) {
		EvaluateCueGraphicInternal(
			config,
			context,
			pieces,
			adlibPieces,
			actions,
			partId,
			parsedCue,
			adlib,
			partDefinition,
			rank
		)
	} else if (GraphicIsPilot(parsedCue)) {
		EvaluateCueGraphicPilot(config, context, pieces, adlibPieces, actions, partId, parsedCue, adlib, rank)
	}
}

export function GetEnableForGrafik(
	config: BlueprintConfig,
	engine: GraphicEngine,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	isStickyIdent: boolean,
	partDefinition?: PartDefinition
): { while: string } | { start: number } {
	if (IsTargetingWall(engine)) {
		return {
			while: '1'
		}
	}

	if (
		((cue.end && cue.end.infiniteMode && cue.end.infiniteMode === 'B') ||
			GetInfiniteModeForGraphic(engine, config, cue, isStickyIdent) === PieceLifespan.OutOnSegmentEnd) &&
		partDefinition
	) {
		return { while: `.${PartToParentClass('studio0', partDefinition)} & !.adlib_deparent & !.full` }
	}

	if (isStickyIdent) {
		return {
			while: `.${ControlClasses.ShowIdentGraphic} & !.full`
		}
	}

	if (config.studio.PreventOverlayWithFull) {
		return {
			while: '!.full'
		}
	} else {
		return {
			start: 0
		}
	}
}

export function CreateTimingGrafik(
	config: BlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	defaultTime: boolean = true
): { start: number; duration?: number } {
	const ret: { start: number; duration?: number } = { start: 0, duration: 0 }
	const start = cue.start ? CalculateTime(cue.start) : 0
	start !== undefined ? (ret.start = start) : (ret.start = 0)

	const duration = GetGraphicDuration(config, cue, defaultTime)
	const end = cue.end
		? cue.end.infiniteMode
			? undefined
			: CalculateTime(cue.end)
		: duration
		? ret.start + duration
		: undefined
	ret.duration = end ? end - ret.start : undefined

	return ret
}
