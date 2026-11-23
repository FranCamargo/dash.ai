import { useState, useRef, useEffect } from 'react'

export const MODELS = [
  { id: 'qwen3.5:4b',             label: 'qwen3.5:4b',             provider: 'Ollama',    supportsImages: true },
  { id: 'lfm3-vl:latest',         label: 'lfm3-vl:latest',         provider: 'Ollama',    supportsImages: true },
  { id: 'claude-opus-4-8',       label: 'Claude Opus 4.8',        provider: 'Anthropic' },
  { id: 'claude-sonnet-4-6',     label: 'Claude Sonnet 4.6',      provider: 'Anthropic' },
  { id: 'gpt-5.1',               label: 'GPT 5.1',                provider: 'OpenAI'    },
  { id: 'gpt-4o',                label: 'GPT-4o',                 provider: 'OpenAI'    },
  { id: 'o4-mini',               label: 'o4-mini',                provider: 'OpenAI'    },
  { id: 'gemini-2.0-flash',      label: 'Gemini 2.0 Flash (LTS)', provider: 'Google'    },
  { id: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro',         provider: 'Google'    },
  { id: 'deepseek-v3',           label: 'DeepSeek V3',            provider: 'DeepSeek'  },
  { id: 'llama-3.3-70b',         label: 'Llama 3.3 70B',          provider: 'Meta'      },
]

const IconChevron = ({ open }) => (
  <svg
    width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export default function ModelSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = MODELS.find(m => m.id === value) ?? MODELS[0]

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="model-selector" ref={ref}>
      <button
        className="model-selector__trigger"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        {current.label}
        <IconChevron open={open} />
      </button>

      {open && (
        <ul className="model-selector__dropdown">
          {MODELS.map(m => (
            <li key={m.id}>
              <button
                className={`model-selector__option${m.id === value ? ' model-selector__option--active' : ''}`}
                onClick={() => { onChange(m.id); setOpen(false) }}
                type="button"
              >
                {m.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
