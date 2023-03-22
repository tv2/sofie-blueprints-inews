import {
	IBlueprintPart,
	IBlueprintPartDB,
	IBlueprintPartInstance,
	IBlueprintPieceDB,
	IBlueprintPieceInstance,
	PieceLifespan,
	TSR
} from 'blueprints-integration'
import { ActionCutToCamera, ActionTakeWithTransition, literal, SourceDefinitionKam } from 'tv2-common'
import { AdlibActionType, NoteType, SharedOutputLayer, SourceType, SwitcherMixEffectLLayer } from 'tv2-constants'
import { ActionExecutionContextMock } from '../../__mocks__/context'
import { prefixLayer } from '../../tv2-common/__tests__/testUtil'
import { preprocessConfig as parseStudioConfig } from '../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { executeActionAFVD } from '../actions'
import { preprocessConfig as parseShowStyleConfig } from '../helpers/config'
import { SourceLayer } from '../layers'
import { MOCK_EFFEKT_1 } from './breakerConfigDefault'
import { defaultShowStyleConfig, defaultStudioConfig } from './configs'

const RUNDOWN_ID = 'MOCK_ACTION_RUNDOWN'
const SEGMENT_ID = 'MOCK_ACTION_SEGMENT'
const CURRENT_PART_ID = 'MOCK_PART_CURRENT'
const CURRENT_PART_EXTERNAL_ID = `${CURRENT_PART_ID}_EXTERNAL`
const NEXT_PART_ID = 'MOCK_PART_CURRENT'
const NEXT_PART_EXTERNAL_ID = `${CURRENT_PART_ID}_EXTERNAL`
const SOURCE_DEFINITION_KAM_1: SourceDefinitionKam = {
	sourceType: SourceType.KAM,
	id: '1',
	raw: 'Kam 1',
	minusMic: false,
	name: 'KAM 1'
}

const currentPartMock: IBlueprintPartInstance = {
	_id: CURRENT_PART_ID,
	segmentId: SEGMENT_ID,
	part: literal<IBlueprintPartDB>({
		_id: '',
		segmentId: SEGMENT_ID,
		externalId: '',
		title: 'Current Part'
	}),
	rehearsal: false
}

const kamPieceInstance: IBlueprintPieceInstance = {
	_id: 'kamPieceInstance',
	piece: literal<IBlueprintPieceDB>({
		_id: 'KAM 1 Current',
		enable: {
			start: 0
		},
		externalId: CURRENT_PART_EXTERNAL_ID,
		name: 'KAM 1',
		sourceLayerId: SourceLayer.PgmCam,
		outputLayerId: SharedOutputLayer.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: []
		}
	}),
	partInstanceId: ''
}

const evsPieceInstance: IBlueprintPieceInstance = {
	_id: 'evsPieceInstance',
	piece: literal<IBlueprintPieceDB>({
		_id: 'EVS 1 Current',
		enable: {
			start: 0
		},
		externalId: CURRENT_PART_EXTERNAL_ID,
		name: 'EVS 1',
		sourceLayerId: SourceLayer.PgmLocal,
		outputLayerId: SharedOutputLayer.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: []
		}
	}),
	partInstanceId: ''
}

// tslint:disable-next-line: variable-name
const nextPartMock_Cut: IBlueprintPartInstance = {
	_id: NEXT_PART_ID,
	segmentId: SEGMENT_ID,
	part: literal<IBlueprintPartDB>({
		_id: '',
		segmentId: SEGMENT_ID,
		externalId: '',
		title: 'Next Part'
	}),
	rehearsal: true
}

// tslint:disable-next-line: variable-name
const nextPartMock_Mix: IBlueprintPartInstance = {
	_id: NEXT_PART_ID,
	segmentId: SEGMENT_ID,
	part: literal<IBlueprintPartDB>({
		_id: '',
		segmentId: SEGMENT_ID,
		externalId: '',
		title: 'Next Part'
	}),
	rehearsal: true
}

// tslint:disable-next-line: variable-name
const nextPartMock_Effekt: IBlueprintPartInstance = {
	_id: NEXT_PART_ID,
	segmentId: SEGMENT_ID,
	part: literal<IBlueprintPartDB>({
		_id: '',
		segmentId: SEGMENT_ID,
		externalId: '',
		title: 'Next Part'
	}),
	rehearsal: true
}

// tslint:disable-next-line: variable-name
const kamPieceInstance_Cut: IBlueprintPieceInstance = {
	_id: 'kamPieceInstance_Cut',
	piece: literal<IBlueprintPieceDB>({
		_id: 'KAM 1 Next Cut',
		enable: {
			start: 0
		},
		externalId: NEXT_PART_EXTERNAL_ID,
		name: 'KAM 1',
		sourceLayerId: SourceLayer.PgmCam,
		outputLayerId: SharedOutputLayer.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: prefixLayer(SwitcherMixEffectLLayer.PROGRAM),
					enable: {
						start: 0
					},
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: 1,
							transition: TSR.AtemTransitionStyle.CUT
						}
					}
				})
			]
		}
	}),
	partInstanceId: ''
}

// tslint:disable-next-line: variable-name
const kamPieceInstance_Mix: IBlueprintPieceInstance = {
	_id: 'kamPieceInstance_Mix',
	piece: literal<IBlueprintPieceDB>({
		_id: 'KAM 1 Next Cut',
		enable: {
			start: 0
		},
		externalId: NEXT_PART_EXTERNAL_ID,
		name: 'KAM 1',
		sourceLayerId: SourceLayer.PgmCam,
		outputLayerId: SharedOutputLayer.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: prefixLayer(SwitcherMixEffectLLayer.PROGRAM),
					enable: {
						start: 0
					},
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: 1,
							transition: TSR.AtemTransitionStyle.MIX,
							transitionSettings: {
								mix: {
									rate: 12
								}
							}
						}
					}
				})
			]
		}
	}),
	partInstanceId: ''
}

// tslint:disable-next-line: variable-name
const kamPieceInstance_Effekt: IBlueprintPieceInstance = {
	_id: 'kamPieceInstance_Effekt',
	piece: literal<IBlueprintPieceDB>({
		_id: 'KAM 1 Next Cut',
		enable: {
			start: 0
		},
		externalId: NEXT_PART_EXTERNAL_ID,
		name: 'KAM 1',
		sourceLayerId: SourceLayer.PgmCam,
		outputLayerId: SharedOutputLayer.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: prefixLayer(SwitcherMixEffectLLayer.PROGRAM),
					enable: {
						start: 0
					},
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: 1,
							transition: TSR.AtemTransitionStyle.CUT
						}
					}
				})
			]
		}
	}),
	partInstanceId: ''
}

// tslint:disable-next-line: variable-name
const effektPieceInstance_1: IBlueprintPieceInstance = {
	_id: 'effektPieceInstance_1',
	piece: literal<IBlueprintPieceDB>({
		_id: 'EFFEKT 1',
		enable: {
			start: 0,
			duration: MOCK_EFFEKT_1.Duration
		},
		externalId: NEXT_PART_EXTERNAL_ID,
		name: 'EFFEKT 1',
		sourceLayerId: SourceLayer.PgmJingle,
		outputLayerId: SharedOutputLayer.JINGLE,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: []
		}
	}),
	partInstanceId: ''
}

// tslint:disable-next-line: variable-name
const evsPieceInstance_Cut: IBlueprintPieceInstance = {
	_id: 'evsPieceInstance_Cut',
	piece: literal<IBlueprintPieceDB>({
		_id: 'EVS 1 Next Cut',
		enable: {
			start: 0
		},
		externalId: NEXT_PART_EXTERNAL_ID,
		name: 'EVS 1',
		sourceLayerId: SourceLayer.PgmLocal,
		outputLayerId: SharedOutputLayer.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: prefixLayer(SwitcherMixEffectLLayer.PROGRAM),
					enable: {
						start: 0
					},
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: 1,
							transition: TSR.AtemTransitionStyle.CUT
						}
					}
				})
			]
		}
	}),
	partInstanceId: ''
}

// tslint:disable-next-line: variable-name
const evsPieceInstance_Mix: IBlueprintPieceInstance = {
	_id: 'evsPieceInstance_Mix',
	piece: literal<IBlueprintPieceDB>({
		_id: 'EVS 1 Next Cut',
		enable: {
			start: 0
		},
		externalId: NEXT_PART_EXTERNAL_ID,
		name: 'EVS 1',
		sourceLayerId: SourceLayer.PgmLocal,
		outputLayerId: SharedOutputLayer.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: prefixLayer(SwitcherMixEffectLLayer.PROGRAM),
					enable: {
						start: 0
					},
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: 1,
							transition: TSR.AtemTransitionStyle.MIX,
							transitionSettings: {
								mix: {
									rate: 12
								}
							}
						}
					}
				})
			]
		}
	}),
	partInstanceId: ''
}

// tslint:disable-next-line: variable-name
const evsPieceInstance_Effekt: IBlueprintPieceInstance = {
	_id: 'evsPieceInstance_Effekt',
	piece: literal<IBlueprintPieceDB>({
		_id: 'EVS 1 Next Cut',
		enable: {
			start: 0
		},
		externalId: NEXT_PART_EXTERNAL_ID,
		name: 'EVS 1',
		sourceLayerId: SourceLayer.PgmLocal,
		outputLayerId: SharedOutputLayer.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: prefixLayer(SwitcherMixEffectLLayer.PROGRAM),
					enable: {
						start: 0
					},
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: 1,
							transition: TSR.AtemTransitionStyle.CUT
						}
					}
				})
			]
		}
	}),
	partInstanceId: ''
}

async function getCameraPiece(
	context: ActionExecutionContextMock,
	part: 'current' | 'next'
): Promise<IBlueprintPieceInstance> {
	const piece = await context
		.getPieceInstances(part)
		.then((pieceInstance) => pieceInstance.find((p) => p.piece.sourceLayerId === SourceLayer.PgmCam))
	expect(piece).toBeTruthy()

	return piece!
}

async function getEVSPiece(
	context: ActionExecutionContextMock,
	part: 'current' | 'next'
): Promise<IBlueprintPieceInstance> {
	const piece = await context
		.getPieceInstances(part)
		.then((pieceInstances) => pieceInstances.find((p) => p.piece.sourceLayerId === SourceLayer.PgmLocal))
	expect(piece).toBeTruthy()

	return piece!
}

async function getTransitionPiece(
	context: ActionExecutionContextMock,
	part: 'current' | 'next'
): Promise<IBlueprintPieceInstance> {
	const piece = await context
		.getPieceInstances(part)
		.then((pieceInstances) => pieceInstances.find((p) => p.piece.sourceLayerId === SourceLayer.PgmJingle))
	expect(piece).toBeTruthy()

	return piece!
}

function getATEMMEObj(piece: IBlueprintPieceInstance): TSR.TimelineObjAtemME {
	const atemObj = (piece.piece.content.timelineObjects as TSR.TSRTimelineObj[]).find(
		(obj) =>
			obj.layer === prefixLayer(SwitcherMixEffectLLayer.PROGRAM) &&
			obj.content.deviceType === TSR.DeviceType.ATEM &&
			obj.content.type === TSR.TimelineContentTypeAtem.ME
	) as TSR.TimelineObjAtemME | undefined
	expect(atemObj).toBeTruthy()

	return atemObj!
}

function expectATEMToCut(piece: IBlueprintPieceInstance) {
	const atemObj = getATEMMEObj(piece)

	expect(atemObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
}

function expectATEMToMixOver(piece: IBlueprintPieceInstance, frames: number) {
	const atemObj = getATEMMEObj(piece)

	expect(atemObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
	expect(atemObj.content.me.transitionSettings?.mix).toStrictEqual({ rate: frames })
}

function expectTakeAfterExecute(context: ActionExecutionContextMock) {
	expect(context.takeAfterExecute).toBe(true)
}

function expectNoWarningsOrErrors(context: ActionExecutionContextMock) {
	expect(context.getNotes().filter((n) => n.type === NoteType.ERROR || n.type === NoteType.NOTIFY_USER_ERROR)).toEqual(
		[]
	)
	expect(
		context.getNotes().filter((n) => n.type === NoteType.WARNING || n.type === NoteType.NOTIFY_USER_WARNING)
	).toEqual([])
}

function makeMockContext(
	defaultTransition: 'cut' | 'mix' | 'effekt',
	currentPiece: 'cam' | 'evs',
	nextPiece: 'cam' | 'evs'
): ActionExecutionContextMock {
	switch (defaultTransition) {
		case 'cut': {
			const context = new ActionExecutionContextMock(
				'test',
				mappingsDefaults,
				parseStudioConfig,
				parseShowStyleConfig,
				RUNDOWN_ID,
				SEGMENT_ID,
				CURRENT_PART_ID,
				JSON.parse(JSON.stringify(currentPartMock)),
				[JSON.parse(JSON.stringify(currentPiece === 'cam' ? kamPieceInstance : evsPieceInstance_Cut))],
				JSON.parse(JSON.stringify(nextPartMock_Cut)),
				[JSON.parse(JSON.stringify(nextPiece === 'cam' ? kamPieceInstance_Cut : evsPieceInstance_Cut))]
			)
			context.studioConfig = defaultStudioConfig as any
			context.showStyleConfig = defaultShowStyleConfig as any
			return context
		}
		case 'mix': {
			const context = new ActionExecutionContextMock(
				'test',
				mappingsDefaults,
				parseStudioConfig,
				parseShowStyleConfig,
				RUNDOWN_ID,
				SEGMENT_ID,
				CURRENT_PART_ID,
				JSON.parse(JSON.stringify(currentPartMock)),
				[JSON.parse(JSON.stringify(currentPiece === 'cam' ? kamPieceInstance : evsPieceInstance))],
				JSON.parse(JSON.stringify(nextPartMock_Mix)),
				[JSON.parse(JSON.stringify(nextPiece === 'cam' ? kamPieceInstance_Mix : evsPieceInstance_Mix))]
			)
			context.studioConfig = defaultStudioConfig as any
			context.showStyleConfig = defaultShowStyleConfig as any
			return context
		}
		case 'effekt': {
			const context = new ActionExecutionContextMock(
				'test',
				mappingsDefaults,
				parseStudioConfig,
				parseShowStyleConfig,
				RUNDOWN_ID,
				SEGMENT_ID,
				CURRENT_PART_ID,
				JSON.parse(JSON.stringify(currentPartMock)),
				[JSON.parse(JSON.stringify(currentPiece === 'cam' ? kamPieceInstance : evsPieceInstance_Mix))],
				JSON.parse(JSON.stringify(nextPartMock_Effekt)),
				[
					JSON.parse(JSON.stringify(nextPiece === 'cam' ? kamPieceInstance_Effekt : evsPieceInstance_Effekt)),
					JSON.stringify(JSON.stringify(effektPieceInstance_1))
				]
			)
			context.studioConfig = defaultStudioConfig as any
			context.showStyleConfig = defaultShowStyleConfig as any
			return context
		}
	}
}

async function checkPartExistsWithProperties(
	context: ActionExecutionContextMock,
	part: 'current' | 'next',
	props: Partial<IBlueprintPart>
) {
	const partInstance = await context.getPartInstance(part)!

	if (partInstance === undefined) {
		fail('PartInstances must not be undefined')
	}

	for (const k in props) {
		if (k in partInstance.part) {
			expect({ [k]: partInstance.part[k as keyof IBlueprintPart] }).toEqual({ [k]: props[k as keyof IBlueprintPart] })
		} else {
			fail(`Key "${k}" not found in part`)
		}
	}
}

describe('Take with CUT', () => {
	it('Sets the take flag', async () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		await executeActionAFVD(
			context,
			AdlibActionType.TAKE_WITH_TRANSITION,
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'cut'
				},
				takeNow: true
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = await getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`CUT`)
		expectTakeAfterExecute(context)
	})

	it('Changes MIX on part to CUT', async () => {
		const context = makeMockContext('mix', 'cam', 'cam')

		await executeActionAFVD(
			context,
			AdlibActionType.TAKE_WITH_TRANSITION,
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'cut'
				},
				takeNow: true
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = await getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`CUT`)
		expectTakeAfterExecute(context)
	})

	it('Removes EFFEKT from Next', async () => {
		const context = makeMockContext('mix', 'cam', 'cam')

		await executeActionAFVD(
			context,
			AdlibActionType.TAKE_WITH_TRANSITION,
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'cut'
				},
				takeNow: true
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = await getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`CUT`)
		expectTakeAfterExecute(context)
	})
})

describe('Take with MIX', () => {
	it('Adds MIX to part with CUT as default', async () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		await executeActionAFVD(
			context,
			AdlibActionType.TAKE_WITH_TRANSITION,
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'mix',
					frames: 20
				},
				takeNow: true
			})
		)

		expectNoWarningsOrErrors(context)
		await checkPartExistsWithProperties(context, 'next', {
			inTransition: {
				previousPartKeepaliveDuration: 800,
				blockTakeDuration: 800,
				partContentDelayDuration: 0
			}
		})
		const camPiece = await getCameraPiece(context, 'next')
		expectATEMToMixOver(camPiece, 20)

		const transitionPiece = await getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`MIX 20`)
		expectTakeAfterExecute(context)
	})

	it('Changes MIX on part with MIX as default', async () => {
		const context = makeMockContext('mix', 'cam', 'cam')

		await executeActionAFVD(
			context,
			AdlibActionType.TAKE_WITH_TRANSITION,
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'mix',
					frames: 20
				},
				takeNow: true
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expectATEMToMixOver(camPiece, 20)

		const transitionPiece = await getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`MIX 20`)
		expectTakeAfterExecute(context)
	})

	it('Removes EFFEKT from Next', async () => {
		const context = makeMockContext('mix', 'cam', 'cam')

		await executeActionAFVD(
			context,
			AdlibActionType.TAKE_WITH_TRANSITION,
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'mix',
					frames: 20
				},
				takeNow: true
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expectATEMToMixOver(camPiece, 20)

		const transitionPiece = await getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`MIX 20`)
		expectTakeAfterExecute(context)
	})
})

describe('Take with EFFEKT', () => {
	it('Adds EFFEKT to part with CUT as default', async () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		await executeActionAFVD(
			context,
			AdlibActionType.TAKE_WITH_TRANSITION,
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'breaker',
					breaker: '1'
				},
				takeNow: true
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = await getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`EFFEKT 1`)
		expectTakeAfterExecute(context)
	})

	it('Removes MIX from Next', async () => {
		const context = makeMockContext('mix', 'cam', 'cam')

		await executeActionAFVD(
			context,
			AdlibActionType.TAKE_WITH_TRANSITION,
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'breaker',
					breaker: '1'
				},
				takeNow: true
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = await getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`EFFEKT 1`)
		expectTakeAfterExecute(context)
	})

	it('Adds EFFEKT to KAM when on EVS', async () => {
		const context = makeMockContext('cut', 'evs', 'cam')

		await executeActionAFVD(
			context,
			AdlibActionType.TAKE_WITH_TRANSITION,
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'breaker',
					breaker: '1'
				},
				takeNow: true
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = await getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`EFFEKT 1`)
		expectTakeAfterExecute(context)
	})

	it('Adds EFFEKT to EVS when on KAM', async () => {
		const context = makeMockContext('cut', 'cam', 'evs')

		await executeActionAFVD(
			context,
			AdlibActionType.TAKE_WITH_TRANSITION,
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'breaker',
					breaker: '1'
				},
				takeNow: true
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getEVSPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = await getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`EFFEKT 1`)
		expectTakeAfterExecute(context)
	})
})

describe('Camera shortcuts on server', () => {
	it('It cuts directly to a camera on a server', async () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		context.currentPieceInstances = [
			{
				_id: 'serverPieceInstance',
				piece: {
					_id: 'Server Current',
					enable: {
						start: 0
					},
					externalId: CURRENT_PART_EXTERNAL_ID,
					name: 'SERVER',
					sourceLayerId: SourceLayer.PgmServer,
					outputLayerId: SharedOutputLayer.PGM,
					lifespan: PieceLifespan.WithinPart,
					content: {
						timelineObjects: []
					}
				},
				partInstanceId: ''
			}
		]

		context.nextPart = undefined
		context.nextPieceInstances = []

		await executeActionAFVD(
			context,
			AdlibActionType.CUT_TO_CAMERA,
			literal<ActionCutToCamera>({
				type: AdlibActionType.CUT_TO_CAMERA,
				queue: false,
				sourceDefinition: SOURCE_DEFINITION_KAM_1
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expect(camPiece.piece.name).toEqual('KAM 1')
		expect(context.takeAfterExecute).toEqual(true)
	})

	it('It queues a camera without taking it', async () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		context.currentPieceInstances = [
			{
				_id: 'serverPieceInstance',
				piece: {
					_id: 'Server Current',
					enable: {
						start: 0
					},
					externalId: CURRENT_PART_EXTERNAL_ID,
					name: 'SERVER',
					sourceLayerId: SourceLayer.PgmServer,
					outputLayerId: SharedOutputLayer.PGM,
					lifespan: PieceLifespan.WithinPart,
					content: {
						timelineObjects: []
					}
				},
				partInstanceId: ''
			}
		]

		context.nextPart = undefined
		context.nextPieceInstances = []

		await executeActionAFVD(
			context,
			AdlibActionType.CUT_TO_CAMERA,
			literal<ActionCutToCamera>({
				type: AdlibActionType.CUT_TO_CAMERA,
				queue: true,
				sourceDefinition: SOURCE_DEFINITION_KAM_1
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expect(camPiece.piece.name).toEqual('KAM 1')
		expect(context.takeAfterExecute).toEqual(false)
	})
})

describe('Camera shortcuts on VO', () => {
	it('It cuts directly to a camera on a VO', async () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		context.currentPieceInstances = [
			{
				_id: 'voPieceInstance',
				piece: {
					_id: 'VO Current',
					enable: {
						start: 0
					},
					externalId: CURRENT_PART_EXTERNAL_ID,
					name: 'VO',
					sourceLayerId: SourceLayer.PgmVoiceOver,
					outputLayerId: SharedOutputLayer.PGM,
					lifespan: PieceLifespan.WithinPart,
					content: {
						timelineObjects: []
					}
				},
				partInstanceId: ''
			}
		]

		context.nextPart = undefined
		context.nextPieceInstances = []

		await executeActionAFVD(
			context,
			AdlibActionType.CUT_TO_CAMERA,
			literal<ActionCutToCamera>({
				type: AdlibActionType.CUT_TO_CAMERA,
				queue: false,
				sourceDefinition: SOURCE_DEFINITION_KAM_1
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expect(camPiece.piece.name).toEqual('KAM 1')
		expect(context.takeAfterExecute).toEqual(true)
	})

	it('It queues a camera without taking it', async () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		context.currentPieceInstances = [
			{
				_id: 'voPieceInstance',
				piece: {
					_id: 'VO Current',
					enable: {
						start: 0
					},
					externalId: CURRENT_PART_EXTERNAL_ID,
					name: 'VO',
					sourceLayerId: SourceLayer.PgmVoiceOver,
					outputLayerId: SharedOutputLayer.PGM,
					lifespan: PieceLifespan.WithinPart,
					content: {
						timelineObjects: []
					}
				},
				partInstanceId: ''
			}
		]

		context.nextPart = undefined
		context.nextPieceInstances = []

		await executeActionAFVD(
			context,
			AdlibActionType.CUT_TO_CAMERA,
			literal<ActionCutToCamera>({
				type: AdlibActionType.CUT_TO_CAMERA,
				queue: true,
				sourceDefinition: SOURCE_DEFINITION_KAM_1
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = await getCameraPiece(context, 'next')
		expect(camPiece.piece.name).toEqual('KAM 1')
		expect(context.takeAfterExecute).toEqual(false)
	})
})
