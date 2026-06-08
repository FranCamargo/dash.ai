import { useSelector, useDispatch } from 'react-redux'
import { login, logout } from './store/authSlice'
import { LanguageProvider } from './i18n/LanguageContext'
import LoginPage from './pages/LoginPage'
import ChatbotPage from './pages/ChatbotPage'

function AppInner() {
  const user = useSelector(state => state.auth.user)
  const dispatch = useDispatch()

  if (!user) return <LoginPage onLogin={u => dispatch(login(u))} />
  return <ChatbotPage user={user} onLogout={() => dispatch(logout())} />
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}
