# Grafik Setup

Viz templates can be added in the blueprint settings of the Showstyle by adding the `GFX Templates` setting. Note: If a grafik is entered in to an iNews script (e.g. `kg bund ...`) but is not in the `GFX Templates` table, Sofie will attempt to play the `bund` template on server 1 with the default duration.

## Table Columns

- iNews Command: e.g. `kg`, the cue command type from iNews
- iNews Name: The name of the template as represented in iNews, e.g. `bund`
- Viz Tempalate Name: The template name in Viz, e.g. `bund`
- Viz Destination: The destination server for the template, e.g. `server 1`
- Out Type: When the template should be taken out. If nothing is set, it will be taken out after the default duration (set by the `Default Template Duration` blueprint setting).
- Variable 1: The name of the first variable needed to be passed to the template, e.g. `triopage=`
- Variable 2: The name of the second variable needed to be passed to the template.
- Is Design: Whether the cue changes the design of the viz engine.

## Style-column selection and background loops

The `iNews Style Column` field in `GFX Design Templates` maps an iNews style value to a design template. Selecting a style overrides manual design cues in that story, but does not automatically load a background from the `Skema` table.

For QBox, a story containing only `ADLIBPIX` cues and no script stays shelf-only even when a style is selected, including when ingest appends `DESIGN_LAYOUT=` and `DESIGN_BG=` cues. These style-derived cues do not create an extra on-air part. If the story also contains a non-adlib-only part, the style-derived cues are applied there instead. Explicit graphics cues such as `KG=` and `VIZ=` retain their normal behavior.

For the QBox workflow, keep background loops in the story cues alongside style-column selection:

```text
VIZ=dve-triopage
GRAFIK=BG_LOADER_NEWS
;0.00.02

VIZ=full-triopage
GRAFIK=BG_LOADER_NEWS
;0.00.03
```

Both loops retain their cue timing when a style is selected. An explicit `DESIGN_BG=DESIGN_NEWS` cue instead looks up `DESIGN_NEWS` in the `Skema` table's `Design` column and uses `CasparCG DVE Bg Scene` for a DVE background. Enter the bare media name in that field, without the `dve/` prefix.

Layout-derived cues override manual cues only of the same kind across the parts of the story: a design replaces designs, a DVE background replaces DVE backgrounds, and a full background replaces full backgrounds. Currently, `DESIGN_BG=` creates only a DVE background, so it leaves manual full-background cues intact.
