import { CueDefinition, CueDefinitionBase, SkipCue } from 'tv2-common'
import { CueType } from 'tv2-constants'

const cue1: CueDefinitionBase = {
	type: CueType.Grafik,
	iNewsCommand: ''
}

const cue2: CueDefinitionBase = {
	type: CueType.Grafik,
	iNewsCommand: '',
	adlib: true
}

const cue3: CueDefinitionBase = {
	type: CueType.Ekstern,
	iNewsCommand: ''
}

const cue4: CueDefinitionBase = {
	type: CueType.Ekstern,
	iNewsCommand: '',
	adlib: true
}

describe('skipCue', () => {
	it('Allows all cues with no filters passed', () => {
		expect(SkipCue(cue1 as CueDefinition)).toBe(false)
		expect(SkipCue(cue2 as CueDefinition)).toBe(false)
		expect(SkipCue(cue3 as CueDefinition)).toBe(false)
		expect(SkipCue(cue4 as CueDefinition)).toBe(false)
	})

	it('Skips cues not in the selected type', () => {
		expect(SkipCue(cue1 as CueDefinition, [CueType.Grafik])).toBe(false)
		expect(SkipCue(cue2 as CueDefinition, [CueType.Grafik])).toBe(false)
		expect(SkipCue(cue3 as CueDefinition, [CueType.Grafik])).toBe(true)
		expect(SkipCue(cue4 as CueDefinition, [CueType.Grafik])).toBe(true)
	})

	it('Skips adlib cues', () => {
		expect(SkipCue(cue1 as CueDefinition, undefined, true)).toBe(false)
		expect(SkipCue(cue2 as CueDefinition, undefined, true)).toBe(true)
		expect(SkipCue(cue3 as CueDefinition, undefined, true)).toBe(false)
		expect(SkipCue(cue4 as CueDefinition, undefined, true)).toBe(true)
	})

	it('Skips non-adlib cues', () => {
		expect(SkipCue(cue1 as CueDefinition, undefined, false, true)).toBe(true)
		expect(SkipCue(cue2 as CueDefinition, undefined, false, true)).toBe(false)
		expect(SkipCue(cue3 as CueDefinition, undefined, false, true)).toBe(true)
		expect(SkipCue(cue4 as CueDefinition, undefined, false, true)).toBe(false)
	})
})
