import { createSlice } from '@reduxjs/toolkit'

const USER_KEY = 'chatbot-user'

function loadUser() {
  try {
    const s = localStorage.getItem(USER_KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: loadUser() },
  reducers: {
    login(state, action) {
      state.user = action.payload
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload))
    },
    logout(state) {
      state.user = null
      localStorage.removeItem(USER_KEY)
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
