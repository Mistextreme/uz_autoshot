import React, { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Palette, Settings, Layers } from 'lucide-react'
import { Switch } from './ui/switch'

// ── GTA vehicle color palette ─────────────────────────
const COLORS = [
  { id: 0,   label: 'Black',           hex: '#0d1116' },
  { id: 1,   label: 'Graphite',        hex: '#1c2024' },
  { id: 12,  label: 'Black Steel',     hex: '#333333' },
  { id: 2,   label: 'Black Poly',      hex: '#1a1d21' },
  { id: 3,   label: 'Dark Silver',     hex: '#515459' },
  { id: 4,   label: 'Silver',          hex: '#99a0a7' },
  { id: 5,   label: 'Blue Silver',     hex: '#7e8e9e' },
  { id: 6,   label: 'Stone Silver',    hex: '#c8cdcf' },
  { id: 7,   label: 'Midnight Silver', hex: '#6b7275' },
  { id: 8,   label: 'Cast Iron Silver',hex: '#a09e9f' },
  { id: 111, label: 'White',           hex: '#f0f0f0' },
  { id: 27,  label: 'Red',             hex: '#c40018' },
  { id: 28,  label: 'Torino Red',      hex: '#d0021b' },
  { id: 29,  label: 'Formula Red',     hex: '#b40000' },
  { id: 150, label: 'Lava Red',        hex: '#a51c1c' },
  { id: 35,  label: 'Dark Green',      hex: '#132428' },
  { id: 48,  label: 'Racing Green',    hex: '#215033' },
  { id: 49,  label: 'Sea Green',       hex: '#418555' },
  { id: 50,  label: 'Olive Green',     hex: '#5c6b2e' },
  { id: 61,  label: 'Galaxy Blue',     hex: '#2d547a' },
  { id: 62,  label: 'Dark Blue',       hex: '#0c2a4a' },
  { id: 63,  label: 'Saxon Blue',      hex: '#3b5f8a' },
  { id: 64,  label: 'Blue',            hex: '#47578f' },
  { id: 65,  label: 'Mariner Blue',    hex: '#3a6ea5' },
  { id: 66,  label: 'Harbor Blue',     hex: '#3b7eb5' },
  { id: 88,  label: 'Yellow',          hex: '#dadf46' },
  { id: 89,  label: 'Race Yellow',     hex: '#f5890f' },
  { id: 91,  label: 'Dew Yellow',      hex: '#e3e04a' },
  { id: 38,  label: 'Orange',          hex: '#c85a2b' },
  { id: 39,  label: 'Bright Orange',   hex: '#e0601a' },
  { id: 120, label: 'Pink',            hex: '#df5fa3' },
  { id: 121, label: 'Salmon Pink',     hex: '#e8736f' },
  { id: 138, label: 'Purple',          hex: '#6b3fa0' },
  { id: 140, label: 'Midnight Purple', hex: '#3b1d6e' },
  { id: 145, label: 'Chrome',          hex: '#dfe0e0' },
  { id: 131, label: 'Matte Black',     hex: '#151921' },
  { id: 132, label: 'Matte Gray',      hex: '#3a3d40' },
  { id: 133, label: 'Matte Lt Gray',   hex: '#606b6e' },
  { id: 134, label: 'Util Black',      hex: '#1e2126' },
  { id: 135, label: 'Util Black Poly', hex: '#242a30' },
  { id: 136, label: 'Util Dark Silver',hex: '#4a4f54' },
]

// ── Shared style helpers ──────────────────────────────
const panel = (extra = {}) => ({
  background: 'rgba(8,8,10,0.92)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
  ...extra,
})

const label9 = (extra = {}) => ({
  fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
  color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
  ...extra,
})

// ── Color swatch grid ─────────────────────────────────
function ColorGrid({ current, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 0 2px' }}>
      {COLORS.map(c => {
        const sel = current === c.id
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            title={`${c.label} (${c.id})`}
            data-no-orbit
            style={{
              width: 20, height: 20, borderRadius: 4, cursor: 'pointer',
              background: c.hex, flexShrink: 0,
              border: sel ? '2px solid #fff' : '1px solid rgba(255,255,255,0.10)',
              boxShadow: sel ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
              outline: 'none',
            }}
          />
        )
      })}
    </div>
  )
}

// ── Stepper for mod index ─────────────────────────────
function Stepper({ value, min, max, onChange }) {
  return (
    <div className="flex items-center gap-1" data-no-orbit>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: value <= min ? 'default' : 'pointer', opacity: value <= min ? 0.3 : 1 }}>
        <ChevronLeft style={{ width: 10, height: 10, color: '#aaa' }} />
      </button>
      <span style={{ minWidth: 32, textAlign: 'center', fontSize: 10, color: '#ddd', fontWeight: 600 }}>
        {value === -1 ? 'Stock' : `#${value}`}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: value >= max ? 'default' : 'pointer', opacity: value >= max ? 0.3 : 1 }}>
        <ChevronRight style={{ width: 10, height: 10, color: '#aaa' }} />
      </button>
    </div>
  )
}

// ════════════════════════════════════════════════════
// VehicleCustomizer
// ════════════════════════════════════════════════════
export function VehicleCustomizer({ customization, onExtraToggle, onModChange, onColorChange }) {
  const [tab, setTab]         = useState('extras')
  const [collapsed, setCollapsed] = useState(false)

  // Local state — mirrors what's applied on the vehicle
  const [extras, setExtras]   = useState(() => customization?.extras || [])
  const [mods,   setMods]     = useState(() => customization?.mods   || [])
  const [color,  setColor]    = useState(() => customization?.color  || { primary: 0, secondary: 0 })
  const [colorTarget, setColorTarget] = useState(null)

  const handleExtraToggle = useCallback((index, currentEnabled) => {
    const next = !currentEnabled
    setExtras(prev => prev.map(e => e.index === index ? { ...e, enabled: next } : e))
    onExtraToggle?.({ index, enabled: next })
  }, [onExtraToggle])

  const handleModChange = useCallback((modType, newIndex) => {
    setMods(prev => prev.map(m => m.modType === modType ? { ...m, current: newIndex } : m))
    onModChange?.({ modType, modIndex: newIndex })
  }, [onModChange])

  const handleColorSelect = useCallback((colorId) => {
    if (!colorTarget) return
    const next = { ...color, [colorTarget]: colorId }
    setColor(next)
    onColorChange?.(next)
    setColorTarget(null)
  }, [colorTarget, color, onColorChange])

  const TABS = [
    { id: 'extras', icon: <Layers style={{ width: 10, height: 10 }} />,   label: `Extras (${extras.length})` },
    { id: 'mods',   icon: <Settings style={{ width: 10, height: 10 }} />, label: `Mods (${mods.length})`     },
    { id: 'color',  icon: <Palette style={{ width: 10, height: 10 }} />,  label: 'Color'                     },
  ]

  const currentPrimaryColor   = COLORS.find(c => c.id === color.primary)?.hex   || '#0d1116'
  const currentSecondaryColor = COLORS.find(c => c.id === color.secondary)?.hex || '#0d1116'

  return (
    <div
      data-no-orbit
      className="absolute left-5 top-1/2 z-[9999] animate-enter"
      style={{ transform: 'translateY(-50%)', userSelect: 'none' }}>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(p => !p)}
        style={{
          ...panel({ borderRadius: 8, padding: '4px 8px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', border: 'none' }),
          width: '100%', justifyContent: 'space-between',
        }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Customize</span>
        <ChevronLeft style={{ width: 10, height: 10, color: '#555', transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>

      {!collapsed && (
        <div style={{ ...panel({ padding: 0, overflow: 'hidden' }), width: 220 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '6px 8px 0' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setColorTarget(null) }}
                style={{
                  flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 2px 6px',
                  borderBottom: tab === t.id ? '2px solid #3b82f6' : '2px solid transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                }}>
                <span style={{ color: tab === t.id ? '#93c5fd' : '#444' }}>{t.icon}</span>
                <span style={{ fontSize: 8, fontWeight: 600, color: tab === t.id ? '#93c5fd' : '#444', whiteSpace: 'nowrap' }}>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ maxHeight: 340, overflowY: 'auto', padding: '8px 10px 10px' }}
            className="scrollbar-thin">

            {/* ── EXTRAS ── */}
            {tab === 'extras' && (
              extras.length === 0
                ? <p style={{ fontSize: 10, color: '#444', textAlign: 'center', padding: '16px 0' }}>No extras available</p>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={label9()}>Toggle extras</span>
                    {extras.map(e => (
                      <div key={e.index} className="flex items-center justify-between" style={{ gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>Extra #{e.index}</span>
                        <Switch
                          size="sm"
                          checked={e.enabled}
                          onCheckedChange={() => handleExtraToggle(e.index, e.enabled)}
                        />
                      </div>
                    ))}
                  </div>
            )}

            {/* ── MODS ── */}
            {tab === 'mods' && (
              mods.length === 0
                ? <p style={{ fontSize: 10, color: '#444', textAlign: 'center', padding: '16px 0' }}>No mods available</p>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={label9()}>Select mod variants</span>
                    {mods.map(m => (
                      <div key={m.modType} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 10, color: '#777', fontWeight: 600 }}>{m.label}</span>
                        <Stepper
                          value={m.current}
                          min={-1}
                          max={m.count - 1}
                          onChange={val => handleModChange(m.modType, val)}
                        />
                      </div>
                    ))}
                  </div>
            )}

            {/* ── COLOR ── */}
            {tab === 'color' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={label9()}>Vehicle colors</span>
                <div className="flex items-center gap-3">
                  {[
                    { key: 'primary',   label: 'Primary',   hex: currentPrimaryColor   },
                    { key: 'secondary', label: 'Secondary', hex: currentSecondaryColor },
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => setColorTarget(colorTarget === t.key ? null : t.key)}
                      style={{
                        flex: 1, background: colorTarget === t.key ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${colorTarget === t.key ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)'}`,
                        borderRadius: 6, padding: '5px 6px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      }}>
                      <span style={{ width: 28, height: 16, borderRadius: 3, background: t.hex, border: '1px solid rgba(255,255,255,0.15)', display: 'block' }} />
                      <span style={{ fontSize: 8, color: '#666', fontWeight: 600 }}>{t.label}</span>
                    </button>
                  ))}
                </div>
                {colorTarget && (
                  <ColorGrid
                    current={color[colorTarget]}
                    onSelect={handleColorSelect}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
