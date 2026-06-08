import { useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

const IconSend = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const IconClip = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
)

export default function ChatInput({ onSend, disabled }) {
  const { t } = useLanguage()
  const [value, setValue] = useState('')
  const fileRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      onSend(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e)
  }

  return (
    <form className="chat-input-bar" onSubmit={handleSubmit}>
      <div className="chat-input-wrapper">
        <textarea
          className="chat-input__field"
          rows={5}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chatInput.placeholder')}
          disabled={disabled}
          autoFocus
        />
      </div>

      <div className="chat-input__actions">
        <input ref={fileRef} type="file" style={{ display: 'none' }} />
        <button
          className="chat-input__attach"
          type="button"
          onClick={() => fileRef.current?.click()}
          title={t('chatInput.attach')}
        >
          <IconClip />
        </button>
        <button
          className="chat-input__send"
          type="submit"
          disabled={disabled || !value.trim()}
          title={t('chatInput.send')}
        >
          <IconSend />
        </button>
      </div>
    </form>
  )
}
