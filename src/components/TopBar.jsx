import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export default function TopBar({ user, onLogout, onNewChat }) {
  const { t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <header className={`topbar${onNewChat ? ' topbar--chat' : ''}`}>
      {onNewChat && (
        <button className="topbar__new-chat-btn" onClick={onNewChat}>
          <IconPlus />
          {t('topBar.newChat')}
        </button>
      )}
      <div className="topbar__right">
        <div className="profile-menu" ref={menuRef}>
          <button
            className={`topbar__profile-btn${menuOpen ? ' active' : ''}`}
            title={user?.name ?? 'Perfil'}
            onClick={() => setMenuOpen(o => !o)}
          >
            {user?.initials ?? '?'}
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown__header">
                <span className="profile-dropdown__name">{user?.name}</span>
              </div>
              <div className="profile-dropdown__divider" />
              <button className="profile-dropdown__item" onClick={onLogout}>
                <IconLogout />
                {t('topBar.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
