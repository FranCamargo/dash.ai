const OLLAMA_BASE_URL = (import.meta.env.VITE_OLLAMA_BASE_URL || '/ollama').replace(/\/$/, '')

export async function sendOllamaMessage(model, messages) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: messages.map(({ role, content, images }) => ({
        role: role === 'bot' ? 'assistant' : role,
        content,
        ...(images?.length ? { images } : {}),
      })),
      stream: false,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || `Ollama request failed (${response.status}).`)
  }

  const content = data.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Ollama returned an empty response.')
  }

  return content
}
