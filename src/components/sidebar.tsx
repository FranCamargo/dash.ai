import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const IconChat = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const IconCuradoria = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const IconBot = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
    <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
  </svg>
)

const LANGUAGES = [
  { code: 'pt-BR', label: 'Português (PT-BR)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

const THEME_KEYS = [
  { code: 'red-night',        labelKey: 'sidebar.themeRedNight' },
  { code: 'owl',              labelKey: 'sidebar.themeOwl' },
  { code: 'ocean',            labelKey: 'sidebar.themeOcean' },
  { code: 'ocean-dark',       labelKey: 'sidebar.themeOceanDark' },
  { code: 'cozy-green',       labelKey: 'sidebar.themeCozyGreen' },
  { code: 'cozy-green-dark',  labelKey: 'sidebar.themeCozyGreenDark' },
]

interface Conversation {
  id: string
  title: string
  messages: unknown[]
}

interface SidebarProps {
  history?: Conversation[]
  activeConvId?: string | null
  onLoadConversation?: (id: string) => void
  onGoHome?: () => void
  onOpenCuradoria?: () => void
  currentView?: string
  isAdmin?: boolean
}

export default function Sidebar({ history = [], activeConvId, onLoadConversation, onGoHome, onOpenCuradoria, currentView, isAdmin }: SidebarProps) {
  const { language, setLanguage, t } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'red-night')
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!settingsOpen) return
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
        setOpenSubmenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [settingsOpen])

  const handleThemeSelect = (code: string) => {
    setTheme(code)
    localStorage.setItem('theme', code)
    document.documentElement.setAttribute('data-theme', code)
    setSettingsOpen(false)
    setOpenSubmenu(null)
  }

  const handleLanguageSelect = (code: string) => {
    setLanguage(code)
    setSettingsOpen(false)
    setOpenSubmenu(null)
  }

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(prev => (prev === name ? null : name))
  }

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <button
        className="sidebar__logo"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? t('sidebar.expand') : t('sidebar.minimize')}
      >
        <IconBot />
      </button>

      <nav className="sidebar__nav">
        <button
          className={`sidebar__nav-item${currentView !== 'curadoria' ? ' active' : ''}`}
          title={t('sidebar.home')}
          onClick={onGoHome}
        >
          <IconHome />
          <span className="sidebar__nav-label">{t('sidebar.home')}</span>
        </button>
        {isAdmin && (
          <button
            className={`sidebar__nav-item${currentView === 'curadoria' ? ' active' : ''}`}
            title={t('sidebar.curadoria')}
            onClick={onOpenCuradoria}
          >
            <IconCuradoria />
            <span className="sidebar__nav-label">{t('sidebar.curadoria')}</span>
          </button>
        )}

      </nav>

      {history.length > 0 ? (
        <>
          <div className="sidebar__divider" />
          <div className="sidebar__history">
            <span className="sidebar__section-label">{t('sidebar.recent')}</span>
            {history.map(conv => (
              <button
                key={conv.id}
                className={`sidebar__nav-item sidebar__history-item${activeConvId === conv.id ? ' active' : ''}`}
                title={conv.title}
                onClick={() => onLoadConversation?.(conv.id)}
              >
                <IconChat />
                <span className="sidebar__history-title">{conv.title}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="sidebar__spacer" />
      )}
      <div className="sidebar__divider" />

      <div className="sidebar__bottom" ref={settingsRef}>
        {settingsOpen && (
          <div className="sidebar__settings-menu">
            <div className="sidebar__settings-group">
              <button
                className="sidebar__settings-item"
                onClick={() => toggleSubmenu('tema')}
              >
                <span>{t('sidebar.theme')}</span>
                <span className="sidebar__settings-arrow">{openSubmenu === 'tema' ? '▲' : '▼'}</span>
              </button>
              {openSubmenu === 'tema' && (
                <div className="sidebar__settings-submenu">
                  {THEME_KEYS.map(th => (
                    <button
                      key={th.code}
                      className={`sidebar__settings-option${theme === th.code ? ' selected' : ''}`}
                      onClick={() => handleThemeSelect(th.code)}
                    >
                      {t(th.labelKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="sidebar__settings-group">
              <button
                className="sidebar__settings-item"
                onClick={() => toggleSubmenu('idioma')}
              >
                <span>{t('sidebar.language')}</span>
                <span className="sidebar__settings-arrow">{openSubmenu === 'idioma' ? '▲' : '▼'}</span>
              </button>
              {openSubmenu === 'idioma' && (
                <div className="sidebar__settings-submenu">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      className={`sidebar__settings-option${language === l.code ? ' selected' : ''}`}
                      onClick={() => handleLanguageSelect(l.code)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <button
          className="sidebar__nav-item"
          title={t('sidebar.settings')}
          onClick={() => { setSettingsOpen(o => !o); setOpenSubmenu(null) }}
        >
          <IconSettings />
          <span className="sidebar__nav-label">{t('sidebar.settings')}</span>
        </button>
      </div>
    </aside>
  )
}
