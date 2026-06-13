import { useEffect } from 'react'
import { useStore } from '@/store'

export function Toast() {
  const { toast, clearToast } = useStore()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(clearToast, 2800)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[99998] px-5 py-3 rounded-xl text-sm font-barlow font-bold tracking-widest uppercase whitespace-nowrap"
      style={{ background: '#1a2600', border: '1px solid var(--verde)', color: 'var(--verde)', animation: 'fadeUp .3s ease' }}>
      {toast}
    </div>
  )
}
