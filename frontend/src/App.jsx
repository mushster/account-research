import { useState } from 'react'
import InputForm from './components/InputForm'
import OnePager from './components/OnePager'
import LoadingSteps from './components/LoadingSteps'
import { postResearch } from './utils/api'

function App() {
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [streamingText, setStreamingText] = useState('')
  const [tokenCount, setTokenCount] = useState(0)
  const [tokenInfo, setTokenInfo] = useState(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setSteps([])
    setResult(null)
    setError(null)
    setStreamingText('')
    setTokenCount(0)
    setTokenInfo(null)

    try {
      await postResearch(formData, {
        onStatus: (status) => {
          setSteps((prev) => {
            const newSteps = [...prev]
            const existingIndex = newSteps.findIndex(s => s.step === status.step)
            if (existingIndex >= 0) {
              newSteps[existingIndex] = status
            } else {
              newSteps.push(status)
            }
            return newSteps
          })
        },
        onChunk: (text) => {
          setStreamingText((prev) => prev + text)
          // Rough token estimate (1 token ≈ 4 chars)
          setTokenCount((prev) => prev + Math.ceil(text.length / 4))
        },
        onComplete: (data) => {
          setResult(data.data || data)
          if (data.tokens) {
            setTokenInfo(data.tokens)
          }
          setLoading(false)
        },
        onError: (err) => {
          setError(err.message || 'An error occurred')
          setLoading(false)
        }
      })
    } catch (err) {
      setError(err.message || 'Failed to connect to server')
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setSteps([])
    setError(null)
    setStreamingText('')
    setTokenCount(0)
    setTokenInfo(null)
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Research Co-Pilot
          </h1>
          <p className="text-gray-600">
            Generate B2B sales one-pagers in under 60 seconds
          </p>
        </header>

        {!result ? (
          <>
            <InputForm onSubmit={handleSubmit} loading={loading} />

            {loading && (
              <div className="mt-8">
                <LoadingSteps
                  steps={steps}
                  streamingText={streamingText}
                  tokenCount={tokenCount}
                />
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Research Results
                </h2>
                {tokenInfo && (
                  <p className="text-sm text-gray-500 mt-1">
                    {tokenInfo.input?.toLocaleString()} input + {tokenInfo.output?.toLocaleString()} output tokens = ${tokenInfo.cost}
                  </p>
                )}
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                New Research
              </button>
            </div>
            <OnePager data={result} />
          </>
        )}
      </div>
    </div>
  )
}

export default App
