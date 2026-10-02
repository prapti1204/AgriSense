import { createContext, useContext, useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { usePalette } from "../components/ui/usePalette"
const FeedbackContext = createContext({
  notify: (_message) => {},
  showDetail: (_title, _content) => {},
})
export const useFeedback = () => useContext(FeedbackContext)
export function FeedbackProvider({ children }) {
  const p = usePalette()
  const [message, setMessage] = useState("")
  const [detail, setDetail] = useState(null)
  const dialogRef = useRef(null)
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(""), 5000)
    return () => window.clearTimeout(timer)
  }, [message])
  useEffect(() => {
    if (detail) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [detail])
  return (
    <FeedbackContext.Provider
      value={{
        notify: setMessage,
        showDetail: (title, content) => setDetail({ title, content }),
      }}
    >
      {children}
      {message && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 100,
            maxWidth: "min(420px, calc(100vw - 48px))",
            background: p.surface,
            border: `1px solid ${p.border}`,
            borderLeft: "4px solid #43A047",
            boxShadow: "0 8px 32px #0002",
            borderRadius: 12,
            padding: 18,
            color: p.text,
            display: "flex",
            gap: 16,
            alignItems: "center",
            fontSize: 13,
          }}
        >
          <span>{message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setMessage("")}
            style={{
              border: 0,
              background: "none",
              color: p.muted,
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <dialog
        ref={dialogRef}
        onCancel={() => setDetail(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDetail(null)
        }}
        style={{
          width: 520,
          maxWidth: "calc(100vw - 32px)",
          margin: "auto",
          border: `1px solid ${p.border}`,
          borderRadius: 20,
          padding: 28,
          background: p.surface,
          color: p.text,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 18,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{detail?.title}</h2>
          <button
            aria-label="Close dialog"
            onClick={() => setDetail(null)}
            style={{
              background: "none",
              border: 0,
              color: p.muted,
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: p.muted }}>
          {detail?.content}
        </div>
      </dialog>
    </FeedbackContext.Provider>
  )
}
