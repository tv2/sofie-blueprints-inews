import {
	CueDefinition,
	CueDefinitionGrafik,
	CueDefinitionTargetEngine,
	PartDefinition,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { CueType } from 'tv2-constants'

export function TransformCuesIntoShowstyle<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(config: ShowStyleConfig, partDefinition: PartDefinition): PartDefinition {
	let i = -1

	while (i + 1 < partDefinition.cues.length) {
		i++
		const cue = partDefinition.cues[i]

		let p: PartDefinition | undefined
		if (cue.type === CueType.TargetEngine && cue.data.engine) {
			p = checkAndMerge(config, partDefinition, cue.iNewsCommand, cue.data.engine, cue, i)
		} else if (cue.type === CueType.Grafik) {
			p = checkAndMerge(config, partDefinition, cue.iNewsCommand, cue.template, cue, i)
		} else if (cue.type === CueType.VIZ) {
			p = checkAndMerge(config, partDefinition, cue.iNewsCommand, cue.design, cue, i)
		}

		if (p) {
			partDefinition = p
		}
	}

	return partDefinition
}

function checkAndMerge<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(config: ShowStyleConfig, partDefinition: PartDefinition, code: string, name: string, cue: CueDefinition, i: number) {
	const conf = config.showStyle.GFXTemplates.find(
		gfx => gfx.INewsName.toUpperCase() === name.toUpperCase() && gfx.INewsCode.toUpperCase() === code.toUpperCase()
	)

	if (!conf) {
		return
	}

	let retCue: CueDefinitionTargetEngine = {
		type: CueType.TargetEngine,
		rawType: '',
		data: {
			engine: ''
		},
		content: {},
		iNewsCommand: cue.iNewsCommand
	}

	if (conf.VizTemplate.toUpperCase() === 'VCP') {
		const nextCue = partDefinition.cues[i + 1]

		if (!nextCue) {
			if (cue.type !== CueType.TargetEngine || !cue.grafik) {
				return
			}
			retCue = cue
			retCue.data.grafik = cue.grafik
			delete cue.grafik
			retCue.data.engine = conf.VizDestination.trim()
			partDefinition.cues[i] = retCue
		} else {
			if (nextCue.type !== CueType.MOS) {
				return
			}

			if (cue.type === CueType.TargetEngine) {
				if (cue.data.grafik) {
					return
				}

				retCue = cue
			} else if (cue.type === CueType.VIZ) {
				retCue.rawType = cue.rawType
			} else {
				retCue.rawType = `${code} ${name}`
			}

			retCue.data.grafik = nextCue
			retCue.data.engine = conf.VizDestination.trim()
			partDefinition.cues[i] = retCue
			i++
			partDefinition.cues.splice(i, 1)
		}
	} else {
		if (cue.type === CueType.TargetEngine) {
			retCue = cue
			const gfxGue: CueDefinitionGrafik = {
				type: CueType.Grafik,
				template: conf.VizTemplate.toUpperCase(),
				cue: `${cue.iNewsCommand}=${retCue.data.engine}`,
				textFields: [],
				iNewsCommand: cue.iNewsCommand
			}
			retCue.data.engine = conf.VizDestination.trim()
			retCue.data.grafik = gfxGue
			partDefinition.cues[i] = retCue
		}
	}

	return partDefinition
}
