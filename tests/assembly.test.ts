import { expect, test } from "bun:test"
import { renderGraphics3dToPng, getGraphicsBounds3d } from "../lib"
import { assemblyScene } from "./fixtures/scene"

test("a JSON scene renders solids, labels and movement guides in a shared Z-up world", async () => {
  const source = JSON.stringify(assemblyScene)
  const replay = JSON.parse(source)
  const png = await renderGraphics3dToPng(assemblyScene, {
    width: 800,
    height: 600,
    supersampling: 2,
  })
  expect(png).toEqual(
    await renderGraphics3dToPng(replay, {
      width: 800,
      height: 600,
      supersampling: 2,
    }),
  )
  expect(JSON.stringify(assemblyScene)).toBe(source)
  expect(getGraphicsBounds3d(assemblyScene).max[2]).toBe(16)
  expect(png).toMatchPngSnapshot(import.meta.path)
})
