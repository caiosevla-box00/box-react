import { useStore } from '@/store'

export function Loading() {
  const { loading, loadingStep, loadingPct } = useStore()
  if (!loading) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: '#0a0a0a',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px',
    }}>
      {/* Logo */}
      <div className="animate-pulse-verde" style={{
        width: 110, height: 110, borderRadius: '50%',
        background: 'var(--verde-bg)', border: '2px solid var(--verde)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: '28px',
      }}>
        <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '3px', color: '#fff', lineHeight: 1 }}>BOX</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--verde)', lineHeight: 1, letterSpacing: '2px' }}>0.0</div>
        <div style={{ fontSize: '8px', color: 'var(--verde-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>Estética</div>
      </div>

      <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '4px', color: '#fff', marginBottom: '4px' }}>BOX <span style={{ color: 'var(--verde)' }}>0.0</span></div>
      <div style={{ fontSize: '10px', color: 'var(--verde-dim)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '32px' }}>Automotiva</div>

      <div style={{ fontSize: '12px', color: '#666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', minHeight: '16px' }}>
        {loadingStep}
      </div>

      <div style={{ width: '240px', maxWidth: '80vw', height: '4px', background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{
          height: '100%', borderRadius: '4px', background: 'var(--verde)',
          width: `${loadingPct}%`, transition: 'width .4s ease',
        }} />
      </div>

      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--verde)' }}>{loadingPct}%</div>
    </div>
  )
}
