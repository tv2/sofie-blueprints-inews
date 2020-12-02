/**
 * TODO: This is a placeholder.
 * This will go to the graphics package and become a dependency of the blueprints.
 */

interface HTMLGraphic {
	[index: string]: {
		slot: string
		graphic: string
	}
}

export const graphicsTable: HTMLGraphic = {
	arkiv: {
		slot: '650_ident',
		graphic: 'Ident'
	},
	ident: {
		slot: '650_ident',
		graphic: 'Ident'
	},
	direkte: {
		slot: '650_ident',
		graphic: 'Ident'
	},
	ident_nyhederne: {
		slot: '650_ident',
		graphic: 'Ident'
	},
	ident_news: {
		slot: '650_ident',
		graphic: 'Ident'
	},
	ident_tv2sport: {
		slot: '650_ident',
		graphic: 'Ident'
	},
	billederfra_txt: {
		slot: '650_ident',
		graphic: 'Ident'
	},
	tlfdirekte: {
		slot: '650_ident',
		graphic: 'Ident'
	},
	billederfra_logo: {
		slot: '650_ident',
		graphic: 'BillederFra'
	},
	topt: {
		slot: '660_topt',
		graphic: 'Topt'
	},
	tlftopt: {
		slot: '660_topt',
		graphic: 'Topt'
	},
	tlftoptlive: {
		slot: '660_topt',
		graphic: 'Topt'
	},
	bund: {
		slot: '450_lowerThird',
		graphic: 'Bund'
	},
	vo: {
		slot: '450_lowerThird',
		graphic: 'Headline'
	},
	trompet: {
		slot: '450_lowerThird',
		graphic: 'Headline'
	},
	komm: {
		slot: '450_lowerThird',
		graphic: 'Headline'
	},
	kommentator: {
		slot: '450_lowerThird',
		graphic: 'Headline'
	},
	full: {
		slot: '250_full',
		graphic: 'Full'
	}
}

export interface Slots {
	[index: string]: Graphic<GraphicBase>
}

interface Graphic<T extends GraphicBase> {
	display?: 'program' | 'preview' | 'hidden'
	/** Set payload to null to reset values / clear */
	payload?: T | null
	style?: object
}

interface GraphicBase {
	[index: number]: string
	type: string
}
