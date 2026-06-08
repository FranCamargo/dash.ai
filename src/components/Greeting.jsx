import { useLanguage } from '../i18n/LanguageContext'

export default function Greeting({ userName }) {
  const { t } = useLanguage()
  const firstName = userName?.split(' ')[0] ?? ''

  return (
    <div className="greeting">
      <h1 className="greeting__title">
        {t('greeting.hello')} <span className="greeting__highlight">{firstName}!</span>
      </h1>
      <p className="greeting__subtitle">
        {t('greeting.subtitle')}
      </p>
    </div>
  )
}
