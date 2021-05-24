import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import {
	CreateJingleContentBase,
	CueDefinitionJingle,
	GetJinglePartProperties,
	literal,
	PartDefinition,
	PieceMetaData
} from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'

export function EvaluateJingle(
	context: SegmentContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	parsedCue: CueDefinitionJingle,
	part: PartDefinition,
	adlib?: boolean,
	rank?: number,
	effekt?: boolean
) {
	if (!config.showStyle.BreakerConfig) {
		context.notifyUserWarning(`Jingles have not been configured`)
		return
	}

	let file = ''

	const jingle = config.showStyle.BreakerConfig.find(brkr =>
		brkr.BreakerName ? brkr.BreakerName.toString().toUpperCase() === parsedCue.clip.toUpperCase() : false
	)
	if (!jingle) {
		context.notifyUserWarning(`Jingle ${parsedCue.clip} is not configured`)
		return
	} else {
		file = jingle.ClipName.toString()
	}

	if (adlib) {
		const p = GetJinglePartProperties(context, config, part)

		if (JSON.stringify(p) === JSON.stringify({})) {
			context.notifyUserWarning(`Could not create adlib for ${parsedCue.clip}`)
			return
		}

		const props = p as Pick<
			IBlueprintPart,
			'autoNext' | 'expectedDuration' | 'prerollDuration' | 'autoNextOverlap' | 'disableOutTransition'
		>

		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank ?? 0,
				externalId: `${part.externalId}-JINGLE-adlib`,
				name: effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip,
				sourceLayerId: SourceLayer.PgmJingle,
				outputLayerId: SharedOutputLayers.JINGLE,
				lifespan: PieceLifespan.WithinPart,
				metaData: literal<PieceMetaData>({
					transition: {
						isJingle: !effekt,
						isEffekt: !!effekt
					}
				}),
				content: createJingleContentAFVD(
					config,
					file,
					jingle.StartAlpha,
					jingle.LoadFirstFrame,
					jingle.Duration,
					jingle.EndAlpha
				),
				toBeQueued: true,
				adlibAutoNext: props.autoNext,
				adlibAutoNextOverlap: props.autoNextOverlap,
				adlibPreroll: props.prerollDuration,
				expectedDuration: props.expectedDuration,
				adlibDisableOutTransition: false
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				externalId: `${part.externalId}-JINGLE`,
				name: effekt ? `EFFEKT ${parsedCue.clip}` : parsedCue.clip,
				enable: {
					start: 0
				},
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.JINGLE,
				sourceLayerId: SourceLayer.PgmJingle,
				metaData: literal<PieceMetaData>({
					transition: {
						isJingle: !effekt,
						isEffekt: !!effekt
					}
				}),
				content: createJingleContentAFVD(
					config,
					file,
					jingle.StartAlpha,
					jingle.LoadFirstFrame,
					jingle.Duration,
					jingle.EndAlpha
				)
			})
		)
	}
}

export function createJingleContentAFVD(
	config: BlueprintConfig,
	file: string,
	alphaAtStart: number,
	loadFirstFrame: boolean,
	duration: number,
	alphaAtEnd: number
) {
	const content = CreateJingleContentBase(config, file, alphaAtStart, loadFirstFrame, duration, alphaAtEnd, {
		Caspar: {
			PlayerJingle: CasparLLayer.CasparPlayerJingle
		},
		ATEM: {
			USKCleanEffekt: AtemLLayer.AtemCleanUSKEffect
		},
		Sisyfos: {
			PlayerJingle: SisyfosLLAyer.SisyfosSourceJingle
		}
	})

	return content
}
