const STEP_LABELS = {
  1: 'Scraping website',
  2: 'Scraping LinkedIn',
  3: 'Processing document',
  4: 'Fetching news',
  5: 'Generating one-pager'
}

const TOTAL_STEPS = 5

function LoadingSteps({ steps, streamingText, tokenCount }) {
  // Calculate progress percentage
  const completedSteps = steps.filter(s => s.complete || s.skipped).length
  const hasActiveStep = steps.some(s => !s.complete && !s.skipped)
  const progress = Math.min(
    ((completedSteps + (hasActiveStep ? 0.5 : 0)) / TOTAL_STEPS) * 100,
    100
  )

  // Get current active step
  const activeStep = steps.find(s => !s.complete && !s.skipped)
  const currentMessage = activeStep?.message || 'Initializing...'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Stage */}
      <div className="flex items-center space-x-2 mb-4">
        <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm text-gray-600">{currentMessage}</span>
      </div>

      {/* Completed Steps Summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        {steps.map((step, i) => (
          <span
            key={i}
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              step.complete
                ? 'bg-green-100 text-green-700'
                : step.skipped
                ? 'bg-gray-100 text-gray-500'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {step.complete && (
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {step.skipped && (
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
            )}
            {STEP_LABELS[step.step] || `Step ${step.step}`}
          </span>
        ))}
      </div>

      {/* Thinking Output */}
      {streamingText && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              AI Thinking
            </span>
            {tokenCount > 0 && (
              <span className="text-xs text-gray-400">
                {tokenCount.toLocaleString()} tokens
              </span>
            )}
          </div>
          <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words">
              {streamingText}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoadingSteps
