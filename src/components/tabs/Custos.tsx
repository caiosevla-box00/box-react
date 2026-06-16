import { useState } from 'react'
import { useStore } from '@/store'
import { apiCall } from '@/lib/api'

export function Custos() {
  const { showToast, setCustoPorKm } = useStore()
  const [gas, setGas] = useState('7')
  const [cons, setCons] = useState('11')
  const [manut, setManut] = useState('300')
  const [kmes, setKmes] = useState('1500')
  const [agua, setAgua] = useState('170')
  const [luz, setLuz] = useState('280')
  const [atend, setAtend] = useState('8')

  const gasN = parseFloat(gas) || 0
  const consN = parseFloat(cons) || 1
  const manutN = parseFloat(manut) || 0
  const kmesN = parseFloat(kmes) || 1
  const aguaN = parseFloat(agua) || 0
  const luzN = parseFloat(luz) || 0
  const atendN = parseFloat(atend) || 1

  const custoCombKm = gasN / consN
  const custoManutKm = manutN / kmesN
  const custoPorKm = custoCombKm + custoManutKm
  const kmMedioAtend = kmesN / atendN
  const custoDeslocamento = custoPorKm * kmMedioAtend
  const custoAgua = aguaN / atendN
  const custoLuz = luzN / atendN
  const custoTotal = custoDeslocamento + custoAgua + custoLuz

  async function salvar() {
    const config: Record<string,string> = {
      custo_gas: gas, custo_cons: cons, custo_manut: manut,
      custo_kmes: kmes, custo_agua: agua, custo_luz: luz, custo_atend: atend
    }
    setCustoPorKm(custoPorKm)
    const r = await apiCall('salvarConfig', { config })
    showToast(r.ok ? '☁️ Custos salvos!' : '💾 Salvo local')
  }

  const campos = [
    { label: '⛽ Preço do combustível (R$/L)', val: gas, set: setGas, placeholder: '7.00' },
    { label: '🚗 Consumo médio (km/L)', val: cons, set: setCons, placeholder: '11' },
    { label: '🔧 Manutenção mensal (R$)', val: manut, set: setManut, placeholder: '300' },
    { label: '📍 Km rodados por mês', val: kmes, set: setKmes, placeholder: '1500' },
    { label: '💧 Conta de água mensal (R$)', val: agua, set: setAgua, placeholder: '170' },
    { label: '⚡ Conta de luz mensal (R$)', val: luz, set: setLuz, placeholder: '280' },
    { label: '📅 Atendimentos por mês', val: atend, set: setAtend, placeholder: '8' },
  ]

  return (
    <div>
      <div className="font-bebas text-2xl tracking-widest mb-1" style={{ color: 'var(--verde)' }}>Custos</div>
      <div className="font-barlow text-xs tracking-widest uppercase mb-4" style={{ color: '#555' }}>Calculadora de custos operacionais</div>

      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--borda)' }}>
        {campos.map((c, i) => (
          <div key={i} className="mb-3">
            <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#777' }}>{c.label}</label>
            <input type="number" value={c.val} onChange={e => c.set(e.target.value)} placeholder={c.placeholder}
              className="w-full rounded-xl px-4 py-3 font-bebas text-2xl outline-none"
              style={{ background: 'var(--bg)', border: '1px solid #333', color: 'var(--verde)' }} />
          </div>
        ))}
      </div>

      {/* Resultado */}
      <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--surface)', border: '2px solid var(--verde)' }}>
        <div className="font-barlow font-bold text-xs tracking-[2px] uppercase mb-3" style={{ color: 'var(--verde)' }}>📊 Custo por Atendimento</div>
        {[
          { label: 'Custo por km', val: `R$${custoPorKm.toFixed(2)}` },
          { label: 'Deslocamento médio', val: `R$${custoDeslocamento.toFixed(2)}` },
          { label: 'Rateio água', val: `R$${custoAgua.toFixed(2)}` },
          { label: 'Rateio luz', val: `R$${custoLuz.toFixed(2)}` },
        ].map((r, i) => (
          <div key={i} className="flex justify-between py-2" style={{ borderBottom: '1px solid #1e1e1e' }}>
            <span className="font-barlow text-sm" style={{ color: '#aaa' }}>{r.label}</span>
            <span className="font-bebas text-xl" style={{ color: '#aaa' }}>{r.val}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3">
          <span className="font-barlow font-bold text-sm tracking-wider uppercase" style={{ color: 'var(--verde)' }}>CUSTO TOTAL</span>
          <span className="font-bebas text-3xl" style={{ color: 'var(--verde)' }}>R${custoTotal.toFixed(2)}</span>
        </div>
      </div>

      <button onClick={salvar}
        className="w-full py-4 rounded-xl font-barlow font-extrabold text-base tracking-widest uppercase"
        style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>
        ☁️ SALVAR CUSTOS
      </button>
    </div>
  )
}
