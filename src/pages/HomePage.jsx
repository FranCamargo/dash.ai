import { useLanguage } from '../i18n/LanguageContext'
import Sidebar from '../components/sidebar'
import TopBar from '../components/TopBar'
import Greeting from '../components/Greeting'
import SearchBar from '../components/SearchBar'
import QuickActions from '../components/QuickActions'
import ModelSelector from '../components/ModelSelector'

export default function HomePage({ user, onLogout, isAdmin, history, activeConvId, onLoadConversation, onGoHome, onOpenCuradoria, currentView, onStart, selectedModel, onModelChange }) {
  const { t } = useLanguage()

  const handleSearch = (query) => onStart(query, null, null)

  const handleActionSelect = (actionId, defaultModel) => {
    const messageMap = {
      image: t('homePage.actionImage'),
      text: t('homePage.actionText'),
      code: t('homePage.actionCode'),
    }
    const message = messageMap[actionId] ?? t('homePage.actionDefault')
    onStart(message, actionId, defaultModel)
  }

  return (
    <div className="chatbot-layout page-enter">
      <Sidebar history={history} activeConvId={activeConvId} onLoadConversation={onLoadConversation} onGoHome={onGoHome} onOpenCuradoria={onOpenCuradoria} currentView={currentView} isAdmin={isAdmin} />
      <main className="chatbot-main">
        <TopBar user={user} onLogout={onLogout} />
        <section className="chatbot-hero">
          <Greeting userName={user.name} />
          <div className="search-wrap">
            <SearchBar onSubmit={handleSearch} />
            <ModelSelector value={selectedModel} onChange={onModelChange} />
          </div>
        </section>
        <QuickActions onActionSelect={handleActionSelect} />
      </main>
    </div>
  )
}
