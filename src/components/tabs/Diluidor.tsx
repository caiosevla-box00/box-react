import { useState, useEffect } from 'react'
import { useStore } from '@/store'

interface ProdutoDil { nome: string; parteProd: number; parteAgua: number }

const DIL_KEY = 'box00_diluidor_v1'

function getProdutos(): ProdutoDil[] {
  try { return JSON.parse(localStorage.getItem(DIL_KEY) || '[]') } catch { return [] }
}
function saveProdutos(p: ProdutoDil[]) { localStorage.setItem(DIL_KEY, JSON.stringify(p)) }

const VOLUMES = [250, 500, 750, 1000, 2000]

export function Diluidor() {
  const { showToast } = useStore()
  const [parteProd, setParteProd] = useState(1)
  const [parteAgua, setParteAgua] = useState(100)
  const [volume, setVolume] = useState(500)
  const [produtos, setProdutos] = useState<ProdutoDil[]>(getProdutos())
  const [modalOpen, setModalOpen] = useState(false)
  const [novoNome, setNovoNome] = useState('')

  const total = parteProd + parteAgua
  const mlProd = (parteProd / total) * volume
  const mlAgua = volume - mlProd

  const fmt = (v: number) => v >= 1000 ? `${(v/1000).toFixed(2).replace('.',',')}L` : `${v.toFixed(0)}ml`

  function usarProduto(p: ProdutoDil) {
    setParteProd(p.parteProd)
    setParteAgua(p.parteAgua)
    showToast(`✅ ${p.nome} selecionado!`)
  }

  function removerProduto(idx: number) {
    const nova = produtos.filter((_, i) => i !== idx)
    saveProdutos(nova)
    setProdutos(nova)
  }

  function salvarProduto() {
    if (!novoNome.trim()) { showToast('⚠️ Informe o nome'); return }
    const nova = [...produtos, { nome: novoNome.trim(), parteProd, parteAgua }]
    saveProdutos(nova)
    setProdutos(nova)
    setNovoNome('')
    setModalOpen(false)
    showToast('✅ Produto salvo!')
  }

  return (
    <div>
      <div className="font-barlow text-2xl font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--verde)' }}>
        🧪 Diluidor
      </div>
      <div className="font-barlow text-xs tracking-widest uppercase mb-5" style={{ color: '#555' }}>
        Calculadora de diluição de produtos
      </div>

      {/* Produtos salvos */}
      <div className="mb-5">
        <div className="font-barlow text-xs font-bold tracking-[2px] uppercase mb-2" style={{ color: '#555' }}>
          Produtos salvos
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {produtos.length === 0 && (
            <div className="font-barlow text-xs italic" style={{ color: '#444' }}>Nenhum produto salvo ainda</div>
          )}
          {produtos.map((p, i) => (
            <div key={i} className="relative">
              <button onClick={() => usarProduto(p)}
                className="font-barlow text-xs font-bold tracking-wider uppercase px-3 py-2 rounded-lg"
                style={{ background: 'var(--surface2)', border: '1px solid #333', color: '#ccc' }}>
                {p.nome} <span style={{ color: 'var(--verde)' }}>1:{p.parteAgua}</span>
              </button>
              <button onClick={() => removerProduto(i)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center"
                style={{ background: '#333', color: '#aaa' }}>✕</button>
            </div>
          ))}
        </div>
        <button onClick={() => setModalOpen(true)}
          className="w-full py-2 rounded-lg font-barlow text-xs font-bold tracking-widest uppercase"
          style={{ border: '1px dashed #333', color: '#555', background: 'transparent' }}>
          + Salvar produto
        </button>
      </div>

      {/* Calculadora */}
      <div className="rounded-xl p-4" style={{ background: 'var(--surface2)', border: '1px solid #222' }}>
        <div className="font-barlow font-bold text-sm tracking-wider uppercase mb-4" style={{ color: 'var(--verde)' }}>
          ⚗️ Calcular Diluição
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#555' }}>
              Parte do produto
            </label>
            <input type="number" value={parteProd} min={1}
              onChange={e => setParteProd(Number(e.target.value))}
              className="w-full rounded-lg p-3 font-bebas text-3xl text-center outline-none"
              style={{ background: 'var(--bg)', border: '1px solid #333', color: 'var(--verde)' }} />
          </div>
          <div>
            <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#555' }}>
              Parte de água
            </label>
            <input type="number" value={parteAgua} min={1}
              onChange={e => setParteAgua(Number(e.target.value))}
              className="w-full rounded-lg p-3 font-bebas text-3xl text-center outline-none"
              style={{ background: 'var(--bg)', border: '1px solid #333', color: 'var(--azul)' }} />
          </div>
        </div>

        <div className="mb-3">
          <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#555' }}>
            Volume final (ml)
          </label>
          <input type="number" value={volume} min={1}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-full rounded-lg p-3 font-bebas text-4xl text-center outline-none"
            style={{ background: 'var(--bg)', border: '1px solid #333', color: '#f0f0f0' }} />
        </div>

        {/* Atalhos de volume */}
        <div className="flex gap-2 mb-5">
          {VOLUMES.map(v => (
            <button key={v} onClick={() => setVolume(v)}
              className="flex-1 py-2 rounded-lg font-barlow text-xs font-bold"
              style={{
                background: volume === v ? 'rgba(170,255,0,.1)' : '#000',
                border: `1px solid ${volume === v ? 'var(--verde)' : '#333'}`,
                color: volume === v ? 'var(--verde)' : '#555'
              }}>
              {v < 1000 ? `${v}ml` : `${v/1000}L`}
            </button>
          ))}
        </div>

        {/* Resultado */}
        <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(170,255,0,.05)', border: '1px solid rgba(170,255,0,.2)' }}>
          <div className="font-barlow text-xs tracking-[2px] uppercase mb-3" style={{ color: '#555' }}>RESULTADO</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-lg p-3" style={{ background: 'var(--surface2)' }}>
              <div className="font-bebas text-4xl" style={{ color: 'var(--verde)' }}>{fmt(mlProd)}</div>
              <div className="font-barlow text-xs tracking-wider uppercase mt-1" style={{ color: '#555' }}>🧴 Produto</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--surface2)' }}>
              <div className="font-bebas text-4xl" style={{ color: 'var(--azul)' }}>{fmt(mlAgua)}</div>
              <div className="font-barlow text-xs tracking-wider uppercase mt-1" style={{ color: '#555' }}>💧 Água</div>
            </div>
          </div>
          <div className="font-barlow text-xs tracking-wider" style={{ color: '#555' }}>
            Proporção 1:{Math.round(parteAgua/parteProd)} · Volume total: {fmt(volume)}
          </div>
        </div>
      </div>

      {/* Modal salvar produto */}
      {modalOpen && (
        <div className="fixed inset-0 z-[10010] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,.8)' }}
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="w-full max-w-[500px] rounded-t-2xl p-6 pb-10"
            style={{ background: 'var(--surface2)' }}>
            <div className="font-bebas text-2xl tracking-widest mb-4" style={{ color: 'var(--verde)' }}>
              Salvar Produto
            </div>
            <div className="mb-3">
              <label className="font-barlow text-xs font-bold tracking-wider uppercase block mb-1" style={{ color: '#555' }}>
                Nome do produto
              </label>
              <input value={novoNome} onChange={e => setNovoNome(e.target.value)}
                placeholder="Ex: APC, Shampoo, Pretinho..."
                className="w-full rounded-lg px-4 py-3 text-base outline-none"
                style={{ background: 'var(--bg)', border: '1px solid #333', color: '#f0f0f0' }} />
            </div>
            <div className="font-barlow text-xs mb-4" style={{ color: '#555' }}>
              Proporção: 1:{parteAgua} (valores atuais da calculadora)
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-barlow font-bold text-sm tracking-widest uppercase"
                style={{ border: '1px solid #333', color: '#777', background: 'transparent' }}>
                Cancelar
              </button>
              <button onClick={salvarProduto}
                className="flex-2 py-3 px-6 rounded-xl font-barlow font-extrabold text-sm tracking-widest uppercase"
                style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>
                SALVAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
