import { IBlueprintPiece, IShowStyleUserContext, PieceLifespan, TSR } from 'blueprints-integration'
import { CueType, RobotCameraLayer, SharedOutputLayers, SharedSourceLayers } from '../../tv2-constants'
import { EvaluateCueRobotCamera } from '../cues/EvaluateCueRobotCamera'
import { CueDefinitionRobotCamera } from '../inewsConversion'

describe('EvaluateCueRobotCamera', () => {
	let context: IShowStyleUserContext

	beforeEach(() => {
		context = ({} as unknown) as IShowStyleUserContext
	})

	it('adds a Robot Camera piece', () => {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, '')

		expect(pieces).toHaveLength(1)
	})

	function createRobotCameraCueDefinition(presetShot?: number, startTimeInSeconds?: number): CueDefinitionRobotCamera {
		return {
			type: CueType.RobotCamera,
			presetIdentifier: presetShot ?? 1,
			iNewsCommand: '',
			start: {
				seconds: startTimeInSeconds
			}
		}
	}

	it('parse the externalId to the piece', () => {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition()
		const externalId: string = 'someExternalId'
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, externalId)

		expect(pieces[0].externalId).toEqual(externalId)
	})

	it('has lifeSpan withinPart', () => {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, '')

		expect(pieces[0].lifespan).toEqual(PieceLifespan.WithinPart)
	})

	it('creates a telemetrics timeline object', () => {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, '')

		expect(pieces[0].content.timelineObjects).toHaveLength(1)
		const result = pieces[0].content.timelineObjects[0]
		expect(result.layer).toEqual(RobotCameraLayer.TELEMETRICS)
		expect(result.content.deviceType).toEqual(TSR.DeviceType.TELEMETRICS)
	})

	it('timeline object has start time 0', () => {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, '')

		expect((pieces[0].content.timelineObjects[0].enable as { start: number }).start).toEqual(0)
	})

	it('has Robot Camera source layer', () => {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, '')

		expect(pieces[0].sourceLayerId).toEqual(SharedSourceLayers.RobotCamera)
	})

	it('has SEC for output layer', () => {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition()
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, '')

		expect(pieces[0].outputLayerId).toEqual(SharedOutputLayers.SEC)
	})

	it('receives cameraPreset 1, blueprint piece name is Robot[1]', () => {
		assertCorrectName(1)
	})

	function assertCorrectName(preset: number): void {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition(preset)
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, '')

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
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition(presetShot)
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, '')

		const result: TSR.TimelineObjTelemetrics = pieces[0].content.timelineObjects[0] as TSR.TimelineObjTelemetrics
		expect(result.content.presetShotIdentifiers).toEqual([presetShot])
	}

	it('receives cameraPreset 2, creates a timeline object with presetShotIdentifiers [2]', () => {
		assertCorrectShotPreset(2)
	})

	it('starts after 10 seconds, blueprint piece starts after 10.000 ms', () => {
		assertStartTime(10)
	})

	function assertStartTime(startTimeInSeconds: number): void {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition(1, startTimeInSeconds)
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, '')

		const result: IBlueprintPiece = pieces[0]
		expect(result.enable.start).toEqual(startTimeInSeconds * 1000)
	}

	it('starts after 20 seconds, blueprint piece starts after 20.000 ms', () => {
		assertStartTime(20)
	})

	it('has duration of one second', () => {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition(1)
		const pieces: IBlueprintPiece[] = []

		EvaluateCueRobotCamera(context, cueDefinition, pieces, '')

		const result: IBlueprintPiece = pieces[0]
		expect(result.enable.duration).toEqual(100)
	})

	it('already has a piece with another sourceLayer, creates a new piece', () => {
		const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition()
		const pieces: IBlueprintPiece[] = [createRobotCameraBlueprintPiece(SharedSourceLayers.PgmDesign)]

		EvaluateCueRobotCamera(context, cueDefinition, pieces, 'someOtherExternalId')

		expect(pieces.length).toEqual(2)
	})

	function createRobotCameraBlueprintPiece(sourceLayer: SharedSourceLayers, startTimeInMs?: number): IBlueprintPiece {
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
			const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition(1, 20)

			const existingPiece: IBlueprintPiece = createRobotCameraBlueprintPiece(SharedSourceLayers.RobotCamera, 10000)
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject(2))
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueRobotCamera(context, cueDefinition, pieces, 'randomExternalId')

			expect(pieces).toHaveLength(2)
		})

		function createTelemetricsTimelineObject(presetShot?: number): TSR.TimelineObjTelemetrics {
			return {
				id: '',
				enable: {
					start: 0
				},
				layer: RobotCameraLayer.TELEMETRICS,
				content: {
					deviceType: TSR.DeviceType.TELEMETRICS,
					presetShotIdentifiers: presetShot ? [presetShot] : []
				}
			}
		}

		it('has a blueprint piece with the same start time, no new timeline object is created', () => {
			const startTime: number = 20
			const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition(1, startTime)

			const existingPiece: IBlueprintPiece = createRobotCameraBlueprintPiece(
				SharedSourceLayers.RobotCamera,
				startTime * 1000
			)
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject())
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueRobotCamera(context, cueDefinition, pieces, 'randomExternalId')

			expect(pieces[0].content.timelineObjects).toHaveLength(1)
		})

		it('has a blueprint piece with the same start time, existing blueprint piece gets presetShotIdentifier added to timeline object', () => {
			const startTime: number = 20
			const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition(2, startTime)

			const existingPiece: IBlueprintPiece = createRobotCameraBlueprintPiece(
				SharedSourceLayers.RobotCamera,
				startTime * 1000
			)
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject(1))
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueRobotCamera(context, cueDefinition, pieces, 'randomExternalId')

			const timelineObject: TSR.TimelineObjTelemetrics = pieces[0].content
				.timelineObjects[0] as TSR.TimelineObjTelemetrics
			expect(timelineObject.content.presetShotIdentifiers).toEqual([1, 2])
		})

		it('has a blueprint piece with same start time and same presetIdentifier, no presetIdentifier is added', () => {
			const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition(1)

			const existingPiece: IBlueprintPiece = createRobotCameraBlueprintPiece(SharedSourceLayers.RobotCamera)
			existingPiece.name = 'Robot[1]'
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject(1))
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueRobotCamera(context, cueDefinition, pieces, 'randomExternalId')

			const timelineObject: TSR.TimelineObjTelemetrics = pieces[0].content
				.timelineObjects[0] as TSR.TimelineObjTelemetrics
			expect(timelineObject.content.presetShotIdentifiers).toEqual([1])
		})

		it('has a blueprint piece with same start time and same presetIdentifier, no new timeline object is created', () => {
			const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition(1)

			const existingPiece: IBlueprintPiece = createRobotCameraBlueprintPiece(SharedSourceLayers.RobotCamera)
			existingPiece.name = 'Robot[1]'
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject(1))
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueRobotCamera(context, cueDefinition, pieces, 'randomExternalId')

			expect(pieces).toHaveLength(1)
		})

		it('has a blueprint piece with same start time, name is updated to reflect presets in the piece', () => {
			const cueDefinition: CueDefinitionRobotCamera = createRobotCameraCueDefinition(2)

			const existingPiece: IBlueprintPiece = createRobotCameraBlueprintPiece(SharedSourceLayers.RobotCamera)
			existingPiece.name = 'Robot[1]'
			existingPiece.content.timelineObjects.push(createTelemetricsTimelineObject(1))
			const pieces: IBlueprintPiece[] = [existingPiece]

			EvaluateCueRobotCamera(context, cueDefinition, pieces, 'randomExternalId')

			expect(existingPiece.name).toEqual('Robot[1,2]')
		})
	})
})
