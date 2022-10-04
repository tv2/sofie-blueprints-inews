export interface PriorDefaultTableConfigItemGfxTemplates {
	VizTemplate: string
	SourceLayer: string
	LayerMapping: string
	INewsCode: string
	INewsName: string
	VizDestination: string
	OutType: string
	IsDesign: boolean
}

export const DEFAULT_GRAPHICS: PriorDefaultTableConfigItemGfxTemplates[] = [
	{
		INewsCode: '#kg',
		INewsName: 'arkiv',
		VizTemplate: 'arkiv',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsIdent',
		LayerMapping: 'graphic_overlay_ident'
	},
	{
		INewsCode: '#kg',
		INewsName: 'ident_blank',
		VizTemplate: 'ident',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsIdent',
		LayerMapping: 'graphic_overlay_ident'
	},
	{
		INewsCode: '#kg',
		INewsName: 'direkte',
		VizTemplate: 'direkte',
		VizDestination: 'OVL1',
		OutType: 'B',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsIdent',
		LayerMapping: 'graphic_overlay_ident'
	},
	{
		INewsCode: '#kg',
		INewsName: 'billederfra_logo',
		VizTemplate: 'billederfra_logo',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsIdent',
		LayerMapping: 'graphic_overlay_ident'
	},
	{
		INewsCode: '#kg',
		INewsName: 'ident_nyhederne',
		VizTemplate: 'ident_nyhederne',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsIdent',
		LayerMapping: 'graphic_overlay_ident'
	},
	{
		INewsCode: '#kg',
		INewsName: 'ident_news',
		VizTemplate: 'ident_news',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsIdent',
		LayerMapping: 'graphic_overlay_ident'
	},
	{
		INewsCode: '#kg',
		INewsName: 'ident_tv2sport',
		VizTemplate: 'ident_tv2sport',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsIdent',
		LayerMapping: 'graphic_overlay_ident'
	},
	{
		INewsCode: '#kg',
		INewsName: 'tlfdirekte',
		VizTemplate: 'tlfdirekte',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsIdent',
		LayerMapping: 'graphic_overlay_ident'
	},
	{
		INewsCode: '#kg',
		INewsName: 'topt',
		VizTemplate: 'topt',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsTop',
		LayerMapping: 'graphic_overlay_topt'
	},
	{
		INewsCode: '#kg',
		INewsName: 'tlftopt',
		VizTemplate: 'tlftopt',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsTop',
		LayerMapping: 'graphic_overlay_topt'
	},
	{
		INewsCode: '#kg',
		INewsName: 'tlftoptlive',
		VizTemplate: 'tlftoptlive',
		VizDestination: 'OVL1',
		OutType: 'S',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsTop',
		LayerMapping: 'graphic_overlay_topt'
	},
	{
		INewsCode: '#kg',
		INewsName: 'bund',
		VizTemplate: 'bund',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsLower',
		LayerMapping: 'graphic_overlay_lower'
	},
	{
		INewsCode: '#kg',
		INewsName: 'vaerter',
		VizTemplate: 'vaerter',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsLower',
		LayerMapping: 'graphic_overlay_lower'
	},
	{
		INewsCode: 'DIGI=',
		INewsName: 'vo',
		VizTemplate: 'vo',
		VizDestination: 'OVL1',
		OutType: 'S',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsHeadline',
		LayerMapping: 'graphic_overlay_headline'
	},
	{
		INewsCode: 'DIGI=',
		INewsName: 'trompet',
		VizTemplate: 'trompet',
		VizDestination: 'OVL1',
		OutType: 'B',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsHeadline',
		LayerMapping: 'graphic_overlay_headline'
	},
	{
		INewsCode: 'KG=',
		INewsName: 'bundright',
		VizTemplate: 'bund_right',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsLower',
		LayerMapping: 'graphic_overlay_lower'
	},
	{
		INewsCode: 'KG=',
		INewsName: 'TEMA_default',
		VizTemplate: 'TEMA_Default',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsTema',
		LayerMapping: 'graphic_overlay_tema'
	},
	{
		INewsCode: 'KG=',
		INewsName: 'TEMA_UPDATE',
		VizTemplate: 'TEMA_UPDATE',
		VizDestination: 'OVL1',
		OutType: 'S',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsTema',
		LayerMapping: 'graphic_overlay_tema'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_AFTERAAR_CYKEL',
		VizTemplate: 'DESIGN_AFTERAAR_CYKEL',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_HANDBOLD',
		VizTemplate: 'DESIGN_HANDBOLD',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_ISHOCKEY',
		VizTemplate: 'DESIGN_ISHOCKEY',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_KONTRA',
		VizTemplate: 'DESIGN_KONTRA',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_NBA',
		VizTemplate: 'DESIGN_NBA',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_SPORTS_LAB',
		VizTemplate: 'DESIGN_SPORTS_LAB',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_WTA',
		VizTemplate: 'DESIGN_WTA',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_VUELTA',
		VizTemplate: 'DESIGN_VUELTA',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_VM',
		VizTemplate: 'DESIGN_VM',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_WIMBLEDON',
		VizTemplate: 'DESIGN_WIMBLEDON',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_TDF',
		VizTemplate: 'DESIGN_TDF',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_ESPORT',
		VizTemplate: 'DESIGN_ESPORT',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'altud',
		VizTemplate: 'altud',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: '',
		LayerMapping: ''
	},
	{
		INewsCode: '#kg',
		INewsName: 'ovl-all-out',
		VizTemplate: 'altud',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: '',
		LayerMapping: ''
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_FODBOLD_20',
		VizTemplate: 'DESIGN_FODBOLD_20',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'temaud',
		VizTemplate: 'OUT_TEMA_H',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: '',
		LayerMapping: ''
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_ATP',
		VizTemplate: 'DESIGN_ATP',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: 'KG',
		INewsName: 'ovl-all-out',
		VizTemplate: 'altud',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: '',
		LayerMapping: ''
	},
	{
		INewsCode: '#kg',
		INewsName: 'ident_play',
		VizTemplate: 'ident_play',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsIdent',
		LayerMapping: 'graphic_overlay_ident'
	},
	{
		INewsCode: 'SS',
		INewsName: 'sc-stills',
		VizTemplate: 'VCP',
		VizDestination: 'WALL1',
		OutType: 'O',
		IsDesign: false,
		SourceLayer: 'studio0_wall_graphics',
		LayerMapping: 'graphic_wall'
	},
	{
		INewsCode: 'SS',
		INewsName: 'sc-loop',
		VizTemplate: 'SC_LOOP_ON',
		VizDestination: 'WALL1',
		OutType: 'O',
		IsDesign: false,
		SourceLayer: 'studio0_wall_graphics',
		LayerMapping: 'graphic_wall'
	},
	{
		INewsCode: 'SS',
		INewsName: 'sc_loop_clean',
		VizTemplate: 'SN_S4_LOOP_CLEAN',
		VizDestination: 'WALL1',
		OutType: 'O',
		IsDesign: false,
		SourceLayer: 'studio0_wall_graphics',
		LayerMapping: 'graphic_wall'
	},
	{
		INewsCode: 'GRAFIK',
		INewsName: 'FULL',
		VizTemplate: 'VCP',
		VizDestination: 'FULL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: '',
		LayerMapping: ''
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_X_GAMES',
		VizTemplate: 'DESIGN_X_GAMES',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'DESIGN_SC',
		VizTemplate: 'DESIGN_SC',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: true,
		SourceLayer: 'studio0_design',
		LayerMapping: 'graphic_design'
	},
	{
		INewsCode: '#kg',
		INewsName: 'ident_BILLEDER_FRA',
		VizTemplate: 'billederfra_txt',
		VizDestination: 'OVL1',
		OutType: '',
		IsDesign: false,
		SourceLayer: 'studio0_graphicsIdent',
		LayerMapping: 'graphic_overlay_ident'
	}
]
