# DVE

To use DVEs, first add the studio settings `ATEM Split Screen Art Fill` and `ATEM Split Screen Art Key`.

Then, go to your showstyle settings and add the setting `DVE Styles`. Here you can define all the DVEs for your show.

The DVE Name must be the name as it is written in iNews e.g. `sommerfugl`. The Background Loop is the file name of the background loop.

You can then design each of your DVEs on an ATEM. The finished DVE config can be obtained using [this tool\*](https://github.com/thomasslee97/atem-supersource-grabber/blob/master/index.ts), the text to copy will be placed in a file called `state.json`.

\* Note: This link will change

## M2L-X layouts and explicit ATEM conversion

M2L-X uses the same DVE Styles table and logical INP assignments, but requires
native layout JSON. Selecting M2L-X does not automatically convert an ATEM layout.
Native translations are whole-pixel top-left coordinates; fractional positions
fail with a configuration error. Scales and source-relative crop rectangles remain
fractional. These restrictions do not change ATEM or TriCaster geometry handling.

For a 1920x1080 studio, the explicit geometry conversion preserves sizes, crop
margins, foreground order and off-screen positioning,
rounding the converted origins to whole pixels without adding gaps or recentering.
ATEM crop margins use 32000 horizontal and 18000 vertical units; native crops are
normalized retained rectangles.

For the five converted sports layouts, keep these existing `DVEInputs`
assignments:

| Layout      | DVEInputs                     |
| ----------- | ----------------------------- |
| sommerfugl  | `1:INP1;2:INP2`               |
| morbarn     | `3:INP1;2:INP2`               |
| barnmor     | `2:INP2;1:INP1`               |
| barnMorIpad | `1:INP1;2:INP2`               |
| 3barnMor    | `1:INP1;2:INP2;3:INP3;4:INP4` |

Sommerfugl converts to 50% boxes at (0,234) and (960,234), with no added gap.
The iPad and four-box layouts retain their asymmetric crops. Physical PiP indices
are remapped for native stacking, not for producer input numbering.

The exported numeric source IDs and artwork metadata are not translated into Sony
input names. Every enabled box needs an explicit
logical input assignment. The `3split` and `2barnMor` exports are deliberately
excluded: each contains a fourth enabled box with an unverified fixed source.
Do not silently remove that box or assume its source is black.

The converter does not reproduce ATEM fill/key processing or borders. Until a
verified CasparCG feed and DSK allocation exist, use plain video layouts with
empty frame, key and locator-template references. Preserve the originals before
editing settings. Apply changes and regenerate rundowns only while inactive;
operators retain control of activation, selected Next and Takes.
