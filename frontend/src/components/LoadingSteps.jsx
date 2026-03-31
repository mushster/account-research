const STEP_LABELS = {
  1: 'Scraping website',
  2: 'Scraping LinkedIn',
  3: 'Processing document',
  4: 'Fetching news',
  5: 'Generating one-pager'
}

function LoadingSteps({ steps }) {
  const getStepStatus = (stepNumber) => {
    const step = steps.find(s => s.step === stepNumber)
    if (!step) return 'pending'
    if (step.complete) return 'complete'
    if (step.skipped) return 'skipped'
    return 'active'
  }

  const getStepMessage = (stepNumber) => {
    const step = steps.find(s => s.step === stepNumber)
    return step?.message || STEP_LABELS[stepNumber]
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((stepNumber) => {
          const status = getStepStatus(stepNumber)
          const message = getStepMessage(stepNumber)

          return (
            <div key={stepNumber} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {status === 'complete' && (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {status === 'active' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="animate-spin w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {status === 'skipped' && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </div>
                )}
                {status === 'pending' && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                )}
              </div>
              <span className={`text-sm ${
                status === 'complete' ? 'text-green-700' :
                status === 'active' ? 'text-blue-700 font-medium' :
                status === 'skipped' ? 'text-gray-400' :
                'text-gray-500'
              }`}>
                {message}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LoadingSteps
