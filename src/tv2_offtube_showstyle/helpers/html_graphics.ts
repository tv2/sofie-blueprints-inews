/**
 * TODO: This is a placeholder.
 * This will go to the graphics package and become a dependency of the blueprints.
 */

const graphicsTable = {
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

// interface Slots {
// 	'650_ident': Graphic<Ident | BillederFraLogo>
// 	'660_topt': Graphic<Topt>
// 	'450_lowerThird': Graphic<Bund | Headline>
// }

// interface Graphic<T extends GraphicType> {
// 	cue: string
// 	display?: 'program' | 'preview' | 'hidden'
// 	/** Set payload to null to reset values / clear */
// 	,payload?: T | null
// style: {
// 		// tweaks/overrides
// 		x?: number
// 		y?: number
// 	}
// }

// const enum GraphicName {
// 	BILLEDERFRA_LOGO = 'BillederFra',
// 	BUND = 'Bund',
// 	HEADLINE = 'Headline',
// 	IDENT = 'Ident',
// 	TOPT = 'Topt'
// }

// interface GraphicBase {
// 	type: GraphicName
// 	cue: string
// }

// interface Bund extends GraphicBase {
// 	type: GraphicName.BUND
// 	cue: string
// 	name: string
// 	title: string
// }

// interface BillederFraLogo extends GraphicBase {
// 	type: GraphicName.BILLEDERFRA_LOGO
// 	cue: string
// 	logo: string // 6eren, 9, DK4, DR, Eurosport, Eurosport 2, Kanal5, TV3, TV3Plus, TV3sport1, TV3 sport 2, Viaplay, ViaSatGolf
// 	text1: string
// }
// interface Headline extends GraphicBase {
// 	type: GraphicName.HEADLINE
// 	cue: string
// 	headline: string
// 	text1: string
// }

// interface Ident extends GraphicBase {
// 	type: GraphicName.IDENT
// 	cue: string
// 	text1: string
// 	text2: string
// }

// interface Topt extends GraphicBase {
// 	type: GraphicName.TOPT
// 	cue: string
// 	name: string
// 	title: string
// }

// type GraphicType = Bund | BillederFraLogo | Headline | Ident | Topt
// cue: string

// interface RendererStateBase {
// 	,display: 'program' | 'preview' | 'hidden' | 'editor'
// rendererStyle: {}
// }

// interface RendererStateFull extends RendererStateBase {
// 	slots: Slots
// }

// interface RendererStatePartial extends RendererStateBase {
// 	partialUpdate: true
// 	slots: Partial<Slots>
// }

// type RendererState = RendererStatePartial | RendererStateFull
// cue: string
