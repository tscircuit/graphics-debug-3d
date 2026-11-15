import { expect, test } from "bun:test"
import { Box3, Line, Mesh } from "three"
import {
  createThreeGraphics,
  disposeThreeGraphics,
} from "../lib/react/create-three-graphics"
import { assemblyScene } from "./fixtures/scene"

test("the interactive adapter preserves translated world geometry and disposes GPU resources", () => {
  const source = JSON.stringify(assemblyScene)
  const group = createThreeGraphics(assemblyScene)
  const bolt = group.getObjectByName("bolt")!
  const bounds = new Box3().setFromObject(bolt)
  expect(bounds.min.toArray()).toEqual([6, -1, 10])
  expect(bounds.max.toArray()).toEqual([8, 1, 16])
  let resources = 0
  let disposed = 0
  group.traverse((object) => {
    if (object instanceof Mesh || object instanceof Line) {
      resources++
      object.geometry.addEventListener("dispose", () => disposed++)
    }
  })
  disposeThreeGraphics(group)
  expect(disposed).toBe(resources)
  expect(JSON.stringify(assemblyScene)).toBe(source)

  const filtered = createThreeGraphics({
    meshes: [
      { id: "empty", positions: [], indices: [] },
      {
        id: "hidden",
        positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
        indices: [0, 1, 2],
        opacity: 0,
      },
      {
        id: "visible",
        positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
        indices: [0, 1, 2],
      },
    ],
  })
  expect(filtered.getObjectByName("empty")).toBeUndefined()
  expect(filtered.getObjectByName("hidden")).toBeUndefined()
  expect(filtered.getObjectByName("visible")).toBeDefined()
  disposeThreeGraphics(filtered)
})
