# Qbox Wall graphics through Viz MSE

Qbox keeps its normal graphics on HTML/CasparCG. Graphics targeted at `WALL` are sent through Viz MSE on channel `WALL1`.

The Qbox studio mapping `graphic_wall` expects a playout-gateway Viz MSE device with the ID `viz0`. The device is deployment-specific and must be configured outside this blueprint package with:

- network access to the Viz Media Sequencer;
- the MSE profile used for Qbox Wall graphics;
- a `WALL1` channel routed to the intended Viz Engine/output.

Do not change the Qbox `GraphicsType` from `HTML` solely to enable the Wall. The blueprint selects Viz MSE specifically for `WALL` targets while preserving HTML/CasparCG for other graphics.

## Off-air Wall loop

The Qbox studio blueprint can take an internal Viz template on `WALL1` whenever no rundown is active. In the studio's Blueprint Configuration, open **Idle Wall Loop** (`IdleWallLoop`) and configure its single row:

| Field         | Default | Purpose                               |
| ------------- | ------- | ------------------------------------- |
| Enabled       | `false` | Enable the off-air Wall loop          |
| Show name     | Empty   | MSE show containing the loop template |
| Template name | Empty   | Internal Viz template to take         |

An empty table also disables the loop. Do not add multiple rows: the blueprint logs a warning and omits the Wall object rather than choosing a loop arbitrarily.

Both names are required when enabled. The show must be accessible through the existing device's MSE profile and show-directory configuration. The template must loop without parameters; the blueprint sends an empty template-data array. Pilot/VCP elements are not supported for this setting.

The loop uses the existing `graphic_wall` mapping, including a customized Viz MSE device ID. No resolver update or new mapping is required. If enabled settings are incomplete, or the mapping does not target Viz MSE, the blueprint logs a warning and omits the Wall object while preserving the normal ATEM/audio baseline. If disabled or absent, this setting does not change the baseline.

**Keep `dontDeactivateOnStandDown: true` configured on the Wall's playout-gateway Viz MSE device.** Baseline objects do not prevent the separate MSE deactivation command from unloading graphics.

### Operator behavior

- **Deactivate the rundown** to switch from the production Wall graphic to the configured off-air loop. Reaching the last part is not sufficient.
- The loop is also the default on startup while no rundown is active. Changing its settings while inactive can change the visible Wall output.
- Activating a rundown removes the idle baseline. There is no active-rundown fallback, so the off-air loop may be taken out before the first Wall cue.
- This replaces the last production graphic; it does not preserve it. It also does not arbitrate control with other automation systems.

Before operational use, confirm on the actual gateway/MSE that deactivation takes the configured loop, does not deactivate MSE, and leaves the engine usable by the other automation system. Check the command log for any intermediate TAKE OUT during the handoff, and confirm that unchanged idle timeline updates do not repeatedly take the loop.
