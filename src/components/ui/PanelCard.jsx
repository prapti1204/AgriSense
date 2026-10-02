import { usePalette } from "./usePalette"
export default function PanelCard({ children, style }) {
  const p = usePalette()
  return (
    <div
      style={{
        background: p.surface,
        border: `1px solid ${p.border}`,
        borderRadius: 20,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
