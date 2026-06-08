import { useLanguage } from '../i18n/LanguageContext'
import QuickActionCard from './QuickActionCard'

const IconImage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const IconText = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </svg>
)

const IconCode = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const ACTION_DEFS = [
  { id: 'image', icon: <IconImage />, titleKey: 'quickActions.imageTitle', descKey: 'quickActions.imageDesc', defaultModel: 'gemini-2.0-flash' },
  { id: 'text',  icon: <IconText />,  titleKey: 'quickActions.textTitle',  descKey: 'quickActions.textDesc',  defaultModel: 'gpt-5.1' },
  { id: 'code',  icon: <IconCode />,  titleKey: 'quickActions.codeTitle',  descKey: 'quickActions.codeDesc',  defaultModel: 'claude-opus-4-8' },
]

export default function QuickActions({ onActionSelect }) {
  const { t } = useLanguage()

  return (
    <div className="quick-actions-wrap">
      <div className="quick-actions-header">
        <span className="quick-actions-header__title">{t('quickActions.label')}</span>
        <span className="quick-actions-header__sub">{t('quickActions.labelSub')}</span>
      </div>
      <section className="quick-actions">
        {ACTION_DEFS.map((action) => (
          <QuickActionCard
            key={action.id}
            icon={action.icon}
            title={t(action.titleKey)}
            description={t(action.descKey)}
            onClick={() => onActionSelect?.(action.id, action.defaultModel)}
          />
        ))}
      </section>
    </div>
  )
}
