import {
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../../common/util'
import { BlueprintConfig, DVEConfigInput } from '../../../tv2_afvd_showstyle/helpers/config'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { CueDefinitionDVE } from '../../inewsConversion/converters/ParseCue'
import { MakeContentDVE } from '../content/dve'
import { CalculateTime } from './evaluateCues'

export interface DVEConfigBox {
	enabled: boolean
	source: number
	x: number
	y: number
	size: number
	cropped: boolean
	cropTop: number
	cropBottom: number
	cropLeft: number
	cropRight: number
}

export interface DVEConfig {
	boxes: {
		[key: number]: DVEConfigBox
	}
	index: number
	properties: {
		artFillSource: number
		artCutSource: number
		artOption: number
		artPreMultiplied: boolean
		artClip: number
		artGain: number
		artInvertKey: boolean
	}
	border: {
		borderEnabled: boolean
		borderBevel: number
		borderOuterWidth: number
		borderInnerWidth: number
		borderOuterSoftness: number
		borderInnerSoftness: number
		borderBevelSoftness: number
		borderBevelPosition: number
		borderHue: number
		borderSaturation: number
		borderLuma: number
		borderLightSourceDirection: number
		borderLightSourceAltitude: number
	}
}

export function EvaluateDVE(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	adlib?: boolean,
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

	const content = MakeContentDVE(context, config, partDefinition.externalId, parsedCue, rawTemplate)

	if (content.valid) {
		if (adlib) {
			adlibPieces.push(
				literal<IBlueprintAdLibPiece>({
					_rank: rank || 0,
					externalId: partDefinition.externalId,
					name: `${partDefinition.storyName} DVE: ${parsedCue.template}`,
					outputLayerId: 'pgm',
					sourceLayerId: SourceLayer.PgmDVE,
					infiniteMode: PieceLifespan.OutOnNextPart,
					toBeQueued: true,
					content: content.content,
					adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0
				})
			)
		} else {
			let start = parsedCue.start ? CalculateTime(parsedCue.start) : 0
			start = start ? start : 0
			const end = parsedCue.end ? CalculateTime(parsedCue.end) : undefined
			pieces.push(
				literal<IBlueprintPiece>({
					_id: '',
					externalId: partDefinition.externalId,
					name: `DVE: ${parsedCue.template}`,
					enable: {
						start,
						...(end ? { duration: end - start } : {})
					},
					outputLayerId: 'pgm',
					sourceLayerId: SourceLayer.PgmDVE,
					infiniteMode: PieceLifespan.OutOnNextPart,
					toBeQueued: true,
					content: content.content,
					adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0
				})
			)
		}
	}
}

/**
 * Check that a template string is valid.
 * @param template User-provided template.
 */
export function TemplateIsValid(template: any): boolean {
	let boxesValid = false
	let indexValid = false
	let propertiesValid = false
	let borderValid = false
	if (Object.keys(template).indexOf('boxes') !== -1) {
		if (_.isEqual(Object.keys(template.boxes), ['0', '1', '2', '3'])) {
			boxesValid = true
		}
	}

	if (Object.keys(template).indexOf('index') !== -1) {
		indexValid = true
	}

	if (Object.keys(template).indexOf('properties') !== -1) {
		if (
			_.isEqual(Object.keys(template.properties), [
				'artFillSource',
				'artCutSource',
				'artOption',
				'artPreMultiplied',
				'artClip',
				'artGain',
				'artInvertKey'
			])
		) {
			propertiesValid = true
		}
	}

	if (Object.keys(template).indexOf('border') !== -1) {
		if (
			_.isEqual(Object.keys(template.border), [
				'borderEnabled',
				'borderBevel',
				'borderOuterWidth',
				'borderInnerWidth',
				'borderOuterSoftness',
				'borderInnerSoftness',
				'borderBevelSoftness',
				'borderBevelPosition',
				'borderHue',
				'borderSaturation',
				'borderLuma',
				'borderLightSourceDirection',
				'borderLightSourceAltitude'
			])
		) {
			borderValid = true
		}
	}

	if (boxesValid && indexValid && propertiesValid && borderValid) {
		return true
	}
	return false
}

export function GetDVETemplate(config: DVEConfigInput[], templateName: string): DVEConfigInput | undefined {
	return config ? config.find(c => c.DVEName.toString().toUpperCase() === templateName.toUpperCase()) : undefined
}
