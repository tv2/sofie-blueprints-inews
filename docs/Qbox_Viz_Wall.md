# Qbox Wall graphics through Viz MSE

Qbox keeps its normal graphics on HTML/CasparCG. Graphics targeted at `WALL` are sent through Viz MSE on channel `WALL1`.

Two existing `SS` commands use this route:

- `SS=SC-LOOP` starts the internal Viz template `SC_LOOP_ON`. It persists across parts until another Wall graphic replaces it or the show style ends.
- `SS=SC-STILLS` targets the following Pilot/VCP element at the Wall. The Pilot element must immediately follow the `SS` cue in the same part.

The Qbox studio mapping `graphic_wall` expects a playout-gateway Viz MSE device with the ID `viz0`. The device is deployment-specific and must be configured outside this blueprint package with:

- network access to the Viz Media Sequencer;
- the MSE profile used for Qbox Wall graphics;
- a `WALL1` channel routed to the intended Viz Engine/output.

Configure `FullShowName` in the selected Qbox GFX setup for `SS=SC-LOOP`. The named Viz show must contain `SC_LOOP_ON`. Pilot elements identified by VCP ID, including `SS=SC-STILLS`, do not use this setting.

Do not change the Qbox `GraphicsType` from `HTML` solely to enable the Wall. The blueprint selects Viz MSE specifically for `WALL` targets while preserving HTML/CasparCG for other graphics.

The existing scripted Wall configuration uses:

- source layer `studio0_wall_graphics`;
- timeline layer `graphic_wall`;
- Viz destination/channel `WALL1`;
- a Pilot element such as the shared `SS/sc-stills` configuration.

After deploying the blueprint, run studio migrations so `graphic_wall` is updated from `abstract0` to `viz0`. Confirm that `viz0` is connected before taking a Wall graphic.

The `graphic_wall` mapping does not appear as an active resolved timeline object by itself. It appears when an `SS=SC-LOOP` or paired `SS=SC-STILLS` Wall piece is active or carried forward.
