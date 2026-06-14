import { useEffect } from 'react'
import { useStore } from '@/store'

export function Toast() {
  const { toast, clearToast } = useStore()
  useEffect(() => { if (!toast) return; const t = setTimeout(clearToast, 2800); return () => clearTimeout(t) }, [toast])
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 99998, padding: '12px 20px', borderRadius: '20px', whiteSpace: 'nowrap',
      background: 'var(--verde-bg)', border: '1px solid var(--verde)', color: 'var(--verde)',
      fontSize: '13px', fontWeight: 600, letterSpacing: '.5px', animation: 'fadeUp .25s ease',
    }}>
      {toast}
    </div>
  )
}
