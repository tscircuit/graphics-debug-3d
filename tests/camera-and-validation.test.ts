import { expect, test } from "bun:test"
import {
  createGraphicsCamera3d,
  getGraphicsBounds3d,
  renderGraphics3dToPng,
} from "../lib"
import { assemblyScene } from "./fixtures/scene"

test("empty and line-only scenes render and invalid topology fails before rasterization", async () => {
  expect(await renderGraphics3dToPng({})).toBeInstanceOf(Uint8Array)
  expect(
    await renderGraphics3dToPng({
      lines: [
        {
          points: [
            [0, 0, 0],
            [1, 2, 3],
          ],
          arrow: true,
        },
      ],
    }),
  ).toMatchPngSnapshot(import.meta.path, "line-only")
  const bounds = getGraphicsBounds3d(assemblyScene)
  const portrait = createGraphicsCamera3d(bounds, 0.5)
  const landscape = createGraphicsCamera3d(bounds, 2)
  expect(Math.hypot(...portrait.position)).toBeGreaterThan(
    Math.hypot(...landscape.position),
  )
  expect(() =>
    renderGraphics3dToPng({
      meshes: [{ positions: [0, 0, 0], indices: [0, 1, 2] }],
    }),
  ).toThrow("indices")
  expect(() =>
    renderGraphics3dToPng({ labels: [{ text: "bad", position: [NaN, 0, 0] }] }),
  ).toThrow("finite")
  expect(() =>
    renderGraphics3dToPng(
      {},
      { camera: { position: [0, 0, 0], target: [0, 0, 0] } },
    ),
  ).toThrow("distinct")
})
