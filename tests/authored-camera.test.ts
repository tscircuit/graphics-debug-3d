import { expect, test } from "bun:test"
import { renderGraphics3dToPng, resolveGraphicsCamera3d } from "../lib"
import { assemblyScene } from "./fixtures/scene"
import type { GraphicsObject3d } from "../lib"

test("serialized camera fixtures drive PoppyGL snapshots and explicit options take precedence", async () => {
  const graphics: GraphicsObject3d = {
    ...assemblyScene,
    cameraPosition: [-42, -58, 44],
    cameraTarget: [0, 0, 7],
  }
  const source = JSON.stringify(graphics)
  const replay: GraphicsObject3d = JSON.parse(source)
  const camera = resolveGraphicsCamera3d(replay)
  expect(camera).toEqual({ position: [-42, -58, 44], target: [0, 0, 7] })
  const png = await renderGraphics3dToPng(replay)
  expect(png).toEqual(await renderGraphics3dToPng(assemblyScene, { camera }))
  expect(png).toMatchPngSnapshot(import.meta.path, "camera-fixture")
  const override = {
    position: [60, -30, 30] as [number, number, number],
    target: [0, 0, 0] as [number, number, number],
  }
  expect(await renderGraphics3dToPng(replay, { camera: override })).toEqual(
    await renderGraphics3dToPng(assemblyScene, { camera: override }),
  )
  camera.position[0] = 999
  expect(JSON.stringify(replay)).toBe(source)
  expect(() => renderGraphics3dToPng({ cameraPosition: [NaN, 0, 0] })).toThrow(
    "finite",
  )
  expect(() =>
    renderGraphics3dToPng({
      cameraPosition: [1, 1, 1],
      cameraTarget: [1, 1, 1],
    }),
  ).toThrow("distinct")
})
