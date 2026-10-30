# @tscircuit/graphics-debug-3d

Serializable 3D debug scenes with PoppyGL PNG snapshots and a Three.js React
viewer using OrbitControls. Snapshots run without WebGL or a browser; interactive
navigation uses the GPU. Both consume the same geometry and camera fixture.

![A lifted cover, fastener and movement guide](./tests/__snapshots__/assembly.snap.png)

```ts
import {
  renderGraphics3dToPng,
  type GraphicsObject3d,
} from "@tscircuit/graphics-debug-3d"

const graphics: GraphicsObject3d = {
  cameraPosition: [40, -60, 45],
  cameraTarget: [0, 0, 5],
  meshes: [
    {
      positions: [0, 0, 0, 10, 0, 0, 0, 10, 0],
      indices: [0, 1, 2],
      color: "#3283b5",
    },
  ],
  lines: [
    {
      points: [
        [0, 0, 0],
        [0, 0, 10],
      ],
      dashed: true,
      arrow: true,
    },
  ],
  labels: [{ text: "Lift", position: [0, 0, 10] }],
}
const png = await renderGraphics3dToPng(graphics, { width: 800, height: 600 })
```

```tsx
import { InteractiveGraphics3d } from "@tscircuit/graphics-debug-3d/react"

;<InteractiveGraphics3d graphics={graphics} />
```

Coordinates are right-handed, +Z up. Meshes use packed XYZ arrays and triangle
indices. `position` translates a mesh; all input arrays remain unchanged. Colors
are six-digit hex; mesh `opacity` defaults to one. Movement polylines are
depth-tested guides, with optional dashes and arrows. Labels are screen
annotations anchored to world positions. `bounds` can include the complete motion
envelope so fitted views stay comparable between stages.

Return `cameraPosition` and `cameraTarget` from your solver's visualization method
to author a repeatable view. Both renderers use a 45-degree vertical field of view
and +Z up; match image aspect ratios for matching framing. Without a fixture, the
camera fits the scene bounds. Snapshot `options.camera` overrides these fields.

The interactive viewer supports orbit, right-drag/Shift-drag pan, wheel zoom,
six axis views, **Fit**, and **Reset camera**. **Copy camera** exports JSON fields
that can be pasted into a visualization result and used by PoppyGL snapshots.
Solver steps and resizes preserve manual navigation; changing the authored camera
values applies the new fixture. Reset returns to the authored camera (or automatic
framing); Fit recenters the bounds while preserving the current viewing direction.
Browser lighting and text rendering differ from the deterministic PoppyGL images.

This initial API covers meshes, lines, labels and framing. Picking, editable
geometry and scene hierarchies are outside this first version.

```sh
bun install
bun test
bun run typecheck
bun run start
bun run build:site
```

Created through [tscircuit/create-repo #104](https://github.com/tscircuit/create-repo/pull/104)
using the [handbook's source-package conventions](https://github.com/tscircuit/handbook/blob/main/guides/bootstrapping-repos.md).
