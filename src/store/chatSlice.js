import { createSlice } from '@reduxjs/toolkit'

function readStorage(key, fallback) {
  try {
    const s = localStorage.getItem(key)
    return s !== null ? JSON.parse(s) : fallback
  } catch {
    return fallback
  }
}

function readSelectedModel() {
  const savedModel = readStorage('chatbot-model', null)
  return savedModel === 'lfm3-vl:latest' ? savedModel : 'qwen3.5:4b'
}

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    view: readStorage('chatbot-view', 'home'),
    messages: readStorage('chatbot-messages', []),
    isTyping: false,
    history: readStorage('chatbot-history', []),
    activeConvId: readStorage('chatbot-active-conv', null),
    selectedModel: readSelectedModel(),
  },
  reducers: {
    setView(state, action) {
      state.view = action.payload
    },
    setMessages(state, action) {
      state.messages = action.payload
    },
    addMessage(state, action) {
      state.messages.push(action.payload)
    },
    setIsTyping(state, action) {
      state.isTyping = action.payload
    },
    setHistory(state, action) {
      state.history = action.payload
    },
    setActiveConvId(state, action) {
      state.activeConvId = action.payload
    },
    setModel(state, action) {
      state.selectedModel = action.payload
    },
    clearChat(state) {
      state.view = 'home'
      state.messages = []
      state.isTyping = false
      state.activeConvId = null
    },
  },
})

export const {
  setView,
  setMessages,
  addMessage,
  setIsTyping,
  setHistory,
  setActiveConvId,
  setModel,
  clearChat,
} = chatSlice.actions

export default chatSlice.reducer
