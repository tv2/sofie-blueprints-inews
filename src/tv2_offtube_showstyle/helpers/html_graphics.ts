/**
 * TODO: This is a placeholder.
 * This will go to the graphics package and become a dependency of the blueprints.
 */

interface Slots {
	lowerThird: Graphic<Bund | Headline | Headline2 | Infobox>
	omlidt: Graphic<Omlidt>
	topRight: Graphic<Arkiv | BillederFraLogo | Direkte | Ident | Topt>
	dveLabels: Graphic<Locators>
}

interface Graphic<T extends GraphicType> {
	display?: 'program' | 'preview' | 'hidden'
	/** Set payload to null to reset values / clear */
	payload?: T | null
	style?: {
		// tweaks/overrides
		x?: number
		y?: number
	}
}

const enum GraphicName {
	ARKIV = 'ARKIV',
	BUND = 'BUND',
	BILLEDERFRA_LOGO = 'BILLEDERFRA_LOGO',
	DIREKTE = 'DIREKTE',
	IDENT = 'IDENT',
	TOPT = 'TOPT',
	LOCATORS = 'LOCATORS',
	OMLIDT = 'OMLIDT',
	HEADLINE = 'Headline',
	HEADLINE2 = 'HEADLINE2',
	INFOBOX = 'INFOBOX'
}

interface GraphicBase {
	type: GraphicName
}

interface Arkiv extends GraphicBase {
	type: GraphicName.ARKIV
	text: string
}

interface Bund extends GraphicBase {
	type: GraphicName.BUND
	firstLine: string
	secondLine: string
}

interface BillederFraLogo extends GraphicBase {
	type: GraphicName.BILLEDERFRA_LOGO
	logo: string // 6eren, 9, DK4, DR, Eurosport, Eurosport 2, Kanal5, TV3, TV3Plus, TV3sport1, TV3 sport 2, Viaplay, ViaSatGolf
}

interface Direkte extends GraphicBase {
	type: GraphicName.DIREKTE
	location: string // (København etc)
	tlf?: boolean // tlfdirekte
}

interface Headline extends GraphicBase {
	type: GraphicName.HEADLINE
	trompet: string
	text: string
}

interface Headline2 extends GraphicBase {
	type: GraphicName.HEADLINE2
}

interface Ident extends GraphicBase {
	type: GraphicName.IDENT
	variant: string // ident_nyhederne, ident_news, ident_tv2sport, ident_blank
	text?: string
}

interface Infobox extends GraphicBase {
	type: GraphicName.INFOBOX
}

interface Locators extends GraphicBase {
	type: GraphicName.LOCATORS
	[key: string]: string
}

interface Omlidt extends GraphicBase {
	type: GraphicName.OMLIDT
}

interface Topt extends GraphicBase {
	type: GraphicName.TOPT
	text: string
	live?: boolean
	tlf?: boolean // tlftopt
}

type GraphicType =
	| Arkiv
	| Bund
	| BillederFraLogo
	| Direkte
	| Headline
	| Headline2
	| Ident
	| Infobox
	| Locators
	| Omlidt
	| Topt

interface RendererStateBase {
	display: 'program' | 'preview' | 'hidden' | 'editor'
	rendererStyle?: {}
}

interface RendererStateFull extends RendererStateBase {
	slots: Slots
}

interface RendererStatePartial extends RendererStateBase {
	partialUpdate: true
	slots: Partial<Slots>
}

type RendererState = RendererStatePartial | RendererStateFull

const example1: RendererState = {
	display: 'program',
	partialUpdate: true,
	slots: {
		lowerThird: {
			payload: {
				type: GraphicName.BUND,
				firstLine: '',
				secondLine: ''
			}
		}
	}
}

const example2: RendererState = {
	display: 'program',
	partialUpdate: true,
	slots: {
		topRight: {
			payload: {
				type: GraphicName.TOPT,
				text: ''
			}
		}
	}
}

// baseline
const bundtBaseline: RendererState = {
	partialUpdate: true,
	display: 'program',
	slots: {
		lowerThird: {
			display: 'hidden'
		}
	}
}

const toptBaseline: RendererState = {
	partialUpdate: true,
	display: 'program',
	slots: {
		topRight: {
			display: 'hidden'
		}
	}
}

// arkiv,
// ident_blank,
// direkte,
//
// BillederFra_txt,
// billederfra_logo 6eren,
// billederfra_logo Canal 9,
// billederfra_logo DK4,
// billederfra_logo DR,
// billederfra_logo Eurosport,
// billederfra_logo Eurosport 2,
// billederfra_logo Kanal5,
// billederfra_logo TV3,
// billederfra_logo TV3Plus,
// billederfra_logo TV3sport1,
// billederfra_logo TV3 sport 2,
// billederfra_logo Viaplay,
// billederfra_logo ViaSatGolf,
//
// ident_nyhederne,
// ident_news,
// ident_tv2sport,
// tlfdirekte,
//
// topt,
// tlftopt,
// tlftoptlive,
//
// bund,
// DIGI=trompet , DIGI=vo
