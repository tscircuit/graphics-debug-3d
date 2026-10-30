import { useEffect, useMemo, useRef, useState } from "react"
import {
  createGraphicsCamera3d,
  getGraphicsBounds3d,
  renderGraphics3d,
  type GraphicsObject3d,
  type Point3d,
} from "../index"

export function InteractiveGraphics3d({
  graphics,
  height = 520,
}: {
  graphics: GraphicsObject3d
  height?: number
}) {
  const container = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const [width, setWidth] = useState(800)
  const [orbit, setOrbit] = useState({ yaw: 0, pitch: 0, zoom: 1 })
  const [error, setError] = useState<string>()
  const frame = useMemo(() => {
    const fitted = createGraphicsCamera3d(
      getGraphicsBounds3d(graphics),
      width / height,
    )
    const delta = fitted.position.map(
      (n, axis) => n - fitted.target[axis],
    ) as Point3d
    const distance = Math.hypot(...delta) * orbit.zoom
    const yaw = Math.atan2(delta[1], delta[0]) + orbit.yaw
    const pitch = Math.max(
      -1.45,
      Math.min(1.45, Math.asin(delta[2] / Math.hypot(...delta)) + orbit.pitch),
    )
    return {
      target: fitted.target,
      position: [
        fitted.target[0] + distance * Math.cos(pitch) * Math.cos(yaw),
        fitted.target[1] + distance * Math.cos(pitch) * Math.sin(yaw),
        fitted.target[2] + distance * Math.sin(pitch),
      ] as Point3d,
    }
  }, [graphics, width, height, orbit])
  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(1, Math.round(entry.contentRect.width))),
    )
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const request = requestAnimationFrame(() => {
      try {
        const { bitmap } = renderGraphics3d(graphics, {
          width,
          height,
          camera: frame,
        })
        canvas.current
          ?.getContext("2d")
          ?.putImageData(
            new ImageData(new Uint8ClampedArray(bitmap.data), width, height),
            0,
            0,
          )
        setError(undefined)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    })
    return () => cancelAnimationFrame(request)
  }, [graphics, width, height, frame])
  return (
    <div
      ref={container}
      style={{ width: "100%", background: "#f7f9fc", fontFamily: "system-ui" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          color: "#334155",
        }}
      >
        <strong>{graphics.title ?? "3D graphics"}</strong>
        <button
          type="button"
          onClick={() => setOrbit({ yaw: 0, pitch: 0, zoom: 1 })}
        >
          Reset view
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <canvas
        ref={canvas}
        width={width}
        height={height}
        aria-label={graphics.title ?? "Interactive 3D graphics"}
        style={{
          display: "block",
          width: "100%",
          touchAction: "none",
          cursor: "grab",
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = { x: event.clientX, y: event.clientY }
        }}
        onPointerMove={(event) => {
          if (!drag.current) return
          const dx = event.clientX - drag.current.x
          const dy = event.clientY - drag.current.y
          drag.current = { x: event.clientX, y: event.clientY }
          setOrbit((previous) => ({
            ...previous,
            yaw: previous.yaw - dx * 0.008,
            pitch: previous.pitch + dy * 0.008,
          }))
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
        onLostPointerCapture={() => {
          drag.current = null
        }}
        onWheel={(event) =>
          setOrbit((previous) => ({
            ...previous,
            zoom: Math.max(
              0.25,
              Math.min(5, previous.zoom * Math.exp(event.deltaY * 0.001)),
            ),
          }))
        }
      />
      <p
        style={{
          padding: "8px 18px",
          margin: 0,
          color: "#64748b",
          fontSize: 13,
        }}
      >
        Drag to orbit · Scroll to zoom · Right-handed coordinates, Z up
      </p>
    </div>
  )
}
