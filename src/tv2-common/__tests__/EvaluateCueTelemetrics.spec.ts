import {
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan
} from '../../../../tv-automation-server-core/packages/blueprints-integration'
import {
	DeviceType,
	TimelineObjTelemetrics
} from '../../../../tv-automation-state-timeline-resolver/packages/timeline-state-resolver-types'
import { TimelineEnable } from '../../../../tv-automation-state-timeline-resolver/packages/timeline-state-resolver-types/dist/superfly-timeline'
import { CueType, RobotCameraLayer, SharedOutputLayers, SharedSourceLayers } from '../../tv2-constants'
import { EvaluateCueTelemetrics } from '../cues/EvaluateCueTelemetrics'
import { CueDefinitionTelemetrics } from '../inewsConversion'

describe('EvaluateCueTelemetrics', () => {
	let context: IShowStyleUserContext

	beforeEach(() => {
		context = ({} as unknown) as IShowStyleUserContext
	})

	it('adds a Telemetrics piece', () => {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, '')

		expect(pieces).toHaveLength(1)
	})

	function createTelemetricsCueDefinition(presetShot?: number, startTimeInSeconds?: number): CueDefinitionTelemetrics {
		return {
			type: CueType.Telemetrics,
			presetIdentifier: presetShot ?? 1,
			iNewsCommand: '',
			start: {
				seconds: startTimeInSeconds
			}
		}
	}

	it('parse the externalId to the piece', () => {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition()
		const externalId: string = 'someExternalId'
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, externalId)

		expect(pieces[0].externalId).toEqual(externalId)
	})

	it('has lifeSpan withinPart', () => {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, '')

		expect(pieces[0].lifespan).toEqual(PieceLifespan.WithinPart)
	})

	it('creates a telemetrics timeline object', () => {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, '')

		expect(pieces[0].content.timelineObjects).toHaveLength(1)
		const result = pieces[0].content.timelineObjects[0]
		expect(result.layer).toEqual(RobotCameraLayer.TELEMETRICS)
		expect(result.content.deviceType).toEqual(DeviceType.TELEMETRICS)
	})

	it('timeline object has start time 0', () => {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, '')

		expect((pieces[0].content.timelineObjects[0].enable as TimelineEnable).start).toEqual(0)
	})

	it('has Telemetrics source layer', () => {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, '')

		expect(pieces[0].sourceLayerId).toEqual(SharedSourceLayers.Telemetrics)
	})

	it('has SEC for output layer', () => {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, '')

		expect(pieces[0].outputLayerId).toEqual(SharedOutputLayers.SEC)
	})

	it('receives cameraPreset 1, blueprint piece name is Robot[1]', () => {
		assertCorrectName(1)
	})

	function assertCorrectName(preset: number): void {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition(preset)
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, '')

		const result: IBlueprintPiece = pieces[0]
		expect(result.name).toEqual(`Robot[${preset}]`)
	}

	it('receives cameraPreset 2, blueprint piece name is Robot[2]', () => {
		assertCorrectName(2)
	})

	it('receives cameraPreset 1, creates a timeline object with presetShotIdentifiers [1]', () => {
		assertCorrectShotPreset(1)
	})

	function assertCorrectShotPreset(presetShot: number): void {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition(presetShot)
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, '')

		const result: TimelineObjTelemetrics = pieces[0].content.timelineObjects[0] as TimelineObjTelemetrics
		expect(result.content.presetShotIdentifiers).toEqual([presetShot])
	}

	it('receives cameraPreset 2, creates a timeline object with presetShotIdentifiers [2]', () => {
		assertCorrectShotPreset(2)
	})

	it('starts after 10 seconds, blueprint piece starts after 10.000 ms', () => {
		assertStartTime(10)
	})

	function assertStartTime(startTimeInSeconds: number): void {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition(1, startTimeInSeconds)
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, '')

		const result: IBlueprintPiece = pieces[0]
		expect(result.enable.start).toEqual(startTimeInSeconds * 1000)
	}

	it('starts after 20 seconds, blueprint piece starts after 20.000 ms', () => {
		assertStartTime(20)
	})

	it('has duration of one second', () => {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition(1)
		const pieces: IBlueprintPiece[] = []

		EvaluateCueTelemetrics(context, cueDefinition, pieces, '')

		const result: IBlueprintPiece = pieces[0]
		expect(result.enable.duration).toEqual(100)
	})

	it('already has a piece with another sourceLayer, creates a new piece', () => {
		const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition()
		const pieces: IBlueprintPiece[] = [createTelemetricsBlueprintPiece(SharedSourceLayers.PgmDesign)]

		EvaluateCueTelemetrics(context, cueDefinition, pieces, 'someOtherExternalId')

		expect(pieces.length).toEqual(2)
	})

	function createTelemetricsBlueprintPiece(sourceLayer: SharedSourceLayers, startTimeInMs?: number): IBlueprintPiece {
		return {
			externalId: '',
			name: 'Robot',
			enable: {
				start: startTimeInMs ?? 0
			},
			lifespan: PieceLifespan.WithinPart,
			sourceLayerId: sourceLayer,
			outputLayerId: '',
			content: {
				timelineObjects: []
			}
		}
	}

	describe('already has a piece with same externalId', () => {
		it('has another start time, creates another blueprint piece', () => {
			const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition(1, 20)

			const existingPiece: IBlueprintPiece = createTelemetricsBlueprintPiece(SharedSourceLayers.Telemetrics, 10000)
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject(2))
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueTelemetrics(context, cueDefinition, pieces, 'randomExternalId')

			expect(pieces).toHaveLength(2)
		})

		function createTelemetricsTimelineObject(presetShot?: number): TimelineObjTelemetrics {
			return {
				id: '',
				enable: {
					start: 0
				},
				layer: RobotCameraLayer.TELEMETRICS,
				content: {
					deviceType: DeviceType.TELEMETRICS,
					presetShotIdentifiers: presetShot ? [presetShot] : []
				}
			}
		}

		it('has a blueprint piece with the same start time, no new timeline object is created', () => {
			const startTime: number = 20
			const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition(1, startTime)

			const existingPiece: IBlueprintPiece = createTelemetricsBlueprintPiece(
				SharedSourceLayers.Telemetrics,
				startTime * 1000
			)
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject())
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueTelemetrics(context, cueDefinition, pieces, 'randomExternalId')

			expect(pieces[0].content.timelineObjects).toHaveLength(1)
		})

		it('has a blueprint piece with the same start time, existing blueprint piece gets presetShotIdentifier added to timeline object', () => {
			const startTime: number = 20
			const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition(2, startTime)

			const existingPiece: IBlueprintPiece = createTelemetricsBlueprintPiece(
				SharedSourceLayers.Telemetrics,
				startTime * 1000
			)
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject(1))
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueTelemetrics(context, cueDefinition, pieces, 'randomExternalId')

			const timelineObject: TimelineObjTelemetrics = pieces[0].content.timelineObjects[0] as TimelineObjTelemetrics
			expect(timelineObject.content.presetShotIdentifiers).toEqual([1, 2])
		})

		it('has a blueprint piece with same start time and same presetIdentifier, no presetIdentifier is added', () => {
			const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition(1)

			const existingPiece: IBlueprintPiece = createTelemetricsBlueprintPiece(SharedSourceLayers.Telemetrics)
			existingPiece.name = 'Robot[1]'
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject(1))
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueTelemetrics(context, cueDefinition, pieces, 'randomExternalId')

			const timelineObject: TimelineObjTelemetrics = pieces[0].content.timelineObjects[0] as TimelineObjTelemetrics
			expect(timelineObject.content.presetShotIdentifiers).toEqual([1])
		})

		it('has a blueprint piece with same start time and same presetIdentifier, no new timeline object is created', () => {
			const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition(1)

			const existingPiece: IBlueprintPiece = createTelemetricsBlueprintPiece(SharedSourceLayers.Telemetrics)
			existingPiece.name = 'Robot[1]'
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject(1))
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueTelemetrics(context, cueDefinition, pieces, 'randomExternalId')

			expect(pieces).toHaveLength(1)
		})

		it('has a blueprint piece with same start time, name is updated to reflect presets in the piece', () => {
			const cueDefinition: CueDefinitionTelemetrics = createTelemetricsCueDefinition(2)

			const existingPiece: IBlueprintPiece = createTelemetricsBlueprintPiece(SharedSourceLayers.Telemetrics)
			existingPiece.name = 'Robot[1]'
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject(1))
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueTelemetrics(context, cueDefinition, pieces, 'randomExternalId')

			expect(existingPiece.name).toEqual('Robot[1,2]')
		})
	})
})
