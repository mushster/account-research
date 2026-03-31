const API_BASE_URL = 'http://localhost:8000'

/**
 * Post research request and handle SSE streaming response.
 *
 * @param {FormData} formData - Form data with research inputs
 * @param {Object} callbacks - Callback functions for SSE events
 * @param {Function} callbacks.onStatus - Called on status updates
 * @param {Function} callbacks.onComplete - Called when research is complete
 * @param {Function} callbacks.onError - Called on errors
 */
export async function postResearch(formData, { onStatus, onComplete, onError }) {
  try {
    const response = await fetch(`${API_BASE_URL}/research`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process complete SSE events
      const lines = buffer.split('\n')
      buffer = ''

      let eventType = null
      let eventData = null

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim()
        } else if (line.startsWith('data: ')) {
          eventData = line.slice(6).trim()
        } else if (line === '' && eventType && eventData) {
          // End of event, process it
          try {
            const data = JSON.parse(eventData)

            switch (eventType) {
              case 'status':
                onStatus?.(data)
                break
              case 'complete':
                onComplete?.(data.data || data)
                break
              case 'error':
                onError?.(new Error(data.message || 'Unknown error'))
                break
              case 'chunk':
                // Streaming text chunks - can be used for real-time display
                break
            }
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError, eventData)
          }

          eventType = null
          eventData = null
        } else if (line !== '') {
          // Incomplete event, keep in buffer
          buffer += line + '\n'
        }
      }
    }
  } catch (error) {
    onError?.(error)
    throw error
  }
}

/**
 * Health check for the API.
 *
 * @returns {Promise<boolean>} True if API is healthy
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}
