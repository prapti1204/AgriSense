export default function Toggle({
  checked,
  onChange,
  label,
  large = false,
  offColor = "#E0E0E0",
  onColor = "#43A047",
}) {
  const width = large ? 54 : 44,
    height = large ? 30 : 24,
    size = large ? 22 : 18,
    inset = large ? 4 : 3
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      style={{
        width,
        height,
        padding: 0,
        border: "none",
        borderRadius: height / 2,
        background: checked ? onColor : offColor,
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "white",
          position: "absolute",
          top: inset,
          left: checked ? width - size - inset : inset,
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  )
}
