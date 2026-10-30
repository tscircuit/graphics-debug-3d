import type { GraphicsObject3d } from "./types"

function validatePoint(point: number[]) {
  if (point.length !== 3 || point.some((n) => !Number.isFinite(n)))
    throw new Error("3D points must contain three finite coordinates")
}

export function validateGraphics3d(graphics: GraphicsObject3d) {
  for (const mesh of graphics.meshes ?? []) {
    if (
      mesh.positions.length % 3 ||
      mesh.positions.some((n) => !Number.isFinite(n))
    )
      throw new Error("Mesh positions must contain finite XYZ triples")
    if (
      mesh.indices.length % 3 ||
      mesh.indices.some(
        (i) => !Number.isInteger(i) || i < 0 || i >= mesh.positions.length / 3,
      )
    )
      throw new Error("Mesh indices must reference complete triangles")
    if (mesh.position) validatePoint(mesh.position)
    if (
      mesh.opacity !== undefined &&
      (!Number.isFinite(mesh.opacity) || mesh.opacity < 0 || mesh.opacity > 1)
    )
      throw new Error("Mesh opacity must be between zero and one")
    if (mesh.color && !/^#[0-9a-f]{6}$/i.test(mesh.color))
      throw new Error("Colors must use six-digit hex notation")
  }
  for (const line of graphics.lines ?? []) {
    if (line.points.length < 2)
      throw new Error("3D lines need at least two points")
    for (const point of line.points) validatePoint(point)
    if (line.color && !/^#[0-9a-f]{6}$/i.test(line.color))
      throw new Error("Colors must use six-digit hex notation")
  }
  for (const label of graphics.labels ?? []) validatePoint(label.position)
  if (graphics.bounds) {
    validatePoint(graphics.bounds.min)
    validatePoint(graphics.bounds.max)
    if (graphics.bounds.min.some((n, axis) => n > graphics.bounds!.max[axis]))
      throw new Error("Graphics bounds must have min <= max")
  }
}
