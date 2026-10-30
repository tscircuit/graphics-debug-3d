import { encodePNG, hexToRgb, renderDrawCalls } from "poppygl"
import { createGraphicsCamera3d } from "./create-graphics-camera-3d"
import { getGraphicsBounds3d } from "./get-graphics-bounds-3d"
import { graphicsToDrawCalls } from "./graphics-to-draw-calls"
import { validateGraphics3d } from "./validate-graphics-3d"
import type { GraphicsObject3d, RenderGraphics3dOptions } from "./types"

/** The browser viewer and PNG snapshots share this PoppyGL rasterization path. */
export function renderGraphics3d(
  graphics: GraphicsObject3d,
  options: RenderGraphics3dOptions = {},
) {
  validateGraphics3d(graphics)
  const { width = 800, height = 600, supersampling = 1 } = options
  if (
    ![width, height, supersampling].every(
      (n) => Number.isInteger(n) && n > 0,
    ) ||
    supersampling > 4
  )
    throw new Error(
      "Image dimensions and supersampling must be positive integers (supersampling <= 4)",
    )
  const camera =
    options.camera ??
    createGraphicsCamera3d(getGraphicsBounds3d(graphics), width / height)
  if (
    [...camera.position, ...camera.target].some((n) => !Number.isFinite(n)) ||
    Math.hypot(...camera.position.map((n, axis) => n - camera.target[axis])) ===
      0
  )
    throw new Error("Camera needs finite, distinct position and target points")
  const draws = graphicsToDrawCalls(graphics)
  // A point-only/empty scene still needs finite bounds for PoppyGL's clipping planes.
  if (!draws.length)
    draws.push({
      positions: new Float32Array([
        ...getGraphicsBounds3d(graphics).min,
        ...getGraphicsBounds3d(graphics).max,
      ]),
      indices: new Uint32Array(),
      normals: null,
      uvs: null,
      model: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
      material: { baseColorFactor: [0, 0, 0, 0], baseColorTexture: null },
    })
  return renderDrawCalls(draws, {
    width,
    height,
    supersampling,
    camPos: camera.position,
    lookAt: camera.target,
    up: "z+",
    fov: 45,
    cull: false,
    gamma: false,
    ambient: 0.55,
    lightDir: [-0.4, 0.5, -1],
    backgroundColor: options.backgroundColor ?? "#f7f9fc",
    showEdges: true,
    edgeWidth: 1,
    lineWidth: 1.6,
    explosionLines: (graphics.lines ?? []).map((line) => ({
      ...line,
      color: hexToRgb(line.color ?? "#64748b")!,
      dashed: line.dashed ?? false,
    })),
    debugPoints: (graphics.labels ?? []).map((label) => ({
      label: label.text,
      position: {
        x: label.position[0],
        y: label.position[1],
        z: label.position[2],
      },
    })),
    debugFontSize: 14 * supersampling,
    debugPointColor: [70, 80, 95],
    debugLabelColor: [30, 41, 59],
  })
}

export function renderGraphics3dToPng(
  graphics: GraphicsObject3d,
  options: RenderGraphics3dOptions = {},
): Promise<Uint8Array> {
  return encodePNG(renderGraphics3d(graphics, options).bitmap)
}
