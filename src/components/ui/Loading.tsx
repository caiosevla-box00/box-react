import { useStore } from '@/store'

export function Loading() {
  const { loading, loadingStep, loadingPct } = useStore()
  if (!loading) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px',
    }}>
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: 'var(--verde-bg)', border: '2px solid var(--verde)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
        boxShadow: '0 0 0 0 rgba(170,255,0,.3)',
        animation: 'pulse-ring 2s ease-in-out infinite',
      }}>
        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--texto)', letterSpacing: '2px', lineHeight: 1 }}>BOX</div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--verde)', letterSpacing: '1px', lineHeight: 1 }}>0.0</div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--verde-dim)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '28px' }}>
        Estética Automotiva
      </div>
      <div style={{ fontSize: '13px', color: 'var(--dim)', letterSpacing: '0.5px', marginBottom: '12px', minHeight: '18px', textAlign: 'center' }}>
        {loadingStep}
      </div>
      <div style={{ width: '200px', height: '3px', background: 'var(--borda)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          background: 'var(--verde)',
          width: `${loadingPct}%`, transition: 'width .4s ease',
        }} />
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--verde)' }}>{loadingPct}%</div>
      <style>{`@keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(170,255,0,.3)} 50%{box-shadow:0 0 0 10px rgba(170,255,0,0)} }`}</style>
    </div>
  )
}
