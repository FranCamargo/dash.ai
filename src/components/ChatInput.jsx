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

export default function ChatInput({ onSend, disabled, supportsImages = false }) {
  const { t } = useLanguage()
  const [value, setValue] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [attachmentError, setAttachmentError] = useState('')
  const fileRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const imageToSend = supportsImages ? selectedImage : null
    if ((!value.trim() && !imageToSend) || disabled) return

    let images = []
    if (imageToSend) {
      try {
        images = [await readFileAsBase64(imageToSend)]
      } catch (error) {
        console.error('Unable to read the selected image:', error)
        setAttachmentError(`${t('chatInput.imageReadError')} ${error.message}`)
        return
      }
    }

    onSend(value.trim() || t('chatInput.imagePrompt'), images, imageToSend?.name)
    setValue('')
    setSelectedImage(null)
    setAttachmentError('')
  }

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files?.[0] ?? null)
    setAttachmentError('')
    e.target.value = ''
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setAttachmentError('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e)
  }

  return (
    <form className="chat-input-bar" onSubmit={handleSubmit}>
      <div className={`chat-input-wrapper${selectedImage ? ' chat-input-wrapper--attachment' : ''}`}>
        {supportsImages && selectedImage && (
          <div className="chat-input__attachment">
            <span>{selectedImage.name}</span>
            <button type="button" onClick={handleRemoveImage} title={t('chatInput.removeImage')}>
              ×
            </button>
          </div>
        )}
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
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        <button
          className="chat-input__attach"
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || !supportsImages}
          title={supportsImages ? t('chatInput.attach') : t('chatInput.ollamaImagesOnly')}
        >
          <IconClip />
        </button>
        <button
          className="chat-input__send"
          type="submit"
          disabled={disabled || (!value.trim() && !(supportsImages && selectedImage))}
          title={t('chatInput.send')}
        >
          <IconSend />
        </button>
      </div>
      {attachmentError && <p className="chat-input__error" role="alert">{attachmentError}</p>}
    </form>
  )
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('The image file could not be read.'))
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('The image file could not be read.'))
        return
      }

      const base64 = reader.result.split(',')[1]
      if (!base64) {
        reject(new Error('The image file could not be converted.'))
        return
      }
      resolve(base64)
    }
    reader.readAsDataURL(file)
  })
}
