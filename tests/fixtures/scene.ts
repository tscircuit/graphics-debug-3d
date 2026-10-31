import type { GraphicsMesh3d, GraphicsObject3d, Point3d } from "../../lib"

export function boxMesh({
  id,
  size,
  position,
  color,
}: {
  id: string
  size: Point3d
  position: Point3d
  color: string
}): GraphicsMesh3d {
  const [x, y, z] = size.map((n) => n / 2)
  return {
    id,
    color,
    position,
    positions: [
      -x,
      -y,
      -z,
      x,
      -y,
      -z,
      x,
      y,
      -z,
      -x,
      y,
      -z,
      -x,
      -y,
      z,
      x,
      -y,
      z,
      x,
      y,
      z,
      -x,
      y,
      z,
    ],
    indices: [
      0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2,
      3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7,
    ],
  }
}

export const assemblyScene: GraphicsObject3d = {
  title: "Lift cover and fastener together",
  meshes: [
    boxMesh({
      id: "board",
      size: [24, 18, 1.5],
      position: [0, 0, 0],
      color: "#287959",
    }),
    boxMesh({
      id: "cover",
      size: [22, 16, 2],
      position: [0, 0, 12],
      color: "#368bb5",
    }),
    boxMesh({
      id: "bolt",
      size: [2, 2, 6],
      position: [7, 0, 13],
      color: "#8895a5",
    }),
  ],
  lines: [
    {
      points: [
        [-10, -7, 1],
        [-10, -7, 11],
      ],
      color: "#53657a",
      dashed: true,
      arrow: true,
    },
  ],
  labels: [
    { text: "PCB", position: [-12, 0, 0] },
    { text: "COVER", position: [-11, 0, 13] },
    { text: "BOLT", position: [7, 0, 16] },
  ],
}
