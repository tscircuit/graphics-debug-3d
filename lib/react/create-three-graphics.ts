import {
  BufferGeometry,
  ConeGeometry,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  Vector3,
} from "three"
import type { GraphicsObject3d } from "../types"
import { getGraphicsBounds3d } from "../get-graphics-bounds-3d"

/** The browser adapter preserves the same world-space geometry as PoppyGL. */
export function createThreeGraphics(graphics: GraphicsObject3d): Group {
  const group = new Group()
  const bounds = getGraphicsBounds3d(graphics)
  const scale = Math.max(
    1,
    new Vector3(...bounds.max).distanceTo(new Vector3(...bounds.min)),
  )
  for (const source of graphics.meshes ?? []) {
    const geometry = new BufferGeometry()
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(source.positions, 3),
    )
    geometry.setIndex(source.indices)
    geometry.computeVertexNormals()
    const opacity = source.opacity ?? 1
    const mesh = new Mesh(
      geometry,
      new MeshLambertMaterial({
        color: source.color ?? "#3283b5",
        opacity,
        transparent: opacity < 1,
        depthWrite: opacity === 1,
        side: DoubleSide,
        flatShading: true,
      }),
    )
    mesh.name = source.id ?? ""
    mesh.position.fromArray(source.position ?? [0, 0, 0])
    mesh.add(
      new LineSegments(
        new EdgesGeometry(geometry, 20),
        new LineBasicMaterial({
          color: "#334155",
          transparent: true,
          opacity: opacity * 0.5,
        }),
      ),
    )
    group.add(mesh)
  }
  for (const source of graphics.lines ?? []) {
    const points = source.points.map((point) => new Vector3(...point))
    const color = source.color ?? "#64748b"
    const material = source.dashed
      ? new LineDashedMaterial({
          color,
          dashSize: scale * 0.02,
          gapSize: scale * 0.012,
        })
      : new LineBasicMaterial({ color })
    const line = new Line(new BufferGeometry().setFromPoints(points), material)
    line.computeLineDistances()
    group.add(line)
    if (source.arrow) {
      const end = points.at(-1)!
      const previous = points.findLast(
        (point) => point.distanceToSquared(end) > 0,
      )
      if (!previous) continue
      const direction = end.clone().sub(previous).normalize()
      const length = Math.min(scale * 0.035, previous.distanceTo(end) * 0.25)
      const head = new Mesh(
        new ConeGeometry(length * 0.3, length, 12),
        new MeshBasicMaterial({ color }),
      )
      head.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction)
      head.position.copy(end).addScaledVector(direction, -length / 2)
      group.add(head)
    }
  }
  return group
}

export function disposeThreeGraphics(group: Object3D) {
  group.traverse((object) => {
    if (object instanceof Mesh || object instanceof Line) {
      object.geometry.dispose()
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material])
        material.dispose()
    }
  })
  group.removeFromParent()
}
