/**
 * Cases to handle
 * 
 *  // FULL graphic pairing
 *  [
        "GRAFIK=FULL"
    ],
    [
        "]] S3.0 M 0 [[",
        "cg4 ]] 2 YNYBB 0 [[ pilotdata",
        "Senderplan/24-10-2019",
        "VCPID=2565134",
        "ContinueCount=-1",
        "Senderplan/24-10-2019"
    ]
 *  
 * MOSART=(L/F/W) standalone
 *  [
        "]] S3.0 M 0 [[",
        "cg4 ]] 1 YNYAB 0 [[ pilotdata",
        "LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|00:30",
        "VCPID=2520177",
        "ContinueCount=-1",
        "LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|00:30"
    ]
 *
 * TELEFON with pilot inline
 *  [
        'TELEFON=TLF 2',
        ']] S3.0 M 0 [[',
        'cg4 ]] 1 YNYAB 0 [[ pilotdata',
        'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
        'VCPID=2520177',
        'ContinueCount=-1',
        'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
    ]
 *
 * TELEFON with pilot pairing
 *  [
        'TELEFON=TLF 2',
    ],
    [
        ']] S3.0 M 0 [[',
        'cg4 ]] 1 YNYAB 0 [[ pilotdata',
        'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
        'VCPID=2520177',
        'ContinueCount=-1',
        'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
    ]
 *
 * #kg bund Some Text
 * [
 *      '#kg bund Some Text'
 * ]
 * 
 * CUSTOM=VCP
 *  [
        'CUSTOM=VCP'
    ],
    [
        ']] S3.0 M 0 [[',
        'cg4 ]] 1 YNYAB 0 [[ pilotdata',
        'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
        'VCPID=2520177',
        'ContinueCount=-1',
        'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
    ]
 * 
 * CUSTOM=SOMETHING
 *  [
        'CUSTOM=SOMETHING' // COULD BE VCP, COULD BE GRAPIC
    ]
 */

/**
 * HERE BE DRAGONS
    _______________     _______________
           \  / |(  \ /  )| \  /
            )/  |\\ <_> //|  \(
            /__ | \\((_// | __\
            /   \|__\\-`/__|/   \
                |   \)/   |
                    ((
                    )) 
                    //
                    /
 */

import { CueDefinitionBase } from './ParseCue'

// If unpaired when evaluated, throw warning. If target === 'FULL' create invalid part.
interface CueDefinitionUnpairedTarget extends CueDefinitionBase {
	target: 'OVL' | 'WALL' | 'FULL' | 'TLF'
	routing: {
		[input: string]: string // e.g. INP1=LIVE 1
	}
}

// If no target is found, throw warning.
interface CueDefintionUnpairedPilot extends CueDefinitionBase {
	name: string
	vcpid: number
	continueCount: number
}

// ['VIZ=full-triopage', 'triopage=DESIGN_SC', ';0.00.04']
// ['VIZ=dve-triopage', 'GRAFIK=DESIGN_SC', ';0.00.04']
// Background loop
// AFVD: Same loop used for FULL and DVE
interface CueDefintionBackgroundLoop extends CueDefinitionBase {
	target: 'FULL' | 'DVE'
	backgroundLoop: string
}

// ['VIZ=grafik-design', 'triopage=DESIGN_SC', ';0.00.04']
// UNUSED, NOT CURRENTLY SUPPORTED

// ['KG=DESIGN_FODBOLD', ';0.00.01']
// Viz Design
interface CueDefintionGraphicDesign extends CueDefinitionBase {
	design: string
}

interface CueDefintionGraphic extends CueDefinitionBase {
	target: 'OVL' | 'WALL' | 'FULL' | 'TLF'
	routing: {
		[input: string]: string
	}
	graphic:
		| {
				type: 'internal'
				template: string
				cue: string
				textFields: string[]
		  }
		| {
				type: 'pilot'
				name: string
				vcpid: number
				continueCount: number
		  }
}
