import { PieceLifespan, TSR } from 'blueprints-integration'
import {
	CalculateTime,
	CreateTimingEnable,
	CueDefinitionGraphic,
	GetDefaultOut,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	LifeSpan,
	TableConfigItemGfxTemplate,
	TV2BlueprintConfig
} from 'tv2-common'
import { GraphicEngine } from 'tv2-constants'
import { GetFullGraphicTemplateNameFromCue, IsTargetingTLF, IsTargetingWall } from '.'

export function GetPieceLifespanForGraphic(
	engine: GraphicEngine,
	config: TV2BlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>
): PieceLifespan {
	if (IsTargetingWall(engine)) {
		return PieceLifespan.OutOnShowStyleEnd
	}
	if (IsTargetingTLF(engine)) {
		return PieceLifespan.WithinPart
	}
	if (parsedCue.end?.infiniteMode) {
		return LifeSpan(parsedCue.end.infiniteMode)
	}
	if (parsedCue.end && CalculateTime(parsedCue.end)) {
		return PieceLifespan.WithinPart
	}
	return FindInfiniteModeFromConfig(config, parsedCue)
}

export function FindInfiniteModeFromConfig(
	config: TV2BlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>
): PieceLifespan {
	const template = GetFullGraphicTemplateNameFromCue(config, parsedCue)
	const iNewsName = GraphicIsInternal(parsedCue) ? parsedCue.graphic.template : undefined
	const conf = config.showStyle.GFXTemplates.find(cnf =>
		cnf.VizTemplate
			? cnf.VizTemplate.toString().toUpperCase() === template.toUpperCase() &&
			  (iNewsName ? cnf.INewsName.toUpperCase() === iNewsName.toUpperCase() : true)
			: false
	)

	if (!conf) {
		return PieceLifespan.WithinPart
	}

	if (!conf.OutType || !conf.OutType.toString().length) {
		return PieceLifespan.WithinPart
	}

	const type = conf.OutType.toString().toUpperCase()

	if (type !== 'B' && type !== 'S' && type !== 'O') {
		return PieceLifespan.WithinPart
	}

	return LifeSpan(type)
}

export function GetGraphicDuration(
	config: TV2BlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>
): number | undefined {
	if (config.showStyle.GFXTemplates) {
		const template = findGfxTemplate(config, cue)
		if (template && template.OutType && !template.OutType.toString().match(/default/i)) {
			return undefined
		}
	}

	return GetDefaultOut(config)
}

export function CreateTimingGraphic(
	config: TV2BlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>
): { start: number; duration?: number } {
	const ret: { start: number; duration?: number } = { start: 0, duration: 0 }
	const start = cue.start ? CalculateTime(cue.start) : 0
	start !== undefined ? (ret.start = start) : (ret.start = 0)

	const duration = GetGraphicDuration(config, cue)
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

export function GetEnableForWall(): TSR.TSRTimelineObj['enable'] {
	return {
		while: '1'
	}
}

export function findGfxTemplate(
	config: TV2BlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>
): TableConfigItemGfxTemplate | undefined {
	let graphicId: string | undefined
	if (GraphicIsInternal(cue)) {
		graphicId = cue.graphic.template
	} else if (GraphicIsPilot(cue)) {
		graphicId = cue.graphic.vcpid.toString()
	}
	if (graphicId === undefined) {
		return undefined
	}
	return config.showStyle.GFXTemplates.find(templ =>
		templ.INewsName ? templ.INewsName.toString().toUpperCase() === graphicId?.toUpperCase() : false
	)
}
export function GetEnableForGraphic(
	config: TV2BlueprintConfig,
	engine: GraphicEngine,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>
): TSR.TSRTimelineObj['enable'] {
	if (IsTargetingWall(engine)) {
		return GetEnableForWall()
	}

	const timing = CreateTimingEnable(cue, GetDefaultOut(config))

	if (!timing.lifespan) {
		return timing.enable
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
