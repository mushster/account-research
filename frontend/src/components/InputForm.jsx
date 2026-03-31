import { useState } from 'react'

function InputForm({ onSubmit, loading }) {
  const [companyUrl, setCompanyUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [validationError, setValidationError] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setValidationError('')
    } else if (file) {
      setValidationError('Please upload a PDF file')
      setPdfFile(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate at least one input
    if (!companyUrl && !linkedinUrl && !companyName && !pdfFile) {
      setValidationError('Please provide at least one input')
      return
    }

    setValidationError('')

    const formData = new FormData()
    if (companyUrl) formData.append('company_url', companyUrl)
    if (linkedinUrl) formData.append('linkedin_url', linkedinUrl)
    if (companyName) formData.append('company_name', companyName)
    if (pdfFile) formData.append('pdf_file', pdfFile)

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-5">
        <div>
          <label htmlFor="companyUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Company Website URL
          </label>
          <input
            type="url"
            id="companyUrl"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn Company URL
          </label>
          <input
            type="url"
            id="linkedinUrl"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/company/example"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Corp"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-1">
            Upload PDF Document
          </label>
          <input
            type="file"
            id="pdfFile"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {pdfFile && (
            <p className="mt-1 text-sm text-gray-500">
              Selected: {pdfFile.name}
            </p>
          )}
        </div>

        {validationError && (
          <p className="text-red-600 text-sm">{validationError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate One-Pager'
          )}
        </button>
      </div>
    </form>
  )
}

export default InputForm
