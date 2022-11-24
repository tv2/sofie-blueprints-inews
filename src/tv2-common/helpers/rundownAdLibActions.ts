import { IBlueprintActionManifest } from 'blueprints-integration'
import {
	ActionTakeWithTransition,
	ActionTakeWithTransitionVariant,
	ActionTakeWithTransitionVariantBreaker,
	ActionTakeWithTransitionVariantCut,
	ActionTakeWithTransitionVariantDip,
	ActionTakeWithTransitionVariantMix,
	GetTagForTransition,
	literal,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayers, SharedSourceLayers } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { CreateJingleExpectedMedia } from '../content'
import { t } from './translation'

interface TransitionValues {
	rank: number
	label: string
	jingle: string
	alphaAtStart?: number
	duration?: number
	alphaAtEnd?: number
}

export function GetTransitionAdLibActions<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(config: ShowStyleConfig, startingRank: number): IBlueprintActionManifest[] {
	const blueprintActionManifests: IBlueprintActionManifest[] = []

	if (config.showStyle.ShowstyleTransition && config.showStyle.ShowstyleTransition.length) {
		blueprintActionManifests.push(
			...createActionsForTransition(config, config.showStyle.ShowstyleTransition, startingRank)
		)
	}

	startingRank++

	if (config.showStyle.Transitions) {
		const transitionActions: IBlueprintActionManifest[] = config.showStyle.Transitions.filter(
			transition => transition.Transition && transition.Transition.length
		).flatMap((transition, i) => createActionsForTransition(config, transition.Transition, startingRank + 0.01 * i))
		blueprintActionManifests.push(...transitionActions)
	}

	return blueprintActionManifests
}

function createActionsForTransition(
	config: TV2BlueprintConfig,
	transition: string,
	rank: number
): IBlueprintActionManifest[] {
	const jingleConfig = config.showStyle.BreakerConfig.find(j => j.BreakerName === transition)
	const transitionValues: TransitionValues = {
		rank,
		label: transition,
		jingle: jingleConfig?.ClipName ?? transition
	}

	if (jingleConfig) {
		transitionValues.alphaAtStart = jingleConfig.StartAlpha
		transitionValues.duration = jingleConfig.Duration
		transitionValues.alphaAtEnd = jingleConfig.EndAlpha
	}

	const variant: ActionTakeWithTransitionVariant = ParseTransitionString(transition)
	return [
		makeTransitionOnTakeAction(config, variant, transitionValues),
		makeTransitionOnNextTakeAction(config, variant, transitionValues)
	]
}

export function ParseTransitionString(transitionString: string): ActionTakeWithTransitionVariant {
	if (transitionString.match(/mix ?(\d+)/i)) {
		const props = transitionString.match(/mix ?(\d+)/i)
		return literal<ActionTakeWithTransitionVariantMix>({
			type: 'mix',
			frames: Number(props![1])
		})
	}

	if (transitionString.match(/dip ?(\d+)/i)) {
		const props = transitionString.match(/dip ?(\d+)/i)
		return literal<ActionTakeWithTransitionVariantDip>({
			type: 'dip',
			frames: Number(props![1])
		})
	}

	if (transitionString.match(/cut/i)) {
		return literal<ActionTakeWithTransitionVariantCut>({
			type: 'cut'
		})
	}

	return literal<ActionTakeWithTransitionVariantBreaker>({
		type: 'breaker',
		breaker: transitionString.toString().replace(/effekt ?/i, '')
	})
}

function makeTransitionOnTakeAction(
	config: TV2BlueprintConfig,
	variant: ActionTakeWithTransitionVariant,
	transitionValues: TransitionValues
): IBlueprintActionManifest {
	const userData: ActionTakeWithTransition = {
		type: AdlibActionType.TAKE_WITH_TRANSITION,
		variant,
		takeNow: true
	}
	return makeTransitionAction(config, userData, transitionValues, AdlibTags.ADLIB_TAKE_WITH_TRANSITION)
}

function makeTransitionOnNextTakeAction(
	config: TV2BlueprintConfig,
	variant: ActionTakeWithTransitionVariant,
	transitionValues: TransitionValues
): IBlueprintActionManifest {
	const userData: ActionTakeWithTransition = {
		type: AdlibActionType.TAKE_WITH_TRANSITION,
		variant,
		takeNow: false
	}
	return makeTransitionAction(config, userData, transitionValues, AdlibTags.ADLIB_NEXT_TAKE_WITH_TRANSITION)
}

function makeTransitionAction(
	config: TV2BlueprintConfig,
	userData: ActionTakeWithTransition,
	transitionValues: TransitionValues,
	adlibTag: AdlibTags
): IBlueprintActionManifest {
	const tag = GetTagForTransition(userData.variant)
	const isEffekt = /^\d+$/.test(transitionValues.label)

	return {
		externalId: `${JSON.stringify(userData)}_${AdlibActionType.TAKE_WITH_TRANSITION}_${transitionValues.rank}`,
		actionId: AdlibActionType.TAKE_WITH_TRANSITION,
		userData,
		userDataManifest: {},
		display: {
			_rank: transitionValues.rank,
			label: t(`${isEffekt ? 'EFFEKT ' : ''}${transitionValues.label}`),
			sourceLayerId: SharedSourceLayers.PgmAdlibJingle,
			outputLayerId: SharedOutputLayers.PGM,
			tags: [AdlibTags.ADLIB_STATIC_BUTTON, adlibTag],
			currentPieceTags: [tag],
			nextPieceTags: [tag],
			content:
				/^MIX ?\d+$/i.test(transitionValues.label) ||
				/^CUT$/i.test(transitionValues.label) ||
				/^DIP ?\d+$/i.test(transitionValues.label)
					? {}
					: CreateJingleExpectedMedia(
							config,
							transitionValues.jingle,
							transitionValues.alphaAtStart ?? 0,
							transitionValues.duration ?? 0,
							transitionValues.alphaAtEnd ?? 0
					  )
		}
	}
}
