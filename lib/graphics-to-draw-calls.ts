import { mat4 } from "gl-matrix"
import { hexToRgb, type DrawCall } from "poppygl"
import type { GraphicsObject3d } from "./types"

export function graphicsToDrawCalls(graphics: GraphicsObject3d): DrawCall[] {
  return (graphics.meshes ?? [])
    .filter((mesh) => mesh.indices.length > 0 && mesh.opacity !== 0)
    .map((mesh) => {
      const color = hexToRgb(mesh.color ?? "#4b89b9")!
      return {
        positions: new Float32Array(mesh.positions),
        indices: new Uint32Array(mesh.indices),
        normals: null,
        uvs: null,
        model: mat4.fromTranslation(mat4.create(), mesh.position ?? [0, 0, 0]),
        material: {
          baseColorFactor: [...color, mesh.opacity ?? 1],
          baseColorTexture: null,
          alphaMode:
            mesh.opacity !== undefined && mesh.opacity < 1 ? "BLEND" : "OPAQUE",
        },
      }
    })
}
