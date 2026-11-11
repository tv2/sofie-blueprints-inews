import * as _ from 'underscore'
import { DVEConfigInput } from '../helpers'
import { SwitcherInput } from '../types/config'
import { M2LXConfigurationError } from '../videoSwitchers/m2lxConfig'
import { isM2LXLayout, parseM2LXLayout } from '../videoSwitchers/m2lxLayout'
import { isM2LXSwitcher, SwitcherType } from '../videoSwitchers/types'

/**
 * Check that a template string is valid.
 * @param templateRaw User-provided template.
 */
export function TemplateIsValid(
	templateRaw: string,
	onNativeError?: (message: string) => void,
	switcherType?: SwitcherType,
	background?: SwitcherInput
): boolean {
	let template: any
	try {
		template = JSON.parse(templateRaw)
	} catch (e) {
		return false
	}
	if (isM2LXSwitcher(switcherType) || (switcherType === undefined && isM2LXLayout(template))) {
		try {
			parseM2LXLayout(template, background)
			return true
		} catch (error) {
			if (!(error instanceof M2LXConfigurationError)) {
				throw error
			}
			onNativeError?.(error.message)
			return false
		}
	}
	if (!template || typeof template !== 'object' || Array.isArray(template)) {
		return false
	}
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
