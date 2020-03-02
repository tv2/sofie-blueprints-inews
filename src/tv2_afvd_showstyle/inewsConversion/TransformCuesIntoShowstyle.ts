import { ShowStyleConfig } from '../helpers/config'
import { PartDefinition } from './converters/ParseBody'
import { CueDefinitionGrafik, CueType } from './converters/ParseCue'

export function TransformCuesIntoShowstyle(config: ShowStyleConfig, partDefinition: PartDefinition): PartDefinition {
	let i = -1

	while (i + 1 < partDefinition.cues.length) {
		i++
		const cue = partDefinition.cues[i]

		if (
			cue.type === CueType.TargetEngine &&
			cue.data.engine &&
			cue.data.engine.toUpperCase() !== 'FULL1' &&
			cue.data.engine.toUpperCase() !== 'OVL1'
		) {
			const conf = config.GFXTemplates.find(gfx => gfx.INewsName.toUpperCase() === cue.data.engine.toUpperCase())

			if (!conf) {
				continue
			}
			if (conf.VizTemplate.toUpperCase() === 'VCP') {
				const nextCue = partDefinition.cues[i + 1]

				if (!nextCue) {
					continue
				}

				if (nextCue.type !== CueType.MOS) {
					continue
				}

				cue.data.grafik = nextCue
				cue.data.engine = conf.VizDestination.trim()
				partDefinition.cues[i] = cue
				i++
				partDefinition.cues.splice(i, 1)
			} else {
				const gfxGue: CueDefinitionGrafik = {
					type: CueType.Grafik,
					template: conf.VizTemplate.toUpperCase(),
					cue: `SS=${cue.data.engine}`,
					textFields: []
				}
				cue.data.engine = conf.VizDestination.trim()
				cue.data.grafik = gfxGue
				partDefinition.cues[i] = cue
			}
		}
	}

	return partDefinition
}
