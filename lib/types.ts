/** Right-handed world coordinates, +Z up. All positions use the same units. */
export type Point3d = [number, number, number]
export type GraphicsMeshId = string

export interface GraphicsMesh3d {
  id?: GraphicsMeshId
  label?: string
  /** Packed XYZ vertices and triangle indices; ordinary arrays for JSON replay. */
  positions: number[]
  indices: number[]
  /** World displacement, applied without changing the supplied vertices. */
  position?: Point3d
  color?: string
  opacity?: number
}

export interface GraphicsLine3d {
  points: Point3d[]
  color?: string
  dashed?: boolean
  arrow?: boolean
}

export interface GraphicsLabel3d {
  text: string
  position: Point3d
}

export interface GraphicsBounds3d {
  min: Point3d
  max: Point3d
}

export interface GraphicsObject3d {
  title?: string
  meshes?: GraphicsMesh3d[]
  lines?: GraphicsLine3d[]
  labels?: GraphicsLabel3d[]
  /** Optional camera framing envelope, e.g. the bounds of every playback stage. */
  bounds?: GraphicsBounds3d
}

export interface GraphicsCamera3d {
  position: Point3d
  target: Point3d
}

export interface RenderGraphics3dOptions {
  width?: number
  height?: number
  camera?: GraphicsCamera3d
  backgroundColor?: string
  supersampling?: number
}
