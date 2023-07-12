# DVE

To use DVEs, first add the studio settings `Video Switcher Split Screen Art Fill` and `ATEM Split Screen Art Key`. For TriCaster only the Fill source is configurable. The pairing with a Key source may need to be set up in the switcher if the Fill source does not have its alpha channel already embedded.

Then, go to your showstyle settings and add the setting `DVE Styles`. Here you can define all the DVEs for your show.

The DVE Name must be the name as it is written in iNews e.g. `sommerfugl`. The Background Loop is the file name of the background loop.

You can then design each of your DVEs on an ATEM. The finished DVE config can be obtained using [this tool\*](https://github.com/thomasslee97/atem-supersource-grabber/blob/master/index.ts), the text to copy will be placed in a file called `state.json`.

\* Note: This link will change
