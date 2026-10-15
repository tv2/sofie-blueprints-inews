# Jingles

To use jingles, add the `Jingle Timings` Blueprint Configuration to the show style. These are in the form:

`JINGLE_NAME:FRAMES_OF_ALPHA`

For example:

`2019_Sport:40,2019_NBA:50`

Means the jingle `2019_Sport` has 40 frames of alpha at the end, and `2019_NBA` has 50 frames of alpha at the end.

## QBox: underlying transitions for breakers

Create named presets in the QBox show style's **Underlying transitions** table.
In **Breaker Configuration**, select the preset in **Underlying transition name**
and enable the **Underlying transition** toggle immediately to its right.
Several breakers can reference the same preset.

Dropdown selections are resolved by row ID, with name matching for text
references and as a fallback for imported selections, following the existing
graphics-setup selection convention.

The original breaker name, clip, duration, alpha timings, autonext and
load-first-frame fields remain unchanged. Only the experimental underlying-mix
controls have moved: start frame and duration now belong to the preset.
The old underlying-mix fields are no longer read and are not migrated.
Existing breakers without the new toggle enabled retain their normal behaviour.

### Preset settings

| Setting               | Behaviour                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**              | Unique reference name. Matching ignores case and surrounding whitespace; duplicate matching names are rejected.                        |
| **Type**              | **Mix** (dissolve) or **Dot wipe** (ATEM Circle Iris, pattern 7).                                                                      |
| **Start frame**       | Optional whole-frame position relative to the breaker's first frame, frame **0**. Blank uses that breaker's `Duration - Alpha at End`. |
| **Duration (frames)** | Optional whole frames: **1 to 255** for Mix, **1 to 250** for Dot wipe. Blank uses **4 frames**.                                       |

Blank timing and explicit `0` are distinct. Start and duration can be set
independently. Frames use the existing 25 fps conversion (one frame = 40 ms).
Do not add CasparCG preroll to the configured start frame.

For example, create a preset named `Soft reveal`, type `Mix`, start frame `18`,
duration `6`, then select it on a breaker and enable the toggle. This dissolves
from frame 18 to frame 24 of the breaker. With 200 ms CasparCG preroll, the source
transition starts at 920 ms and ends at 1160 ms.

### Dot-wipe controls

All wipe-specific controls exposed by the installed ATEM transition-settings
interface are sent explicitly. The pattern is fixed to Circle Iris; no pattern
selector is needed for this transition type.

| Dot-only setting  | Range / default                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Border width**  | Whole ATEM units **0 to 10000**; default **0** (no border).                                                                                     |
| **Border source** | ATEM source ID **0 to 65535**; default **0** (black). Select a source available on the actual mixer. This is not the incoming programme source. |
| **Symmetry**      | Whole ATEM units **0 to 10000**; default **5000**.                                                                                              |
| **Softness**      | Wipe border softness, whole ATEM units **0 to 10000**; default **0** (hard edge).                                                               |
| **X position**    | Whole ATEM units **0 to 10000**; default **5000** (centre).                                                                                     |
| **Y position**    | Whole ATEM units **0 to 10000**; default **5000** (centre).                                                                                     |
| **Reverse**       | Reverse direction; default **off**.                                                                                                             |
| **Flip-flop**     | Alternate direction on successive transitions; default **off**. Enabling this intentionally depends on the mixer's transition history.          |

These numeric values are raw ATEM protocol units, not percentages or pixels.
The settings UI in the installed integration cannot conditionally hide columns
per row. Dot-only fields therefore remain visible, labelled `Dot:`, but are
ignored when Type is Mix. Defaults are explicitly supplied for omitted dot
controls to avoid inheriting an unrelated wipe's appearance. A source ID within
the numeric range is not proof that the hardware supports that source.

Sofie prepares incoming content for the selected start and keeps outgoing
content alive through the transition. Take is blocked until both the breaker and
the underlying transition have finished, including when it extends past the end
of the breaker. Existing server preroll and A/B player allocation remain
in use.

This applies to existing scripted breaker transitions and adlib
take-with-transition actions, including server/VO selection. It does not
change standalone jingles, gallery behavior, or explicit CUT/MIX/DIP
transitions. Underlying transitions are opt-in, not automatically selected from
the number of opaque frames. Their shape and timing must be matched to the
breaker; they may be visible through its transparent areas.

Missing, ambiguous or invalid enabled presets produce a user warning and do not generate the
breaker transition. A rejected take-with-transition action leaves the
previous transition in place and does not take. Start must be between
frame 0 and Duration; alpha timings must be nonnegative and their sum
must not exceed Duration.

After deployment, check real QBox playout with camera, live and server/VO
sources, including server-to-server transitions. Check program, clean feed,
preview, outgoing playback, early start frame 0, all configured dot controls,
and replacing a selected breaker with another transition. These settings do not
synchronize CasparCG and ATEM to a shared frame clock or guarantee frame-perfect
alignment.

Circle Iris pattern identification:
[ATEM connection pattern enum](https://github.com/Sofie-Automation/sofie-atem-connection/blob/master/src/enums/index.ts).
