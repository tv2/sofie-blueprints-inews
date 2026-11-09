import { GalleryShowStyleConfig } from '../helpers/config'

export const MOCK_EFFEKT_1: GalleryShowStyleConfig['BreakerConfig'][0] = {
	BreakerName: '1',
	ClipName: 'EFFEKT_1',
	Duration: 100,
	StartAlpha: 12,
	EndAlpha: 10,
	Autonext: false,
	LoadFirstFrame: false
}

export const MOCK_EFFEKT_2: GalleryShowStyleConfig['BreakerConfig'][0] = {
	BreakerName: '2',
	ClipName: 'EFFEKT_2',
	Duration: 200,
	StartAlpha: 24,
	EndAlpha: 20,
	Autonext: false,
	LoadFirstFrame: false
}

export function DefaultBreakerConfig(): GalleryShowStyleConfig['BreakerConfig'] {
	return [
		{
			BreakerName: 'WTA-OUTRO',
			ClipName: 'TENNIS_Outro',
			Duration: 351,
			StartAlpha: 25,
			EndAlpha: 0,
			Autonext: false,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'WTA-breaker02',
			ClipName: 'TENNIS_Breaker02',
			Duration: 226,
			StartAlpha: 15,
			EndAlpha: 140,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'WTA-breaker01',
			ClipName: 'TENNIS_Breaker01',
			Duration: 226,
			StartAlpha: 15,
			EndAlpha: 140,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'WTA-INTRO',
			ClipName: 'TENNIS_intro_cont',
			Duration: 455,
			StartAlpha: 0,
			EndAlpha: 18,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'NBA16_Sunday_intro_LEAD_OUT',
			ClipName: 'NBA Sunday - Intro LEAD OUT',
			Duration: 491,
			StartAlpha: 24,
			EndAlpha: 193,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'NBA18_LEAD_OUT',
			ClipName: 'NBA - Intro LEAD OUT',
			Duration: 491,
			StartAlpha: 24,
			EndAlpha: 193,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'NBA18_intro_kort',
			ClipName: 'NBA - Intro KORT',
			Duration: 347,
			StartAlpha: 0,
			EndAlpha: 196,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'outro_serie_a',
			ClipName: 'soccer_outro_la_seria_a',
			Duration: 175,
			StartAlpha: 7,
			EndAlpha: 0,
			Autonext: false,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'outro_la_liga',
			ClipName: 'soccer_outro_la_liga',
			Duration: 175,
			StartAlpha: 7,
			EndAlpha: 0,
			Autonext: false,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'intro_serie_a',
			ClipName: 'soccer_intro_short_serie_a',
			Duration: 240,
			StartAlpha: 0,
			EndAlpha: 84,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'intro_la_liga',
			ClipName: 'soccer_intro_short_la_liga',
			Duration: 360,
			StartAlpha: 0,
			EndAlpha: 84,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'intro_lang_studiet_serie_a',
			ClipName: 'soccer_intro_long_studiet_seria_a',
			Duration: 425,
			StartAlpha: 0,
			EndAlpha: 87,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'intro_lang_studiet_la_liga',
			ClipName: 'soccer_intro_long_studiet_la_liga',
			Duration: 425,
			StartAlpha: 0,
			EndAlpha: 87,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'intro_lang_la_liga',
			ClipName: 'soccer_intro_long_la_liga',
			Duration: 425,
			StartAlpha: 0,
			EndAlpha: 87,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'intro_lang_serie_a',
			ClipName: 'soccer_intro_long_seria_a',
			Duration: 425,
			StartAlpha: 0,
			EndAlpha: 87,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'Breaker02_serie_a',
			ClipName: 'soccer_breaker_2_seria_a',
			Duration: 168,
			StartAlpha: 8,
			EndAlpha: 65,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'Breaker02_la_liga',
			ClipName: 'soccer_breaker_2_la_liga',
			Duration: 168,
			StartAlpha: 8,
			EndAlpha: 65,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'Breaker_serie_a',
			ClipName: 'soccer_breaker_1_seria_a',
			Duration: 168,
			StartAlpha: 8,
			EndAlpha: 61,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'Breaker_la_liga',
			ClipName: 'soccer_breaker_1_la_liga',
			Duration: 168,
			StartAlpha: 8,
			EndAlpha: 61,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'SN_breaker_kortnyt_start',
			ClipName: '2019_sporten_kortnyt_v03',
			Duration: 125,
			StartAlpha: 5,
			EndAlpha: 75,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'SN_breaker_kortnyt_lukker',
			ClipName: '2019_sporten_kortnyt_outro_v03',
			Duration: 125,
			StartAlpha: 5,
			EndAlpha: 75,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'SN_outro_19',
			ClipName: '2019_sporten_outro_v02_uden_delay',
			Duration: 214,
			StartAlpha: 32,
			EndAlpha: 0,
			Autonext: false,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'SN_breaker_intro_lukker',
			ClipName: '2019_sporten_teaser_outro_v02',
			Duration: 125,
			StartAlpha: 5,
			EndAlpha: 70,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'SN_intro_19',
			ClipName: 'SN_intro_19',
			Duration: 240,
			StartAlpha: 22,
			EndAlpha: 6,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: '30',
			ClipName: 'NBA - Wipe Alpha IN - 75f',
			Duration: 76,
			StartAlpha: 11,
			EndAlpha: 27,
			Autonext: false,
			LoadFirstFrame: false
		},
		{
			BreakerName: '37',
			ClipName: 'soccer_wipe_1_la_liga',
			Duration: 84,
			StartAlpha: 7,
			EndAlpha: 47,
			Autonext: false,
			LoadFirstFrame: false
		},
		{
			BreakerName: '38',
			ClipName: 'soccer_wipe_1_la_seria_a',
			Duration: 84,
			StartAlpha: 7,
			EndAlpha: 47,
			Autonext: false,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'NBA16_Intro_kort',
			ClipName: 'NBA - Intro KORT',
			Duration: 347,
			StartAlpha: 0,
			EndAlpha: 196,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'ATP_Intro_Breaker',
			ClipName: 'ATP_Intro',
			Duration: 501,
			StartAlpha: 13,
			EndAlpha: 190,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'ATP_Breaker_Direkte',
			ClipName: 'ATP_Breaker_Direkte',
			Duration: 350,
			StartAlpha: 25,
			EndAlpha: 189,
			Autonext: true,
			LoadFirstFrame: false
		},
		{
			BreakerName: 'ATP_Outro',
			ClipName: 'ATP_Outro',
			Duration: 251,
			StartAlpha: 12,
			EndAlpha: 0,
			Autonext: false,
			LoadFirstFrame: false
		},
		MOCK_EFFEKT_1,
		MOCK_EFFEKT_2
	]
}
