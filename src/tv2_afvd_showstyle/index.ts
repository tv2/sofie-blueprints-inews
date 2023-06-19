import { BlueprintManifestType, ShowStyleBlueprintManifest } from 'blueprints-integration'
import { getEndStateForPart, getShowStyleVariantId } from 'tv2-common'
import { showStyleConfigManifest } from './config-manifests'
import { showStyleMigrations } from './migrations'

import { GetShowStyleManifestWithMixins, ShowStyleManifestMixinINews } from 'inews-mixins'
import { onTimelineGenerateAFVD } from '../tv2_afvd_studio/onTimelineGenerate'
import { executeActionAFVD } from './actions'
import { getRundown } from './getRundown'
import { getSegment } from './getSegment'
import { preprocessConfig } from './helpers/config'
import { syncIngestUpdateToPartInstance } from './syncIngestUpdateToPartInstance'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack

const manifest: ShowStyleBlueprintManifest = GetShowStyleManifestWithMixins(
	{
		blueprintType: BlueprintManifestType.SHOWSTYLE,

		blueprintVersion: VERSION,
		integrationVersion: VERSION_INTEGRATION,
		TSRVersion: VERSION_TSR,
		// @ts-ignore
		preprocessConfig,

		getShowStyleVariantId,
		getRundown,
		getSegment,

		onTimelineGenerate: onTimelineGenerateAFVD,
		getEndStateForPart,
		executeAction: executeActionAFVD,
		syncIngestUpdateToPartInstance,
		// @ts-ignore
		// setNext: (context, data) => {
		// 	context.insertPieceInstance(literal<IBlueprintPiece>({
		// 		enable: {
		// 			start: 0,
		// 			duration: 4000
		// 		},
		// 		externalId: 'Hiiii',
		// 		lifespan: PieceLifespan.WithinPart,
		// 		name: 'Hiii',
		// 		outputLayerId: SharedOutputLayer.JINGLE,
		// 		sourceLayerId: SharedSourceLayer.PgmJingle,
		// 		pieceType: IBlueprintPieceType.InTransition,
		// 		content: {
		// 			timelineObjects: []
		// 		}
		// 	}))
		// 	context.updatePartInstance(literal<Partial<IBlueprintMutatablePart>>({
		// 		inTransition: {
		// 			blockTakeDuration: 3000,
		// 			partContentDelayDuration: 2000,
		// 			previousPartKeepaliveDuration: 2000,
		// 		}
		// 	}))
		// 	context.logWarning('dddddddd')
		// 	context.logWarning(JSON.stringify(data.pieceInstances))
		// },

		showStyleConfigManifest,
		showStyleMigrations
	},
	[
		ShowStyleManifestMixinINews.INewsPlaylist,
		ShowStyleManifestMixinINews.BackTime,
		ShowStyleManifestMixinINews.BreakBackTime
	]
)

export default manifest
