import { SourceLayerType, TSR } from '@tv2media/blueprints-integration'
import {
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForRemote,
	GetSisyfosTimelineObjForReplay,
	SourceInfoType
} from 'tv2-common'
import { SharedSisyfosLLayer } from 'tv2-constants'
import { makeMockAFVDContext } from '../../../__mocks__/context'
import { getConfig } from '../../../tv2_afvd_showstyle/helpers/config'

describe('Sisyfos', () => {
	const config = getConfig(makeMockAFVDContext())
	it('Enables audio layers for cameras', () => {
		const sourceInfo = {
			type: SourceInfoType.KAM,
			sourceLayerType: SourceLayerType.CAMERA,
			id: '1',
			port: 1,
			sisyfosLayers: ['some_layer', 'some_layer2'],
			useStudioMics: false
		}
		const timelineObjects = GetSisyfosTimelineObjForCamera(config, sourceInfo, false)
		expect(timelineObjects.length).toBe(2)
		expect(timelineObjects[0].layer).toBe('some_layer')
		expect((timelineObjects[0] as TSR.TimelineObjSisyfosChannel).content.isPgm).toBe(1)
		expect(timelineObjects[1].layer).toBe('some_layer2')
		expect((timelineObjects[1] as TSR.TimelineObjSisyfosChannel).content.isPgm).toBe(1)
	})
	it('Enables studio mics for cameras', () => {
		const sourceInfo = {
			type: SourceInfoType.KAM,
			sourceLayerType: SourceLayerType.CAMERA,
			id: '1',
			port: 1,
			sisyfosLayers: ['some_layer', 'some_layer2'],
			useStudioMics: true
		}
		const timelineObjects = GetSisyfosTimelineObjForCamera(config, sourceInfo, false)
		expect(timelineObjects.length).toBe(3)
		const studioMicsTimelineObject = timelineObjects.find(t => t.layer === SharedSisyfosLLayer.SisyfosGroupStudioMics)
		expect(studioMicsTimelineObject).toBeDefined()
	})
	it('Does not enable studio mics for "minus mic" cameras', () => {
		const sourceInfo = {
			type: SourceInfoType.KAM,
			sourceLayerType: SourceLayerType.CAMERA,
			id: '1',
			port: 1,
			sisyfosLayers: ['some_layer', 'some_layer2'],
			useStudioMics: true
		}
		const timelineObjects = GetSisyfosTimelineObjForCamera(config, sourceInfo, true)
		expect(timelineObjects.length).toBe(2)
		const studioMicsTimelineObject = timelineObjects.find(t => t.layer === SharedSisyfosLLayer.SisyfosGroupStudioMics)
		expect(studioMicsTimelineObject).toBeUndefined()
	})
	it('Enables audio layers for remotes', () => {
		const sourceInfo = {
			type: SourceInfoType.LIVE,
			sourceLayerType: SourceLayerType.REMOTE,
			id: '1',
			port: 1,
			sisyfosLayers: ['some_layer', 'some_layer2'],
			useStudioMics: false
		}
		const timelineObjects = GetSisyfosTimelineObjForRemote(config, sourceInfo)
		expect(timelineObjects.length).toBe(2)
		expect(timelineObjects[0].layer).toBe('some_layer')
		expect((timelineObjects[0] as TSR.TimelineObjSisyfosChannel).content.isPgm).toBe(1)
		expect(timelineObjects[1].layer).toBe('some_layer2')
		expect((timelineObjects[1] as TSR.TimelineObjSisyfosChannel).content.isPgm).toBe(1)
	})
	it('Enables studio mics for remotes', () => {
		const sourceInfo = {
			type: SourceInfoType.LIVE,
			sourceLayerType: SourceLayerType.REMOTE,
			id: '1',
			port: 1,
			sisyfosLayers: ['some_layer', 'some_layer2'],
			useStudioMics: true
		}
		const timelineObjects = GetSisyfosTimelineObjForRemote(config, sourceInfo)
		expect(timelineObjects.length).toBe(3)
		const studioMicsTimelineObject = timelineObjects.find(t => t.layer === SharedSisyfosLLayer.SisyfosGroupStudioMics)
		expect(studioMicsTimelineObject).toBeDefined()
	})
	it('Enables audio layers for replay', () => {
		const sourceInfo = {
			type: SourceInfoType.REPLAY,
			sourceLayerType: SourceLayerType.LOCAL,
			id: '1',
			port: 1,
			sisyfosLayers: ['some_layer', 'some_layer2'],
			useStudioMics: false
		}
		const timelineObjects = GetSisyfosTimelineObjForReplay(config, sourceInfo, false)
		expect(timelineObjects.length).toBe(2)
		expect(timelineObjects[0].layer).toBe('some_layer')
		expect((timelineObjects[0] as TSR.TimelineObjSisyfosChannel).content.isPgm).toBe(1)
		expect(timelineObjects[1].layer).toBe('some_layer2')
		expect((timelineObjects[1] as TSR.TimelineObjSisyfosChannel).content.isPgm).toBe(1)
	})
	it('Enables audio layers for replay (vo)', () => {
		const sourceInfo = {
			type: SourceInfoType.REPLAY,
			sourceLayerType: SourceLayerType.LOCAL,
			id: '1',
			port: 1,
			sisyfosLayers: ['some_layer', 'some_layer2'],
			useStudioMics: false
		}
		const timelineObjects = GetSisyfosTimelineObjForReplay(config, sourceInfo, true)
		const layersTimelineObjects = timelineObjects.filter(t => t.layer !== SharedSisyfosLLayer.SisyfosGroupStudioMics)
		expect(layersTimelineObjects.length).toBe(2)
		expect(layersTimelineObjects[0].layer).toBe('some_layer')
		expect((layersTimelineObjects[0] as TSR.TimelineObjSisyfosChannel).content.isPgm).toBe(2)
		expect(layersTimelineObjects[1].layer).toBe('some_layer2')
		expect((layersTimelineObjects[1] as TSR.TimelineObjSisyfosChannel).content.isPgm).toBe(2)
	})
	it('Enables studio mics for replay (vo)', () => {
		const sourceInfo = {
			type: SourceInfoType.REPLAY,
			sourceLayerType: SourceLayerType.LOCAL,
			id: '1',
			port: 1,
			sisyfosLayers: ['some_layer', 'some_layer2'],
			useStudioMics: true
		}
		const timelineObjects = GetSisyfosTimelineObjForReplay(config, sourceInfo, true)
		expect(timelineObjects.length).toBe(3)
		const studioMicsTimelineObject = timelineObjects.find(t => t.layer === SharedSisyfosLLayer.SisyfosGroupStudioMics)
		expect(studioMicsTimelineObject).toBeDefined()
	})
})
