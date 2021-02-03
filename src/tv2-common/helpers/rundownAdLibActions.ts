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
import { AdlibActionType, AdlibTags } from 'tv2-constants'

interface GetTransitionActionSettings {
	SourceLayer: {
		Jingle: string
	}
	OutputLayer: {
		PGM: string
	}
}

export function GetTransitionAdLibActions<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(config: ShowStyleConfig, settings: GetTransitionActionSettings, startingRank: number): IBlueprintActionManifest[] {
	const res: IBlueprintActionManifest[] = []

	if (config.showStyle.ShowstyleTransition && config.showStyle.ShowstyleTransition.length) {
		const defaultTransition = config.showStyle.ShowstyleTransition

		const userData = ParseTransitionSetting(defaultTransition, true)

		res.push(makeTransitionAction(settings, userData, startingRank, config.showStyle.ShowstyleTransition))
	}

	startingRank++

	if (config.showStyle.Transitions) {
		config.showStyle.Transitions.forEach((transition, i) => {
			if (transition.Transition && transition.Transition.length) {
				const userData = ParseTransitionSetting(transition.Transition, true)

				res.push(makeTransitionAction(settings, userData, startingRank + 0.01 * i, transition.Transition))
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
	settings: GetTransitionActionSettings,
	userData: ActionTakeWithTransition,
	rank: number,
	label: string
): IBlueprintActionManifest {
	const tag = GetTagForTransition(userData.variant)

	return literal<IBlueprintActionManifest>({
		actionId: AdlibActionType.TAKE_WITH_TRANSITION,
		userData,
		userDataManifest: {},
		display: {
			_rank: rank,
			label: !!label.match(/^\d+$/) ? `EFFEKT ${label}` : label,
			sourceLayerId: settings.SourceLayer.Jingle,
			outputLayerId: settings.OutputLayer.PGM,
			tags: [AdlibTags.ADLIB_STATIC_BUTTON],
			currentPieceTags: [tag],
			nextPieceTags: [tag]
		}
	})
}
