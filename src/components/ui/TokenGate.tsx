import { useState, useEffect } from 'react'

const TOKEN_KEY = 'box00_token_v1'
const TOKEN_VALIDO = 'BOX2903'
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 dias em ms

export function useTokenGate() {
  const [liberado, setLiberado] = useState(false)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(TOKEN_KEY)
      if (salvo) {
        const { token, ts } = JSON.parse(salvo)
        const expirou = Date.now() - ts > TOKEN_EXPIRY
        if (token === TOKEN_VALIDO && !expirou) {
          setLiberado(true)
        }
      }
    } catch {}
    setVerificando(false)
  }, [])

  function autenticar(token: string): boolean {
    if (token.trim().toUpperCase() === TOKEN_VALIDO) {
      localStorage.setItem(TOKEN_KEY, JSON.stringify({ token: TOKEN_VALIDO, ts: Date.now() }))
      setLiberado(true)
      return true
    }
    return false
  }

  return { liberado, verificando, autenticar }
}

export function TokenGate({ children }: { children: React.ReactNode }) {
  const { liberado, verificando, autenticar } = useTokenGate()
  const [input, setInput] = useState('')
  const [erro, setErro] = useState(false)
  const [tentativas, setTentativas] = useState(0)

  if (verificando) return null

  if (liberado) return <>{children}</>

  function handleSubmit() {
    if (autenticar(input)) {
      setErro(false)
    } else {
      setErro(true)
      setTentativas(t => t + 1)
      setInput('')
      setTimeout(() => setErro(false), 2000)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px', zIndex: 99999,
    }}>
      {/* Logo */}
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        background: '#0d1a00', border: '2px solid #AAFF00',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '2px', lineHeight: 1 }}>BOX</div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#AAFF00', lineHeight: 1 }}>0.0</div>
      </div>

      <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
        BOX <span style={{ color: '#AAFF00' }}>0.0</span>
      </div>
      <div style={{ fontSize: '11px', color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '36px' }}>
        Estética Automotiva
      </div>

      <div style={{ width: '100%', maxWidth: '280px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px', textAlign: 'center' }}>
          Digite o código de acesso
        </div>
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value.toUpperCase()); setErro(false) }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Código de acesso"
          autoFocus
          style={{
            width: '100%', background: '#111',
            border: `1.5px solid ${erro ? '#ff6b6b' : '#222'}`,
            borderRadius: '12px', padding: '14px 16px',
            color: '#fff', fontSize: '18px', fontWeight: 700,
            outline: 'none', textAlign: 'center', letterSpacing: '4px',
            marginBottom: '10px', transition: 'border-color .2s',
          }}
        />
        {erro && (
          <div style={{ fontSize: '12px', color: '#ff6b6b', textAlign: 'center', marginBottom: '10px' }}>
            Código incorreto. Tente novamente.
          </div>
        )}
        <button onClick={handleSubmit} style={{
          width: '100%', background: '#AAFF00', color: '#000',
          fontSize: '14px', fontWeight: 700, padding: '14px',
          borderRadius: '12px', border: 'none', cursor: 'pointer',
          letterSpacing: '1px',
        }}>
          ENTRAR
        </button>
      </div>

      <div style={{ fontSize: '11px', color: '#333', marginTop: '40px' }}>
        Uso exclusivo · BOX 0.0
      </div>
    </div>
  )
}
