import { IBlueprintPart, PieceLifespan, TSR } from '@tv2media/blueprints-integration'
import {
	CalculateTime,
	CreateTimingEnable,
	CueDefinitionGraphic,
	GetDefaultOut,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	LifeSpan,
	PartDefinition,
	PartToParentClass,
	TV2BlueprintConfig
} from 'tv2-common'
import { ControlClasses, GraphicEngine } from 'tv2-constants'
import { GetFullGraphicTemplateNameFromCue, IsTargetingTLF, IsTargetingWall } from '.'

export function GetInfiniteModeForGraphic(
	engine: GraphicEngine,
	config: TV2BlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	isStickyIdent?: boolean
): PieceLifespan {
	return IsTargetingWall(engine)
		? PieceLifespan.OutOnShowStyleEnd
		: IsTargetingTLF(engine)
		? PieceLifespan.WithinPart
		: isStickyIdent
		? PieceLifespan.OutOnSegmentEnd
		: parsedCue.end && parsedCue.end.infiniteMode
		? LifeSpan(parsedCue.end.infiniteMode, PieceLifespan.WithinPart)
		: FindInfiniteModeFromConfig(config, parsedCue)
}

export function FindInfiniteModeFromConfig(
	config: TV2BlueprintConfig,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>
): PieceLifespan {
	if (config.showStyle.GFXTemplates) {
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

		return LifeSpan(type, PieceLifespan.WithinPart)
	}

	return PieceLifespan.WithinPart
}

export function GetGraphicDuration(
	config: TV2BlueprintConfig,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	defaultTime: boolean
): number | undefined {
	if (config.showStyle.GFXTemplates) {
		if (GraphicIsInternal(cue)) {
			const template = config.showStyle.GFXTemplates.find(templ =>
				templ.INewsName ? templ.INewsName.toString().toUpperCase() === cue.graphic.template.toUpperCase() : false
			)
			if (template) {
				if (template.OutType && !template.OutType.toString().match(/default/i)) {
					return undefined
				}
			}
		} else if (GraphicIsPilot(cue)) {
			const template = config.showStyle.GFXTemplates.find(templ =>
				templ.INewsName
					? templ.INewsName.toString().toUpperCase() === cue.graphic.vcpid.toString().toUpperCase()
					: false
			)
			if (template) {
				if (template.OutType && !template.OutType.toString().match(/default/i)) {
					return undefined
				}
			}
		}
	}

	return defaultTime ? GetDefaultOut(config) : undefined
}

export function CreateTimingGraphic(
	config: TV2BlueprintConfig,
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

export function GetPartPrerollDuration(part: Readonly<Partial<IBlueprintPart>> | undefined): number {
	return (part && (part.transitionPrerollDuration || part.prerollDuration)) || 0
}

export function GetEnableForWall(part: Readonly<Partial<IBlueprintPart>> | undefined): TSR.TSRTimelineObj['enable'] {
	const partPrerollDuration = GetPartPrerollDuration(part)
	return partPrerollDuration
		? { start: partPrerollDuration }
		: {
				while: '1'
		  }
}

export function GetEnableForGraphic(
	config: TV2BlueprintConfig,
	part: Readonly<IBlueprintPart> | undefined,
	engine: GraphicEngine,
	cue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	isStickyIdent: boolean,
	partDefinition?: PartDefinition,
	adlib?: boolean
): TSR.TSRTimelineObj['enable'] {
	if (IsTargetingWall(engine)) {
		return GetEnableForWall(part)
	}

	if (
		((cue.end && cue.end.infiniteMode && cue.end.infiniteMode === 'B') ||
			GetInfiniteModeForGraphic(engine, config, cue, isStickyIdent) === PieceLifespan.OutOnSegmentEnd) &&
		partDefinition &&
		!adlib
	) {
		return { while: `.${PartToParentClass('studio0', partDefinition)} & !.adlib_deparent & !.full` }
	}

	if (isStickyIdent) {
		return {
			while: `.${ControlClasses.ShowIdentGraphic} & !.full`
		}
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
