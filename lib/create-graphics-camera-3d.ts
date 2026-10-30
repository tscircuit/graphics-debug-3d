import type { GraphicsBounds3d, GraphicsCamera3d, Point3d } from "./types"

/** Fit the bounding sphere with margin in both portrait and landscape views. */
export function createGraphicsCamera3d(
  bounds: GraphicsBounds3d,
  aspectRatio = 4 / 3,
): GraphicsCamera3d {
  const target = bounds.min.map(
    (n, axis) => (n + bounds.max[axis]) / 2,
  ) as Point3d
  const radius = Math.max(
    0.5,
    Math.hypot(...bounds.min.map((n, axis) => bounds.max[axis] - n)) / 2,
  )
  const halfFov = Math.atan(Math.tan(Math.PI / 8) * Math.min(1, aspectRatio))
  const distance = (radius / Math.sin(halfFov)) * 1.15
  const direction = [1, -1.6, 1.1]
  const length = Math.hypot(...direction)
  return {
    target,
    position: target.map(
      (n, axis) => n + (distance * direction[axis]) / length,
    ) as Point3d,
  }
}
