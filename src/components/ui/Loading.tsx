import { useStore } from '@/store'

export function Loading() {
  const { loading, loadingStep, loadingPct } = useStore()

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center px-8"
      style={{ background: '#080808' }}>

      {/* Logo animado */}
      <div className="mb-7 animate-pulse-verde">
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: '#0a0a0a',
          border: '2px solid #AAFF00',
          boxShadow: '0 0 40px rgba(170,255,0,.25)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 36, letterSpacing: 4, color: '#fff', lineHeight: 1 }}>
            BOX
          </div>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, letterSpacing: 3, color: '#AAFF00', lineHeight: 1 }}>
            0.0
          </div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 8, letterSpacing: 2, color: '#5abf00', textTransform: 'uppercase', marginTop: 3 }}>
            Estética
          </div>
        </div>
      </div>

      <div className="font-barlow text-sm tracking-[4px] uppercase mb-9"
        style={{ color: 'var(--verde-dim)' }}>
        Automotiva
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
