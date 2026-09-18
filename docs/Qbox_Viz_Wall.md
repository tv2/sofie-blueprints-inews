# Qbox Wall graphics through Viz MSE

Qbox keeps its normal graphics on HTML/CasparCG. Graphics targeted at `WALL` are sent through Viz MSE on channel `WALL1`.

The Qbox studio mapping `graphic_wall` expects a playout-gateway Viz MSE device with the ID `viz0`. The device is deployment-specific and must be configured outside this blueprint package with:

- network access to the Viz Media Sequencer;
- the MSE profile used for Qbox Wall graphics;
- a `WALL1` channel routed to the intended Viz Engine/output.

Do not change the Qbox `GraphicsType` from `HTML` solely to enable the Wall. The blueprint selects Viz MSE specifically for `WALL` targets while preserving HTML/CasparCG for other graphics.
