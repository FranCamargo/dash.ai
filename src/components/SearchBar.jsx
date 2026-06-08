import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

export default function SearchBar({ onSubmit }) {
  const { t } = useLanguage()
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim() && onSubmit) {
      onSubmit(value.trim())
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        className="search-bar__input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('searchBar.placeholder')}
        autoFocus
      />
      <button className="search-bar__button" type="submit">
        <IconSend />
        {t('searchBar.submit')}
      </button>
    </form>
  )
}
