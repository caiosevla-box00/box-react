import { useStore } from '@/store'

export function Loading() {
  const { loading, loadingStep, loadingPct } = useStore()

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center px-8"
      style={{ background: '#080808' }}>
      <img src="/icon.png" alt="BOX 0.0"
        className="w-36 h-36 rounded-full mb-7 animate-pulse-verde"
        style={{ boxShadow: '0 0 40px rgba(170,255,0,.25)' }} />

      <div className="font-bebas text-5xl tracking-widest text-white mb-1">
        BOX <span style={{ color: 'var(--verde)' }}>0.0</span>
      </div>
      <div className="font-barlow text-xs tracking-[4px] uppercase mb-9"
        style={{ color: 'var(--verde-dim)' }}>
        Estética Automotiva
      </div>

      <div className="font-barlow text-sm tracking-widest uppercase mb-4 text-center min-h-5"
        style={{ color: '#aaa' }}>
        {loadingStep}
      </div>

      <div className="w-64 max-w-[80vw] h-1.5 rounded-full mb-3" style={{ background: '#1a1a1a' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${loadingPct}%`, background: 'linear-gradient(90deg, #5abf00, #AAFF00)' }} />
      </div>

      <div className="font-bebas text-xl tracking-widest" style={{ color: 'var(--verde)' }}>
        {loadingPct}%
      </div>
    </div>
  )
}
