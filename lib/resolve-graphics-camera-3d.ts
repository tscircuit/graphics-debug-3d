import { createGraphicsCamera3d } from "./create-graphics-camera-3d"
import { getGraphicsBounds3d } from "./get-graphics-bounds-3d"
import type { GraphicsCamera3d, GraphicsObject3d } from "./types"

/** Explicit render options override the authored fixture, then automatic framing. */
export function resolveGraphicsCamera3d(
  graphics: GraphicsObject3d,
  options: { camera?: GraphicsCamera3d; aspectRatio?: number } = {},
): GraphicsCamera3d {
  const fitted = createGraphicsCamera3d(
    getGraphicsBounds3d(graphics),
    options.aspectRatio,
  )
  const camera = options.camera ?? {
    position: graphics.cameraPosition ?? fitted.position,
    target: graphics.cameraTarget ?? fitted.target,
  }
  if (
    [camera.position, camera.target].some(
      (point) => point.length !== 3 || point.some((n) => !Number.isFinite(n)),
    ) ||
    Math.hypot(...camera.position.map((n, axis) => n - camera.target[axis])) ===
      0
  )
    throw new Error("Camera needs finite, distinct position and target points")
  return { position: [...camera.position], target: [...camera.target] }
}
