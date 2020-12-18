/**
 * TODO: This is a placeholder.
 * This will go to the graphics package and become a dependency of the blueprints.
 */

interface HTMLGraphic {
	[index: string]:
		| {
				slot: string
		  }
		| undefined
}

export const graphicsTable: HTMLGraphic = {
	arkiv: {
		slot: '650_ident'
	},
	ident: {
		slot: '650_ident'
	},
	direkte: {
		slot: '650_ident'
	},
	ident_nyhederne: {
		slot: '650_ident'
	},
	ident_news: {
		slot: '650_ident'
	},
	ident_tv2sport: {
		slot: '650_ident'
	},
	billederfra_txt: {
		slot: '650_ident'
	},
	tlfdirekte: {
		slot: '650_ident'
	},
	billederfra_logo: {
		slot: '650_ident'
	},
	topt: {
		slot: '660_topt'
	},
	tlftopt: {
		slot: '660_topt'
	},
	tlftoptlive: {
		slot: '660_topt'
	},
	bund: {
		slot: '450_lowerThird'
	},
	vo: {
		slot: '450_lowerThird'
	},
	trompet: {
		slot: '450_lowerThird'
	},
	komm: {
		slot: '450_lowerThird'
	},
	kommentator: {
		slot: '450_lowerThird'
	},
	full: {
		slot: '250_full'
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
