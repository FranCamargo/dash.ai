import { useState, useEffect, useRef } from 'react'
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

const IconThumbUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
)

const IconThumbDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
)

const IconSend = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

export default function ChatMessage({ message, onRate, onComment }) {
  const { t } = useLanguage()
  const isUser = message.role === 'user'
  const [showComment, setShowComment] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showThanks, setShowThanks] = useState(false)
  const thanksTimer = useRef(null)

  useEffect(() => () => clearTimeout(thanksTimer.current), [])

  const handleRate = (liked) => {
    const newLiked = message.liked === liked ? null : liked
    onRate?.(message.id, newLiked)
    if (newLiked === null) {
      setShowComment(false)
    } else {
      setCommentText(message.comment || '')
      setShowComment(true)
    }
  }

  const handleSendComment = () => {
    onComment?.(message.id, commentText.trim())
    setShowComment(false)
    setShowThanks(true)
    thanksTimer.current = setTimeout(() => setShowThanks(false), 3000)
  }

  const handleCloseComment = () => {
    setShowComment(false)
  }

  if (isUser) {
    return (
      <div className="chat-message chat-message--user">
        <div className="chat-message__bubble chat-message__bubble--user">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="chat-message chat-message--bot">
      <BotAvatar />
      <div className="chat-message__bot-content">
        <div className="chat-message__bubble chat-message__bubble--bot">
          {message.content}
        </div>
        <div className="chat-message__rating">
          <button
            className={`rating-btn${message.liked === true ? ' rating-btn--liked' : ''}`}
            onClick={() => handleRate(true)}
            title={t('chatMessage.useful')}
          >
            <IconThumbUp />
          </button>
          <button
            className={`rating-btn${message.liked === false ? ' rating-btn--disliked' : ''}`}
            onClick={() => handleRate(false)}
            title={t('chatMessage.notUseful')}
          >
            <IconThumbDown />
          </button>
        </div>
        {showThanks && (
          <span className="comment-thanks">{t('chatMessage.thanks')}</span>
        )}
        {showComment && (
          <div className="comment-input-area">
            <input
              className="comment-input"
              type="text"
              placeholder={t('chatMessage.commentPlaceholder')}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendComment()}
              autoFocus
            />
            <button className="comment-send-btn" onClick={handleSendComment} title={t('chatMessage.send')}>
              <IconSend />
            </button>
            <button className="comment-close-btn" onClick={handleCloseComment} title={t('chatMessage.close')}>
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
