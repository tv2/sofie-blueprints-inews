/**
 * TODO: This is a placeholder.
 * This will go to the graphics package and become a dependency of the blueprints.
 */

interface Slots {
	'650_ident': Graphic<Ident | BillederFraLogo>
	'660_topt': Graphic<Topt>
	'450_lowerThird': Graphic<Bund | Headline>
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
	BILLEDERFRA_LOGO = 'BillederFra',
	BUND = 'Bund',
	HEADLINE = 'Headline',
	IDENT = 'Ident',
	TOPT = 'Topt'
}

interface GraphicBase {
	type: GraphicName
}

interface Bund extends GraphicBase {
	type: GraphicName.BUND
	name: string
	title: string
}

interface BillederFraLogo extends GraphicBase {
	type: GraphicName.BILLEDERFRA_LOGO
	logo: string // 6eren, 9, DK4, DR, Eurosport, Eurosport 2, Kanal5, TV3, TV3Plus, TV3sport1, TV3 sport 2, Viaplay, ViaSatGolf
}
interface Headline extends GraphicBase {
	type: GraphicName.HEADLINE
	headline: string
	text1: string
}

interface Ident extends GraphicBase {
	type: GraphicName.IDENT
	text1: string
	text2: string
}

interface Topt extends GraphicBase {
	type: GraphicName.TOPT
	name: string
	title: string
}

type GraphicType = Bund | BillederFraLogo | Headline | Ident | Topt

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
