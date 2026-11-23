import { useEffect, useRef } from 'react'
import Sidebar from '../components/sidebar'
import TopBar from '../components/TopBar'
import ChatMessage from '../components/ChatMessage'
import TypingIndicator from '../components/TypingIndicator'
import ChatInput from '../components/ChatInput'
import ModelSelector, { MODELS } from '../components/ModelSelector'
import Footer from '../components/Footer'

export default function ChatPage({ user, onLogout, isAdmin, history, activeConvId, onLoadConversation, onGoHome, onOpenCuradoria, currentView, messages, isTyping, onSend, onNewChat, onRate, onComment, selectedModel, onModelChange }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="chatbot-layout page-enter">
      <Sidebar history={history} activeConvId={activeConvId} onLoadConversation={onLoadConversation} onGoHome={onGoHome} onOpenCuradoria={onOpenCuradoria} currentView={currentView} isAdmin={isAdmin} />
      <main className="chatbot-main">
        <TopBar user={user} onLogout={onLogout} onNewChat={onNewChat} />
        <div className="chat-messages">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onRate={onRate} onComment={onComment} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-area">
          <ModelSelector value={selectedModel} onChange={onModelChange} />
          <ChatInput
            onSend={onSend}
            disabled={isTyping}
            supportsImages={MODELS.find(model => model.id === selectedModel)?.supportsImages}
          />
        </div>
        <Footer />
      </main>
    </div>
  )
}
