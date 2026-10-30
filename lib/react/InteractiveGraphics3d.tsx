import { useEffect, useRef, useState } from "react"
import type { GraphicsObject3d, Point3d } from "../types"
import { Graphics3dView } from "./graphics-3d-view"

const axisViews: { label: string; direction: Point3d }[] = [
  { label: "+X", direction: [1, 0, 0] },
  { label: "−X", direction: [-1, 0, 0] },
  { label: "+Y", direction: [0, 1, 0] },
  { label: "−Y", direction: [0, -1, 0] },
  { label: "+Z", direction: [0, 0, 1] },
  { label: "−Z", direction: [0, 0, -1] },
]
const buttonStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 5,
  background: "white",
  color: "#334155",
  padding: "5px 9px",
  cursor: "pointer",
  fontSize: 12,
}

export function InteractiveGraphics3d({
  graphics,
  height = 520,
}: {
  graphics: GraphicsObject3d
  height?: number
}) {
  const container = useRef<HTMLDivElement>(null)
  const view = useRef<Graphics3dView | null>(null)
  const [error, setError] = useState<string>()
  const [cameraFixture, setCameraFixture] = useState<string>()
  const [copyStatus, setCopyStatus] = useState<string>()
  useEffect(() => {
    try {
      view.current = new Graphics3dView(container.current!)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
    return () => {
      view.current?.dispose()
      view.current = null
    }
  }, [])
  useEffect(() => {
    if (!view.current) return
    try {
      view.current.update(graphics)
      setError(undefined)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }, [graphics])

  async function copyCamera() {
    if (!view.current) return
    const camera = view.current.getCamera()
    const fixture = JSON.stringify(
      { cameraPosition: camera.position, cameraTarget: camera.target },
      null,
      2,
    )
    setCameraFixture(fixture)
    try {
      await navigator.clipboard.writeText(fixture)
      setCopyStatus("Camera copied")
    } catch {
      setCopyStatus("Select and copy the camera fixture below")
    }
  }

  return (
    <div
      style={{
        width: "100%",
        background: "#f7f9fc",
        fontFamily: "system-ui",
        color: "#334155",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          padding: "12px 18px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <strong style={{ marginRight: "auto", fontSize: 14 }}>
          {graphics.title ?? "3D graphics"}
        </strong>
        <button
          style={buttonStyle}
          type="button"
          onClick={() => view.current?.fit()}
        >
          Fit
        </button>
        <button
          style={buttonStyle}
          type="button"
          onClick={() => view.current?.reset()}
        >
          Reset camera
        </button>
        <button style={buttonStyle} type="button" onClick={copyCamera}>
          Copy camera
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <div style={{ position: "relative" }}>
        <div
          ref={container}
          style={{ height, position: "relative", overflow: "hidden" }}
        />
        <div
          role="group"
          aria-label="Camera axis views"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            gap: 4,
          }}
        >
          {axisViews.map(({ label, direction }) => (
            <button
              key={label}
              type="button"
              style={buttonStyle}
              aria-label={`View from ${label}`}
              onClick={() => view.current?.axis(direction)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p
        style={{
          padding: "8px 18px",
          margin: 0,
          color: "#64748b",
          fontSize: 12,
        }}
      >
        Drag to orbit · Right-drag / Shift-drag to pan · Scroll to zoom · Z up
      </p>
      {cameraFixture && (
        <div style={{ padding: "8px 18px 16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span role="status">
              {copyStatus} — paste into your visualization result.
            </span>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => setCameraFixture(undefined)}
            >
              Hide camera
            </button>
          </div>
          <textarea
            aria-label="Camera fixture JSON"
            readOnly
            value={cameraFixture}
            rows={12}
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontFamily: "monospace",
            }}
          />
        </div>
      )}
    </div>
  )
}
