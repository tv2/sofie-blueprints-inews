import { IBlueprintActionManifest } from '@tv2media/blueprints-integration'
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
import { t } from './translation'

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
		let duration: number | undefined
		let alphaAtEnd: number | undefined

		if (jingleConfig) {
			alphaAtStart = jingleConfig.StartAlpha
			duration = jingleConfig.Duration
			alphaAtEnd = jingleConfig.EndAlpha
		}

		res.push(
			makeTransitionAction(
				config,
				userData,
				startingRank,
				config.showStyle.ShowstyleTransition,
				jingleConfig?.ClipName ?? config.showStyle.ShowstyleTransition,
				alphaAtStart,
				duration,
				alphaAtEnd
			)
		)
	}

	startingRank++

	if (config.showStyle.Transitions) {
		config.showStyle.Transitions.forEach((transition, i) => {
			if (transition.Transition && transition.Transition.length) {
				const userData = ParseTransitionSetting(transition.Transition, true)

				const jingleConfig = config.showStyle.BreakerConfig.find(j => j.BreakerName === transition.Transition)
				let alphaAtStart: number | undefined
				let duration: number | undefined
				let alphaAtEnd: number | undefined

				if (jingleConfig) {
					alphaAtStart = jingleConfig.StartAlpha
					duration = jingleConfig.Duration
					alphaAtEnd = jingleConfig.EndAlpha
				}

				res.push(
					makeTransitionAction(
						config,
						userData,
						startingRank + 0.01 * i,
						transition.Transition,
						jingleConfig?.ClipName ?? transition.Transition,
						alphaAtStart,
						duration,
						alphaAtEnd
					)
				)
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
	jingle: string,
	alphaAtStart: number | undefined,
	duration: number | undefined,
	alphaAtEnd: number | undefined
): IBlueprintActionManifest {
	const tag = GetTagForTransition(userData.variant)
	const isEffekt = !!label.match(/^\d+$/)

	return literal<IBlueprintActionManifest>({
		actionId: AdlibActionType.TAKE_WITH_TRANSITION,
		userData,
		userDataManifest: {},
		display: {
			_rank: rank,
			label: t(isEffekt ? `EFFEKT ${label}` : label),
			sourceLayerId: SharedSourceLayers.PgmAdlibJingle,
			outputLayerId: SharedOutputLayers.PGM,
			tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_TAKE_WITH_TRANSITION],
			currentPieceTags: [tag],
			nextPieceTags: [tag],
			content:
				isEffekt || !!label.match(/^MIX ?\d+$/i) || !!label.match(/^CUT$/i)
					? {}
					: CreateJingleExpectedMedia(config, jingle, alphaAtStart ?? 0, duration ?? 0, alphaAtEnd ?? 0)
		}
	})
}
