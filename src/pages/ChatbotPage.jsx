import { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLanguage } from '../i18n/LanguageContext'
import {
  setView,
  setMessages,
  addMessage,
  setIsTyping,
  setHistory,
  setActiveConvId,
  setModel,
  clearChat,
} from '../store/chatSlice'
import { MODELS } from '../components/ModelSelector'
import { sendOllamaMessage } from '../services/ollama'
import HomePage from './HomePage'
import ChatPage from './ChatPage'
import CuradoriaPage from './CuradoriaPage'
import '../styles/chatbot.css'

const BOT_RESPONSE_KEYS = {
  image: 'bot.image',
  text: 'bot.text',
  code: 'bot.code',
}

const FOLLOW_UP_KEYS = ['bot.followUp0', 'bot.followUp1', 'bot.followUp2']

let followUpIndex = 0

function getBotResponse(actionId, isFirstMessage, t) {
  if (isFirstMessage && actionId && BOT_RESPONSE_KEYS[actionId]) {
    return t(BOT_RESPONSE_KEYS[actionId])
  }
  if (isFirstMessage) {
    return t('bot.default')
  }
  const response = t(FOLLOW_UP_KEYS[followUpIndex % FOLLOW_UP_KEYS.length])
  followUpIndex++
  return response
}

export default function ChatbotPage({ user, onLogout }) {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const view = useSelector(state => state.chat.view)
  const messages = useSelector(state => state.chat.messages)
  const isTyping = useSelector(state => state.chat.isTyping)
  const history = useSelector(state => state.chat.history)
  const activeConvId = useSelector(state => state.chat.activeConvId)
  const selectedModel = useSelector(state => state.chat.selectedModel)

  useEffect(() => {
    localStorage.setItem('chatbot-history', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('chatbot-view', JSON.stringify(view))
    localStorage.setItem('chatbot-messages', JSON.stringify(messages))
    localStorage.setItem('chatbot-active-conv', JSON.stringify(activeConvId))
    localStorage.setItem('chatbot-model', JSON.stringify(selectedModel))
  }, [view, messages, activeConvId, selectedModel])

  const saveToHistory = useCallback((msgs, convId) => {
    if (!msgs || msgs.length === 0) return
    const firstUserMsg = msgs.find(m => m.role === 'user')
    const title = firstUserMsg ? firstUserMsg.content.slice(0, 60) : 'Conversa'
    const id = convId || `conv-${Date.now()}`
    const entry = { id, title, messages: msgs }
    dispatch(setHistory(
      [entry, ...history.filter(c => c.id !== id)]
    ))
  }, [dispatch, history])

  const addBotReply = useCallback((actionId, isFirstMessage, conversationMessages, modelId = selectedModel) => {
    dispatch(setIsTyping(true))
    const model = MODELS.find(m => m.id === modelId)
    const modelLabel = model?.label ?? 'Claude Sonnet'

    const respond = async () => {
      try {
        let content
        if (model?.provider === 'Ollama') {
          content = await sendOllamaMessage(modelId, conversationMessages)
        } else {
          await new Promise(resolve => setTimeout(resolve, 1600))
          content = getBotResponse(actionId, isFirstMessage, t)
        }
        dispatch(addMessage({ id: Date.now(), role: 'bot', content, model: modelLabel }))
      } catch (error) {
        console.error('Ollama chat request failed:', error)
        dispatch(addMessage({
          id: Date.now(),
          role: 'bot',
          content: `${t('bot.ollamaError')}\n${error.message}`,
          model: modelLabel,
        }))
      } finally {
        dispatch(setIsTyping(false))
      }
    }

    void respond()
  }, [dispatch, selectedModel, t])

  const startChat = useCallback((content, actionId, defaultModel) => {
    if (messages.length > 0) saveToHistory(messages, activeConvId)
    followUpIndex = 0
    const newId = `conv-${Date.now()}`
    const modelId = defaultModel || selectedModel
    dispatch(setActiveConvId(newId))
    if (defaultModel) dispatch(setModel(modelId))
    dispatch(setMessages([{ id: Date.now(), role: 'user', content }]))
    dispatch(setView('chat'))
    addBotReply(actionId, true, [{ role: 'user', content }], modelId)
  }, [dispatch, messages, activeConvId, saveToHistory, addBotReply, selectedModel])

  const handleSend = useCallback((content, images = [], attachmentName) => {
    const id = Date.now()
    const userMessage = {
      id,
      role: 'user',
      content,
      ...(attachmentName ? { attachment: attachmentName } : {}),
    }
    const conversationMessages = [
      ...messages.map(message => ({ role: message.role, content: message.content })),
      { role: 'user', content, ...(images.length ? { images } : {}) },
    ]
    dispatch(addMessage(userMessage))
    addBotReply(null, false, conversationMessages, selectedModel)
  }, [dispatch, addBotReply, messages, selectedModel])

  const handleNewChat = useCallback(() => {
    if (messages.length > 0) saveToHistory(messages, activeConvId)
    dispatch(clearChat())
    followUpIndex = 0
  }, [dispatch, messages, activeConvId, saveToHistory])

  const loadConversation = useCallback((convId) => {
    const conv = history.find(c => c.id === convId)
    if (!conv) return
    dispatch(setMessages(conv.messages))
    dispatch(setActiveConvId(convId))
    dispatch(setView('chat'))
    dispatch(setIsTyping(false))
    followUpIndex = 0
  }, [dispatch, history])

  const handleRate = useCallback((messageId, liked) => {
    dispatch(setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, liked } : msg
    )))
  }, [dispatch, messages])

  const handleComment = useCallback((messageId, comment) => {
    dispatch(setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, comment } : msg
    )))
  }, [dispatch, messages])

  const handleRemoveFeedback = useCallback((messageId) => {
    dispatch(setHistory(history.map(conv => ({
      ...conv,
      messages: conv.messages.map(msg =>
        msg.id === messageId ? { ...msg, liked: null, comment: undefined } : msg
      ),
    }))))
  }, [dispatch, history])

  const handleOpenCuradoria = useCallback(() => {
    if (messages.length > 0) saveToHistory(messages, activeConvId)
    dispatch(setView('curadoria'))
  }, [dispatch, messages, activeConvId, saveToHistory])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('chatbot-view')
    localStorage.removeItem('chatbot-messages')
    localStorage.removeItem('chatbot-active-conv')
    dispatch(clearChat())
    onLogout()
  }, [dispatch, onLogout])

  const isAdmin = user.name.trim().toLowerCase() === 'admin'

  const sharedProps = {
    user, onLogout: handleLogout, isAdmin, history, activeConvId,
    onLoadConversation: loadConversation,
    onGoHome: handleNewChat,
    onOpenCuradoria: handleOpenCuradoria,
    currentView: view,
  }

  if (view === 'chat') {
    return (
      <ChatPage
        {...sharedProps}
        messages={messages}
        isTyping={isTyping}
        onSend={handleSend}
        onNewChat={handleNewChat}
        onRate={handleRate}
        onComment={handleComment}
        selectedModel={selectedModel}
        onModelChange={(id) => dispatch(setModel(id))}
      />
    )
  }

  if (view === 'curadoria') {
    return <CuradoriaPage {...sharedProps} onRemoveFeedback={handleRemoveFeedback} />
  }

  return (
    <HomePage
      {...sharedProps}
      onStart={startChat}
      selectedModel={selectedModel}
      onModelChange={(id) => dispatch(setModel(id))}
    />
  )
}
