import { useLanguage } from '../i18n/LanguageContext'

const BotAvatar = () => (
  <div className="chat-message__avatar">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
    </svg>
  </div>
)

export default function TypingIndicator() {
  const { t } = useLanguage()

  return (
    <div className="chat-message chat-message--bot">
      <BotAvatar />
      <div className="chat-message__bubble chat-message__bubble--bot typing-indicator">
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__text">{t('chat.typing')}</span>
      </div>
    </div>
  )
}
