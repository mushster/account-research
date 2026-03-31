import SectionCard, { ConfidenceBadge } from './SectionCard'

function OnePager({ data }) {
  if (!data) return null

  // Handle raw response if parsing failed
  if (data.raw) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Raw Response</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-auto">
          {data.raw}
        </pre>
        {data.parse_error && (
          <p className="mt-4 text-sm text-red-600">Parse error: {data.parse_error}</p>
        )}
      </div>
    )
  }

  const { company_snapshot, pain_points, outreach_angles, objections, signals, draft_email } = data

  const formatSnapshotForCopy = () => {
    if (!company_snapshot) return ''
    return `Company: ${company_snapshot.name}
Industry: ${company_snapshot.industry || 'N/A'}
HQ: ${company_snapshot.hq || 'N/A'}
Size: ${company_snapshot.size || 'N/A'}
Funding: ${company_snapshot.funding_stage || 'N/A'}
Tech Stack: ${company_snapshot.tech_stack_signals?.join(', ') || 'N/A'}`
  }

  const formatPainPointsForCopy = () => {
    if (!pain_points?.length) return ''
    return pain_points.map(p => `- ${p.point} (${p.source}): ${p.evidence || ''}`).join('\n')
  }

  const formatOutreachAnglesForCopy = () => {
    if (!outreach_angles?.length) return ''
    return outreach_angles.map(a => `Hook: ${a.hook}\nReasoning: ${a.reasoning}`).join('\n\n')
  }

  const formatObjectionsForCopy = () => {
    if (!objections?.length) return ''
    return objections.map(o => `Objection: ${o.objection}\nRebuttal: ${o.rebuttal}`).join('\n\n')
  }

  const formatSignalsForCopy = () => {
    if (!signals?.length) return ''
    return signals.map(s => `- ${s.signal} (${s.date || 'No date'}): ${s.relevance || ''}`).join('\n')
  }

  const formatEmailForCopy = () => {
    if (!draft_email) return ''
    return `Subject: ${draft_email.subject}\n\n${draft_email.body}`
  }

  return (
    <div className="space-y-6">
      {/* Company Snapshot */}
      {company_snapshot && (
        <SectionCard title="Company Snapshot" copyText={formatSnapshotForCopy()}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium text-gray-900">{company_snapshot.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Industry</p>
              <p className="font-medium text-gray-900">{company_snapshot.industry || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Headquarters</p>
              <p className="font-medium text-gray-900">{company_snapshot.hq || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Company Size</p>
              <p className="font-medium text-gray-900">{company_snapshot.size || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Funding Stage</p>
              <p className="font-medium text-gray-900">{company_snapshot.funding_stage || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tech Stack Signals</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {company_snapshot.tech_stack_signals?.length > 0 ? (
                  company_snapshot.tech_stack_signals.map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Pain Points */}
      {pain_points?.length > 0 && (
        <SectionCard title="Pain Points" copyText={formatPainPointsForCopy()}>
          <ul className="space-y-3">
            {pain_points.map((point, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900">{point.point}</p>
                    <ConfidenceBadge source={point.source} />
                  </div>
                  {point.evidence && (
                    <p className="text-sm text-gray-600">{point.evidence}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Outreach Angles */}
      {outreach_angles?.length > 0 && (
        <SectionCard title="Outreach Angles" copyText={formatOutreachAnglesForCopy()}>
          <div className="space-y-4">
            {outreach_angles.map((angle, i) => (
              <div key={i} className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900 mb-1">"{angle.hook}"</p>
                <p className="text-sm text-green-700">{angle.reasoning}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Objections & Rebuttals */}
      {objections?.length > 0 && (
        <SectionCard title="Objections & Rebuttals" copyText={formatObjectionsForCopy()}>
          <div className="space-y-4">
            {objections.map((obj, i) => (
              <div key={i} className="border-l-4 border-orange-400 pl-4">
                <p className="font-medium text-gray-900 mb-1">
                  <span className="text-orange-600">Objection:</span> {obj.objection}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-green-600">Rebuttal:</span> {obj.rebuttal}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Recent Signals */}
      {signals?.length > 0 && (
        <SectionCard title="Recent Signals" copyText={formatSignalsForCopy()}>
          <ul className="space-y-3">
            {signals.map((signal, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-2 h-2 mt-2 bg-purple-500 rounded-full"></span>
                <div>
                  <p className="font-medium text-gray-900">{signal.signal}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {signal.date && (
                      <span className="text-xs text-gray-500">{signal.date}</span>
                    )}
                    {signal.relevance && (
                      <span className="text-xs text-purple-600">{signal.relevance}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Draft Email */}
      {draft_email && (
        <SectionCard title="Draft Outreach Email" copyText={formatEmailForCopy()}>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Subject Line</p>
              <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded">
                {draft_email.subject}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email Body</p>
              <div className="bg-gray-50 px-4 py-3 rounded whitespace-pre-wrap text-gray-800 text-sm">
                {draft_email.body}
              </div>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

export default OnePager
