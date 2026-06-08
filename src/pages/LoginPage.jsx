import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import Footer from '../components/Footer'

const IconBot = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
    <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
  </svg>
)

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

function makeInitials(name) {
  return name.trim().split(' ').filter(Boolean).map(w => w[0].toUpperCase()).join('').slice(0, 2)
}

function LoginForm({ onLogin, onForgot, onRegister }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  const canSubmit = name.trim() && password.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onLogin({ name: name.trim(), initials: makeInitials(name) })
  }

  return (
    <>
      <div className="login-heading">
        <h1 className="login-title">
          {t('login.welcome')}{' '}
          <span className="greeting__highlight">{t('login.assistant')}</span>
        </h1>
        <p className="login-subtitle">{t('login.subtitle')}</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-input-wrap">
          <input
            className="login-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('login.namePlaceholder')}
            autoFocus
            autoComplete="off"
          />
        </div>

        <div className="login-input-wrap login-input-wrap--pw">
          <input
            className="login-input"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="login-pw-toggle"
            onClick={() => setShowPw(v => !v)}
            tabIndex={-1}
          >
            {showPw ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>

        <button
          type="button"
          className="login-link login-link--right"
          onClick={onForgot}
        >
          {t('login.forgotPassword')}
        </button>

        <button className="login-btn" type="submit" disabled={!canSubmit}>
          {t('login.submit')}
        </button>

        <p className="login-footer">
          {t('login.noAccount')}{' '}
          <button type="button" className="login-link" onClick={onRegister}>
            {t('login.register')}
          </button>
        </p>
      </form>
    </>
  )
}

function RegisterForm({ onLogin, onBack }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  const canSubmit = name.trim() && email.trim() && password.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onLogin({ name: name.trim(), initials: makeInitials(name) })
  }

  return (
    <>
      <div className="login-heading">
        <h1 className="login-title">
          {t('register.title')} <span className="greeting__highlight">{t('register.highlight')}</span>
        </h1>
        <p className="login-subtitle">{t('register.subtitle')}</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-input-wrap">
          <input
            className="login-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('login.namePlaceholder')}
            autoFocus
            autoComplete="off"
          />
        </div>

        <div className="login-input-wrap">
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('register.emailPlaceholder')}
            autoComplete="email"
          />
        </div>

        <div className="login-input-wrap login-input-wrap--pw">
          <input
            className="login-input"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('register.passwordPlaceholder')}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="login-pw-toggle"
            onClick={() => setShowPw(v => !v)}
            tabIndex={-1}
          >
            {showPw ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>

        <button className="login-btn" type="submit" disabled={!canSubmit}>
          {t('register.submit')}
        </button>

        <p className="login-footer">
          {t('register.hasAccount')}{' '}
          <button type="button" className="login-link" onClick={onBack}>
            {t('register.login')}
          </button>
        </p>
      </form>
    </>
  )
}

function ForgotForm({ onBack }) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) setSent(true)
  }

  return (
    <>
      <div className="login-heading">
        <h1 className="login-title">
          {t('forgot.title')} <span className="greeting__highlight">{t('forgot.highlight')}</span>
        </h1>
        <p className="login-subtitle">
          {sent ? t('forgot.sentSubtitle') : t('forgot.subtitle')}
        </p>
      </div>

      {!sent ? (
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-wrap">
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('forgot.emailPlaceholder')}
              autoFocus
              autoComplete="email"
            />
          </div>

          <button className="login-btn" type="submit" disabled={!email.trim()}>
            {t('forgot.submit')}
          </button>

          <p className="login-footer">
            <button type="button" className="login-link" onClick={onBack}>
              {t('forgot.backToLogin')}
            </button>
          </p>
        </form>
      ) : (
        <div className="login-form">
          <button className="login-btn" type="button" onClick={onBack}>
            {t('forgot.backToLogin')}
          </button>
        </div>
      )}
    </>
  )
}

export default function LoginPage({ onLogin }) {
  const [view, setView] = useState('login')

  return (
    <div className="login-page page-enter">
      <div className="login-card">
        <div className="login-logo">
          <IconBot />
        </div>

        {view === 'login' && (
          <LoginForm
            onLogin={onLogin}
            onForgot={() => setView('forgot')}
            onRegister={() => setView('register')}
          />
        )}
        {view === 'register' && (
          <RegisterForm onLogin={onLogin} onBack={() => setView('login')} />
        )}
        {view === 'forgot' && (
          <ForgotForm onBack={() => setView('login')} />
        )}
      </div>
      <Footer />
    </div>
  )
}
