import {
	IBlueprintPart,
	IBlueprintPartDB,
	IBlueprintPartInstance,
	IBlueprintPieceDB,
	IBlueprintPieceInstance,
	PieceLifespan,
	TSR
} from '@sofie-automation/blueprints-integration'
import { ActionCutToCamera, ActionTakeWithTransition, literal } from 'tv2-common'
import { AdlibActionType } from 'tv2-constants'
import { AtemLLayer } from '../../tv2_afvd_studio/layers'
import { MockActionContext } from '../../tv2_offtube_showstyle/__tests__/actionExecutionContext.mock'
import { executeActionAFVD } from '../actions'
import { SourceLayer } from '../layers'
import { MOCK_EFFEKT_1 } from './breakerConfigDefault'

const SEGMENT_ID = 'MOCK_ACTION_SEGMENT'
const CURRENT_PART_ID = 'MOCK_PART_CURRENT'
const CURRENT_PART_EXTERNAL_ID = `${CURRENT_PART_ID}_EXTERNAL`
const NEXT_PART_ID = 'MOCK_PART_CURRENT'
const NEXT_PART_EXTERNAL_ID = `${CURRENT_PART_ID}_EXTERNAL`

const currentPartMock: IBlueprintPartInstance = {
	_id: CURRENT_PART_ID,
	segmentId: SEGMENT_ID,
	part: literal<IBlueprintPartDB>({
		_id: '',
		segmentId: SEGMENT_ID,
		externalId: '',
		title: 'Current Part'
	})
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
		outputLayerId: 'pgm',
		lifespan: PieceLifespan.WithinPart
	})
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
		sourceLayerId: SourceLayer.PgmDelayed,
		outputLayerId: 'pgm',
		lifespan: PieceLifespan.WithinPart
	})
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
	})
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
	})
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
	})
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
		outputLayerId: 'pgm',
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: AtemLLayer.AtemMEProgram,
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
	})
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
		outputLayerId: 'pgm',
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: AtemLLayer.AtemMEProgram,
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
	})
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
		outputLayerId: 'pgm',
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: AtemLLayer.AtemMEProgram,
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
	})
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
		outputLayerId: 'jingle',
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: []
		}
	})
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
		sourceLayerId: SourceLayer.PgmDelayed,
		outputLayerId: 'pgm',
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: AtemLLayer.AtemMEProgram,
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
	})
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
		sourceLayerId: SourceLayer.PgmDelayed,
		outputLayerId: 'pgm',
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: AtemLLayer.AtemMEProgram,
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
	})
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
		sourceLayerId: SourceLayer.PgmDelayed,
		outputLayerId: 'pgm',
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					layer: AtemLLayer.AtemMEProgram,
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
	})
}

function getCameraPiece(context: MockActionContext, part: 'current' | 'next'): IBlueprintPieceInstance {
	const piece = context.getPieceInstances(part).find(p => p.piece.sourceLayerId === SourceLayer.PgmCam)
	expect(piece).toBeTruthy()

	return piece!
}

function getEVSPiece(context: MockActionContext, part: 'current' | 'next'): IBlueprintPieceInstance {
	const piece = context.getPieceInstances(part).find(p => p.piece.sourceLayerId === SourceLayer.PgmDelayed)
	expect(piece).toBeTruthy()

	return piece!
}

function getTransitionPiece(context: MockActionContext, part: 'current' | 'next'): IBlueprintPieceInstance {
	const piece = context.getPieceInstances(part).find(p => p.piece.sourceLayerId === SourceLayer.PgmJingle)
	expect(piece).toBeTruthy()

	return piece!
}

function getATEMMEObj(piece: IBlueprintPieceInstance): TSR.TimelineObjAtemME {
	const atemObj = (piece.piece.content!.timelineObjects as TSR.TSRTimelineObj[]).find(
		obj =>
			obj.layer === AtemLLayer.AtemMEProgram &&
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

function expectTakeAfterExecute(context: MockActionContext) {
	expect(context.takeAfterExecute).toBe(true)
}

function expectNoWarningsOrErrors(context: MockActionContext) {
	expect(context.warnings).toEqual([])
	expect(context.errors).toEqual([])
}

function makeMockContext(
	defaultTransition: 'cut' | 'mix' | 'effekt',
	currentPiece: 'cam' | 'evs',
	nextPiece: 'cam' | 'evs'
): MockActionContext {
	switch (defaultTransition) {
		case 'cut':
			return new MockActionContext(
				SEGMENT_ID,
				JSON.parse(JSON.stringify(currentPartMock)),
				[JSON.parse(JSON.stringify(currentPiece === 'cam' ? kamPieceInstance : evsPieceInstance_Cut))],
				JSON.parse(JSON.stringify(nextPartMock_Cut)),
				[JSON.parse(JSON.stringify(nextPiece === 'cam' ? kamPieceInstance_Cut : evsPieceInstance_Cut))]
			)
		case 'mix':
			return new MockActionContext(
				SEGMENT_ID,
				JSON.parse(JSON.stringify(currentPartMock)),
				[JSON.parse(JSON.stringify(currentPiece === 'cam' ? kamPieceInstance : evsPieceInstance))],
				JSON.parse(JSON.stringify(nextPartMock_Mix)),
				[JSON.parse(JSON.stringify(nextPiece === 'cam' ? kamPieceInstance_Mix : evsPieceInstance_Mix))]
			)
			break
		case 'effekt':
			return new MockActionContext(
				SEGMENT_ID,
				JSON.parse(JSON.stringify(currentPartMock)),
				[JSON.parse(JSON.stringify(currentPiece === 'cam' ? kamPieceInstance : evsPieceInstance_Mix))],
				JSON.parse(JSON.stringify(nextPartMock_Effekt)),
				[
					JSON.parse(JSON.stringify(nextPiece === 'cam' ? kamPieceInstance_Effekt : evsPieceInstance_Effekt)),
					JSON.stringify(JSON.stringify(effektPieceInstance_1))
				]
			)
			break
	}
}

function checkPartExistsWithProperties(
	context: MockActionContext,
	part: 'current' | 'next',
	props: Partial<IBlueprintPart>
) {
	const partInstance = context.getPartInstance(part)!
	expect(partInstance).toBeTruthy()

	for (const k in props) {
		if (k in partInstance.part) {
			expect({ [k]: partInstance.part[k as keyof IBlueprintPart] }).toEqual({ [k]: props[k as keyof IBlueprintPart] })
		} else {
			fail(`Key "${k}" not found in part`)
		}
	}
}

describe('Take with CUT', () => {
	it('Sets the take flag', () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		executeActionAFVD(
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
		const camPiece = getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`CUT`)
		expectTakeAfterExecute(context)
	})

	it('Changes MIX on part to CUT', () => {
		const context = makeMockContext('mix', 'cam', 'cam')

		executeActionAFVD(
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
		const camPiece = getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`CUT`)
		expectTakeAfterExecute(context)
	})

	it('Removes EFFEKT from Next', () => {
		const context = makeMockContext('mix', 'cam', 'cam')

		executeActionAFVD(
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
		const camPiece = getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`CUT`)
		expectTakeAfterExecute(context)
	})
})

describe('Take with MIX', () => {
	it('Adds MIX to part with CUT as default', () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		executeActionAFVD(
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
		checkPartExistsWithProperties(context, 'next', {
			transitionKeepaliveDuration: 800
		})
		const camPiece = getCameraPiece(context, 'next')
		expectATEMToMixOver(camPiece, 20)

		const transitionPiece = getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`MIX 20`)
		expectTakeAfterExecute(context)
	})

	it('Changes MIX on part with MIX as default', () => {
		const context = makeMockContext('mix', 'cam', 'cam')

		executeActionAFVD(
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
		const camPiece = getCameraPiece(context, 'next')
		expectATEMToMixOver(camPiece, 20)

		const transitionPiece = getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`MIX 20`)
		expectTakeAfterExecute(context)
	})

	it('Removes EFFEKT from Next', () => {
		const context = makeMockContext('mix', 'cam', 'cam')

		executeActionAFVD(
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
		const camPiece = getCameraPiece(context, 'next')
		expectATEMToMixOver(camPiece, 20)

		const transitionPiece = getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`MIX 20`)
		expectTakeAfterExecute(context)
	})
})

describe('Take with EFFEKT', () => {
	it('Adds EFFEKT to part with CUT as default', () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		executeActionAFVD(
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
		const camPiece = getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`EFFEKT 1`)
		expectTakeAfterExecute(context)
	})

	it('Removes MIX from Next', () => {
		const context = makeMockContext('mix', 'cam', 'cam')

		executeActionAFVD(
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
		const camPiece = getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`EFFEKT 1`)
		expectTakeAfterExecute(context)
	})

	it('Adds EFFEKT to KAM when on EVS', () => {
		const context = makeMockContext('cut', 'evs', 'cam')

		executeActionAFVD(
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
		const camPiece = getCameraPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`EFFEKT 1`)
		expectTakeAfterExecute(context)
	})

	it('Adds EFFEKT to EVS when on KAM', () => {
		const context = makeMockContext('cut', 'cam', 'evs')

		executeActionAFVD(
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
		const camPiece = getEVSPiece(context, 'next')
		expectATEMToCut(camPiece)

		const transitionPiece = getTransitionPiece(context, 'next')
		expect(transitionPiece.piece.name).toBe(`EFFEKT 1`)
		expectTakeAfterExecute(context)
	})
})

describe('Camera shortcuts on server', () => {
	it('It cuts directly to a camera on a server', () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		context.currentPieceInstances = [
			literal<IBlueprintPieceInstance>({
				_id: 'serverPieceInstance',
				piece: literal<IBlueprintPieceDB>({
					_id: 'Server Current',
					enable: {
						start: 0
					},
					externalId: CURRENT_PART_EXTERNAL_ID,
					name: 'SERVER',
					sourceLayerId: SourceLayer.PgmServer,
					outputLayerId: 'pgm',
					lifespan: PieceLifespan.WithinPart
				})
			})
		]

		context.nextPart = undefined
		context.nextPieceInstances = []

		executeActionAFVD(
			context,
			AdlibActionType.CUT_TO_CAMERA,
			literal<ActionCutToCamera>({
				type: AdlibActionType.CUT_TO_CAMERA,
				queue: false,
				name: '1'
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = getCameraPiece(context, 'next')
		expect(camPiece.piece.name).toEqual('KAM 1')
		expect(context.takeAfterExecute).toEqual(true)
	})

	it('It queues a camera without taking it', () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		context.currentPieceInstances = [
			literal<IBlueprintPieceInstance>({
				_id: 'serverPieceInstance',
				piece: literal<IBlueprintPieceDB>({
					_id: 'Server Current',
					enable: {
						start: 0
					},
					externalId: CURRENT_PART_EXTERNAL_ID,
					name: 'SERVER',
					sourceLayerId: SourceLayer.PgmServer,
					outputLayerId: 'pgm',
					lifespan: PieceLifespan.WithinPart
				})
			})
		]

		context.nextPart = undefined
		context.nextPieceInstances = []

		executeActionAFVD(
			context,
			AdlibActionType.CUT_TO_CAMERA,
			literal<ActionCutToCamera>({
				type: AdlibActionType.CUT_TO_CAMERA,
				queue: true,
				name: '1'
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = getCameraPiece(context, 'next')
		expect(camPiece.piece.name).toEqual('KAM 1')
		expect(context.takeAfterExecute).toEqual(false)
	})
})

describe('Camera shortcuts on VO', () => {
	it('It cuts directly to a camera on a VO', () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		context.currentPieceInstances = [
			literal<IBlueprintPieceInstance>({
				_id: 'voPieceInstance',
				piece: literal<IBlueprintPieceDB>({
					_id: 'VO Current',
					enable: {
						start: 0
					},
					externalId: CURRENT_PART_EXTERNAL_ID,
					name: 'VO',
					sourceLayerId: SourceLayer.PgmVoiceOver,
					outputLayerId: 'pgm',
					lifespan: PieceLifespan.WithinPart
				})
			})
		]

		context.nextPart = undefined
		context.nextPieceInstances = []

		executeActionAFVD(
			context,
			AdlibActionType.CUT_TO_CAMERA,
			literal<ActionCutToCamera>({
				type: AdlibActionType.CUT_TO_CAMERA,
				queue: false,
				name: '1'
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = getCameraPiece(context, 'next')
		expect(camPiece.piece.name).toEqual('KAM 1')
		expect(context.takeAfterExecute).toEqual(true)
	})

	it('It queues a camera without taking it', () => {
		const context = makeMockContext('cut', 'cam', 'cam')

		context.currentPieceInstances = [
			literal<IBlueprintPieceInstance>({
				_id: 'voPieceInstance',
				piece: literal<IBlueprintPieceDB>({
					_id: 'VO Current',
					enable: {
						start: 0
					},
					externalId: CURRENT_PART_EXTERNAL_ID,
					name: 'VO',
					sourceLayerId: SourceLayer.PgmVoiceOver,
					outputLayerId: 'pgm',
					lifespan: PieceLifespan.WithinPart
				})
			})
		]

		context.nextPart = undefined
		context.nextPieceInstances = []

		executeActionAFVD(
			context,
			AdlibActionType.CUT_TO_CAMERA,
			literal<ActionCutToCamera>({
				type: AdlibActionType.CUT_TO_CAMERA,
				queue: true,
				name: '1'
			})
		)

		expectNoWarningsOrErrors(context)
		const camPiece = getCameraPiece(context, 'next')
		expect(camPiece.piece.name).toEqual('KAM 1')
		expect(context.takeAfterExecute).toEqual(false)
	})
})
