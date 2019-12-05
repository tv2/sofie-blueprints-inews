import { PartDefinition } from 'src/tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { IBlueprintPiece } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'

export function CreatePieceEffekt(pieces: IBlueprintPiece[], partDefinition: PartDefinition) {
	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: `${partDefinition.externalId}-EFFEKT-${effekt}`,
			name: `EFFEKT-${effekt}`,
			enable: { start: 0, duration: TimeFromFrames(Number(effektConfig.Duration)) },
			outputLayerId: 'jingle',
			sourceLayerId: SourceLayer.PgmJingle,
			infiniteMode: PieceLifespan.Normal,
			isTransition: true,
			content: literal<VTContent>({
				studioLabel: '',
				fileName: file,
				path: file,
				firstWords: '',
				lastWords: '',
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TimelineObjCCGMedia & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: CasparLLayer.CasparPlayerJingle,
						content: {
							deviceType: DeviceType.CASPARCG,
							type: TimelineContentTypeCasparCg.MEDIA,
							file
						}
					}),
					literal<TimelineObjAtemDSK>({
						id: '',
						enable: {
							start: Number(config.studio.CasparPrerollDuration)
						},
						priority: 1,
						layer: AtemLLayer.AtemDSKEffect,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.DSK,
							dsk: {
								onAir: true,
								sources: {
									fillSource: config.studio.AtemSource.JingleFill,
									cutSource: config.studio.AtemSource.JingleKey
								},
								properties: {
									tie: false,
									preMultiply: false,
									clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000,
									gain: config.studio.AtemSettings.CCGGain * 10, // input is percents (0-100), atem uses 1-000,
									mask: {
										enabled: false
									}
								}
							}
						}
					}),
					literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: SisyfosLLAyer.SisyfosSourceJingle,
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
							isPgm: 1
						}
					})
				])
			})
		})
	)
}
