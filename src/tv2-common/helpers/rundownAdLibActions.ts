import { IBlueprintActionManifest } from '@sofie-automation/blueprints-integration'
import {
	ActionTakeWithTransition,
	ActionTakeWithTransitionVariant,
	ActionTakeWithTransitionVariantBreaker,
	ActionTakeWithTransitionVariantCut,
	ActionTakeWithTransitionVariantMix,
	GetTagForTransition,
	literal,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayers, SharedSourceLayers } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { CreateJingleExpectedMedia } from '../content'

export function GetTransitionAdLibActions<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(config: ShowStyleConfig, startingRank: number): IBlueprintActionManifest[] {
	const res: IBlueprintActionManifest[] = []

	if (config.showStyle.ShowstyleTransition && config.showStyle.ShowstyleTransition.length) {
		const defaultTransition = config.showStyle.ShowstyleTransition

		const userData = ParseTransitionSetting(defaultTransition, true)

		const jingleConfig = config.showStyle.BreakerConfig.find(
			j => j.BreakerName === config.showStyle.ShowstyleTransition
		)
		let alphaAtStart: number | undefined

		if (jingleConfig) {
			alphaAtStart = jingleConfig.StartAlpha
		}

		res.push(makeTransitionAction(config, userData, startingRank, config.showStyle.ShowstyleTransition, alphaAtStart))
	}

	startingRank++

	if (config.showStyle.Transitions) {
		config.showStyle.Transitions.forEach((transition, i) => {
			if (transition.Transition && transition.Transition.length) {
				const userData = ParseTransitionSetting(transition.Transition, true)

				const jingleConfig = config.showStyle.BreakerConfig.find(j => j.BreakerName === transition.Transition)
				let alphaAtStart: number | undefined

				if (jingleConfig) {
					alphaAtStart = jingleConfig.StartAlpha
				}

				res.push(makeTransitionAction(config, userData, startingRank + 0.01 * i, transition.Transition, alphaAtStart))
			}
		})
	}

	return res
}

export function ParseTransitionSetting(transitionSetting: string, takeNow: boolean): ActionTakeWithTransition {
	let variant: ActionTakeWithTransitionVariant = literal<ActionTakeWithTransitionVariantCut>({
		type: 'cut'
	})

	if (transitionSetting.match(/mix ?(\d+)/i)) {
		const props = transitionSetting.match(/mix ?(\d+)/i)
		variant = literal<ActionTakeWithTransitionVariantMix>({
			type: 'mix',
			frames: Number(props![1])
		})
	} else if (transitionSetting.match(/cut/i)) {
		// Variant already setup
	} else {
		variant = literal<ActionTakeWithTransitionVariantBreaker>({
			type: 'breaker',
			breaker: transitionSetting.toString().replace(/effekt ?/i, '')
		})
	}

	return literal<ActionTakeWithTransition>({
		type: AdlibActionType.TAKE_WITH_TRANSITION,
		variant,
		takeNow
	})
}

function makeTransitionAction(
	config: TV2BlueprintConfig,
	userData: ActionTakeWithTransition,
	rank: number,
	label: string,
	alphaAtStart: number | undefined
): IBlueprintActionManifest {
	const tag = GetTagForTransition(userData.variant)
	const isEffekt = !!label.match(/^\d+$/)

	return literal<IBlueprintActionManifest>({
		actionId: AdlibActionType.TAKE_WITH_TRANSITION,
		userData,
		userDataManifest: {},
		display: {
			_rank: rank,
			label: isEffekt ? `EFFEKT ${label}` : label,
			sourceLayerId: SharedSourceLayers.PgmAdlibJingle,
			outputLayerId: SharedOutputLayers.PGM,
			tags: [AdlibTags.ADLIB_STATIC_BUTTON],
			currentPieceTags: [tag],
			nextPieceTags: [tag],
			content: isEffekt ? {} : CreateJingleExpectedMedia(config, label, alphaAtStart ?? 0)
		}
	})
}
