import { useLanguage } from '../i18n/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="app-footer">
      <span>{t('footer.createdBy')}</span>
      <a
        href="https://www.linkedin.com/in/francamargodev/"
        target="_blank"
        rel="noopener noreferrer"
        className="app-footer__link"
      >
        Fran Camargo
      </a>
    </footer>
  )
}
