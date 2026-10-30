import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js"
import { createGraphicsCamera3d } from "../create-graphics-camera-3d"
import { getGraphicsBounds3d } from "../get-graphics-bounds-3d"
import { resolveGraphicsCamera3d } from "../resolve-graphics-camera-3d"
import { validateGraphics3d } from "../validate-graphics-3d"
import type { GraphicsCamera3d, GraphicsObject3d, Point3d } from "../types"
import {
  createThreeGraphics,
  disposeThreeGraphics,
} from "./create-three-graphics"

/** Replacing solver geometry never remounts navigation. */
export class Graphics3dView {
  private readonly renderer: WebGLRenderer
  private readonly labels = new CSS2DRenderer()
  private readonly scene = new Scene()
  private readonly camera = new PerspectiveCamera(45, 1, 0.01, 10000)
  private readonly controls: OrbitControls
  private geometry = new Group()
  private annotations = new Group()
  private graphics: GraphicsObject3d = {}
  private readonly boundsCenter = new Vector3()
  private boundsRadius = 1
  private authoredCameraKey?: string
  private readonly observer: ResizeObserver

  constructor(private readonly container: HTMLDivElement) {
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.domElement.setAttribute(
      "aria-label",
      "Interactive 3D graphics",
    )
    this.renderer.domElement.tabIndex = 0
    this.renderer.domElement.style.display = "block"
    this.camera.up.set(0, 0, 1)
    this.camera.position.set(1, -1, 1)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.listenToKeyEvents(this.renderer.domElement)
    this.controls.addEventListener("change", this.render)
    this.scene.background = new Color("#f7f9fc")
    this.scene.add(new AmbientLight(0xffffff, 2))
    const light = new DirectionalLight(0xffffff, 2.5)
    light.position.set(-0.4, -0.5, 1)
    this.scene.add(light)
    Object.assign(this.labels.domElement.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
    })
    container.append(this.renderer.domElement, this.labels.domElement)
    this.resize()
    this.observer = new ResizeObserver(() => this.resize())
    this.observer.observe(container)
  }

  update(graphics: GraphicsObject3d) {
    validateGraphics3d(graphics)
    const authoredCamera = resolveGraphicsCamera3d(graphics, {
      aspectRatio: this.camera.aspect,
    })
    const geometry = createThreeGraphics(graphics)
    disposeThreeGraphics(this.geometry)
    this.annotations.clear()
    this.annotations.removeFromParent()
    this.geometry = geometry
    this.annotations = new Group()
    for (const label of graphics.labels ?? []) {
      const element = document.createElement("span")
      element.textContent = label.text
      Object.assign(element.style, {
        font: "12px system-ui",
        color: "#334155",
        background: "#f7f9fccc",
        padding: "2px 4px",
        borderRadius: "3px",
        marginTop: "-16px",
      })
      const object = new CSS2DObject(element)
      object.position.fromArray(label.position)
      this.annotations.add(object)
    }
    this.scene.add(this.geometry, this.annotations)
    this.graphics = graphics
    const bounds = getGraphicsBounds3d(graphics)
    this.boundsCenter
      .fromArray(bounds.min)
      .add(new Vector3(...bounds.max))
      .multiplyScalar(0.5)
    this.boundsRadius = Math.max(
      0.5,
      new Vector3(...bounds.min).distanceTo(new Vector3(...bounds.max)) / 2,
    )
    this.renderer.domElement.setAttribute(
      "aria-label",
      graphics.title ?? "Interactive 3D graphics",
    )
    // Compare authored values, not scene identity or automatic bounds. Solver steps
    // can change every vertex while the user's inspection angle stays untouched.
    const key = JSON.stringify([graphics.cameraPosition, graphics.cameraTarget])
    if (key !== this.authoredCameraKey) {
      this.authoredCameraKey = key
      this.setCamera(authoredCamera)
    }
    this.render()
  }

  getCamera(): GraphicsCamera3d {
    return {
      position: this.camera.position.toArray(),
      target: this.controls.target.toArray(),
    }
  }

  reset() {
    this.setCamera(
      resolveGraphicsCamera3d(this.graphics, {
        aspectRatio: this.camera.aspect,
      }),
    )
  }

  fit() {
    const fitted = createGraphicsCamera3d(
      getGraphicsBounds3d(this.graphics),
      this.camera.aspect,
    )
    const distance = new Vector3(...fitted.position).distanceTo(
      new Vector3(...fitted.target),
    )
    const direction = this.camera.position
      .clone()
      .sub(this.controls.target)
      .normalize()
    this.setCamera({
      target: fitted.target,
      position: direction
        .multiplyScalar(distance)
        .add(new Vector3(...fitted.target))
        .toArray(),
    })
  }

  axis(direction: Point3d) {
    const fitted = createGraphicsCamera3d(
      getGraphicsBounds3d(this.graphics),
      this.camera.aspect,
    )
    const distance = new Vector3(...fitted.position).distanceTo(
      new Vector3(...fitted.target),
    )
    this.setCamera({
      target: fitted.target,
      position: new Vector3(...direction)
        .normalize()
        .multiplyScalar(distance)
        .add(new Vector3(...fitted.target))
        .toArray(),
    })
  }

  private setCamera(camera: GraphicsCamera3d) {
    this.camera.position.fromArray(camera.position)
    this.controls.target.fromArray(camera.target)
    this.controls.update()
    this.render()
  }

  private resize() {
    const width = Math.max(1, this.container.clientWidth)
    const height = Math.max(1, this.container.clientHeight)
    this.camera.aspect = width / height
    this.renderer.setSize(width, height)
    this.labels.setSize(width, height)
    this.render()
  }

  private render = () => {
    this.camera.near = this.boundsRadius / 10000
    this.camera.far =
      this.camera.position.distanceTo(this.boundsCenter) + this.boundsRadius * 4
    this.camera.updateProjectionMatrix()
    this.renderer.render(this.scene, this.camera)
    this.labels.render(this.scene, this.camera)
  }

  dispose() {
    this.observer.disconnect()
    this.controls.removeEventListener("change", this.render)
    this.controls.dispose()
    disposeThreeGraphics(this.geometry)
    this.annotations.clear()
    this.annotations.removeFromParent()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer.domElement.remove()
    this.labels.domElement.remove()
  }
}
