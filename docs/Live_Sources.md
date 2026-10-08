# Live Sources (EKSTERN)

## LIVE (LIVE 1, LIVE 2, etc.)

To use remote sources, first add the `RM Mapping` studio blueprint configuration.

You will then need to add the following Sisyfos layer mappings for each remote source:

```JSON
Layer ID: sisyfos_remote_source_1 // Mono / default variant
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 1
```

```JSON
Layer ID: sisyfos_remote_source_1_spor_2 // Spor 2 variant
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 2
```

```JSON
Layer ID: sisyfos_remote_source_1_stereo // Stereo channel
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 1
```

### QBox: keeping reporter audio over clips

In the studio blueprint configuration's **Live Mapping** (`SourcesRM`), enable
**Wants To Persist Audio** for the LIVE source whose reporter should remain audible.
Its configured **Sisyfos Layers** then stay at normal programme level over:

- Adlib SERVER clips, including the commentator Server action.
- Adlib VO clips and ADLIBPIX.
- Planned VO parts.

Persistence stays within the current story/segment. A planned SERVER at full audio
level does not accept persisted audio. Disabling **Wants To Persist Audio** prevents
that LIVE source from carrying over; **Accept Persist Audio** instead controls
whether the LIVE itself accepts audio from an earlier source.

Use **Fade down persisted audio levels** to stop the carried-over reporter audio.
Ordinary overlay graphics, including adlib overlays, leave this audio running;
full-screen graphics and jingles retain their existing stop behavior.
This does not change the clip's own audio level: SERVER remains at full level and
VO remains at its configured VO level. Gallery retains its existing SERVER/VO
acceptance rules.

## Skype

For Skype sources, add the `Skype Mapping` studio blueprint configuration.

You will then need to add the following Sisyfos layer mappings for each Skype source:

```JSON
Layer ID: sisyfos_remote_source_skype_1 // Mono / default variant
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 1
```

```JSON
Layer ID: sisyfos_remote_source_skype_1_spor_2 // Spor 2 variant
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 2
```

```JSON
Layer ID: sisyfos_remote_source_skype_1_stereo // Stereo channel
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 1
```
