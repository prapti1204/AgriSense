import { usePalette } from "./usePalette"
export default function Field({ label, children, ...props }) {
  const p = usePalette()
  return (
    <label
      style={{ display: "block", fontSize: 13, fontWeight: 600, color: p.text }}
    >
      {label}
      <input
        {...props}
        style={{
          display: "block",
          width: "100%",
          marginTop: 6,
          padding: "11px 12px",
          borderRadius: 10,
          border: `1px solid ${p.border}`,
          background: p.isDark ? "#223022" : "#F8FAF7",
          color: p.text,
          fontSize: 14,
        }}
      />
      {children}
    </label>
  )
}
