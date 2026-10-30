import type { GraphicsBounds3d, GraphicsObject3d, Point3d } from "./types"

export function getGraphicsBounds3d(
  graphics: GraphicsObject3d,
): GraphicsBounds3d {
  const points: Point3d[] = []
  for (const mesh of graphics.meshes ?? []) {
    const offset = mesh.position ?? [0, 0, 0]
    for (let i = 0; i < mesh.positions.length; i += 3)
      points.push([
        mesh.positions[i] + offset[0],
        mesh.positions[i + 1] + offset[1],
        mesh.positions[i + 2] + offset[2],
      ])
  }
  for (const line of graphics.lines ?? []) points.push(...line.points)
  for (const label of graphics.labels ?? []) points.push(label.position)
  if (graphics.bounds) points.push(graphics.bounds.min, graphics.bounds.max)
  if (!points.length) return { min: [-1, -1, -1], max: [1, 1, 1] }
  const min: Point3d = [Infinity, Infinity, Infinity]
  const max: Point3d = [-Infinity, -Infinity, -Infinity]
  for (const point of points) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], point[axis])
      max[axis] = Math.max(max[axis], point[axis])
    }
  }
  return { min, max }
}
