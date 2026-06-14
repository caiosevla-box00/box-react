import { useStore } from '@/store'
import { COMBOS, SERVICOS } from '@/lib/servicos'

interface CombosProps {
  onSelecionarCombo: (svcIds: string[]) => void
}

export function Combos({ onSelecionarCombo }: CombosProps) {
  const { veiculo, precos } = useStore()

  const getPrecoCombo = (svcs: string[]) =>
    svcs.reduce((acc, id) => acc + (precos[id]?.[veiculo] ?? SERVICOS.find(s => s.id === id)?.base[veiculo] ?? 0), 0)

  const TAG_COLORS: Record<string, string> = {
    ESSENCIAL: '#74b9ff', PROTEÇÃO: '#a29bfe', FARÓIS: '#f0a500',
    PREMIUM: 'var(--verde)', REFRESH: '#fd79a8', FULL: 'var(--verde)'
  }

  return (
    <div>
      <div className="font-bebas text-2xl tracking-widest mb-1" style={{ color: 'var(--verde)' }}>Combos</div>
      <div className="font-barlow text-xs tracking-widest uppercase mb-4" style={{ color: '#555' }}>Pacotes com desconto especial</div>

      {COMBOS.map(combo => {
        const preco = getPrecoCombo(combo.svcs)
        const tagColor = TAG_COLORS[combo.tag] || 'var(--verde)'
        const svcsNomes = combo.svcs.map(id => SERVICOS.find(s => s.id === id)?.nome || id)

        return (
          <div key={combo.id} className="rounded-xl p-4 mb-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--borda)' }}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-barlow font-bold text-base tracking-wide">{combo.nome}</div>
                  <div className="px-2 py-0.5 rounded-full font-barlow text-[10px] font-bold tracking-wider uppercase"
                    style={{ background: `${tagColor}22`, border: `1px solid ${tagColor}`, color: tagColor }}>
                    {combo.tag}
                  </div>
                </div>
                <div className="font-barlow text-xs leading-relaxed" style={{ color: '#555' }}>{combo.desc}</div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <div className="font-bebas text-2xl leading-none" style={{ color: 'var(--verde)' }}>R${preco}</div>
                <div className="font-barlow text-[10px]" style={{ color: '#555' }}>{combo.svcs.length} serviços</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {svcsNomes.map((nome, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full font-barlow text-[10px]"
                  style={{ background: 'var(--verde-bg)', border: '1px solid var(--verde-dim)', color: 'var(--verde)' }}>
                  {nome}
                </span>
              ))}
            </div>

            <button onClick={() => onSelecionarCombo(combo.svcs)}
              className="w-full py-3 rounded-xl font-barlow font-extrabold text-sm tracking-widest uppercase"
              style={{ background: 'var(--verde)', color: '#080808', border: 'none' }}>
              SELECIONAR COMBO
            </button>
          </div>
        )
      })}
    </div>
  )
}
