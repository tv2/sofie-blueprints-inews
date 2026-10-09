# Jingles

To use jingles, add the `Jingle Timings` Blueprint Configuration to the show style. These are in the form:

`JINGLE_NAME:FRAMES_OF_ALPHA`

For example:

`2019_Sport:40,2019_NBA:50`

Means the jingle `2019_Sport` has 40 frames of alpha at the end, and `2019_NBA` has 50 frames of alpha at the end.

## QBox: underlying mix for breaker transitions

In the QBox show style's **Breaker Configuration**, each breaker can opt into
an underlying ATEM dissolve instead of the usual source cut:

| Setting                              | Behavior                                                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Underlying mix start frame**       | Optional whole-frame position, relative to the breaker's first frame (frame **0**). Blank uses `Duration - Alpha at End`, the normal source-change point. |
| **Underlying mix duration (frames)** | Optional duration of 1 to 255 whole frames. Blank uses **4 frames**.                                                                                      |
| **Underlying mix**                   | Enable the underlying dissolve. Off or absent preserves the existing behavior.                                                                            |

The two frame fields accept blank values so that automatic timing remains
distinct from an explicit start of `0`. Either field can be overridden
independently. Frames use the blueprint's existing 25 fps conversion
(one frame = 40 ms).

For example, enable the mix, enter start frame `18` and duration `6` to
dissolve from frame 18 to frame 24 of the breaker. With 200 ms CasparCG
preroll, the source mix begins 920 ms after the transition starts and ends
at 1160 ms.

Sofie prepares incoming content for the selected start and keeps outgoing
content alive through the mix. Take is blocked until both the breaker and
the mix have finished, including when the dissolve extends past the end
of the breaker. Existing server preroll and A/B player allocation remain
in use; do not add preroll to the configured start frame.

This applies to existing scripted breaker transitions and adlib
take-with-transition actions, including server/VO selection. It does not
change standalone jingles, gallery behavior, or explicit CUT/MIX/DIP
transitions. Mixing is opt-in, not automatically selected from the number
of opaque frames. A mix beginning at the default reveal point may be
visible through the fading breaker.

Invalid enabled settings produce a user warning and do not generate the
breaker transition. A rejected take-with-transition action leaves the
previous transition in place and does not take. Start must be between
frame 0 and Duration; alpha timings must be nonnegative and their sum
must not exceed Duration.

After deployment, check real QBox playout with camera, live and server/VO
sources, including server-to-server transitions. Check program, clean feed,
preview, outgoing playback through the dissolve, early start frame 0, and
replacing a selected breaker with another transition. The mix softens the
underlying source change; it does not synchronize CasparCG and ATEM to a
shared frame clock.
