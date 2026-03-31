import CopyButton from './CopyButton'

function SectionCard({ title, children, copyText }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {copyText && <CopyButton text={copyText} />}
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  )
}

export function ConfidenceBadge({ source }) {
  const isSourced = source === 'sourced'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
      isSourced
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800'
    }`}>
      {isSourced ? 'Sourced' : 'Inferred'}
    </span>
  )
}

export default SectionCard
