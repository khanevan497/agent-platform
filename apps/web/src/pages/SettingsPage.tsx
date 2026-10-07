import { getUser } from '../store/auth'

export default function SettingsPage() {
  const user = getUser()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            {[
              { label: 'Name', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Role', value: user?.role },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Platform</h2>
          <div className="space-y-3">
            {[
              { label: 'LLM Provider', value: 'Anthropic (Claude)' },
              { label: 'Default Model', value: 'claude-sonnet-4-6' },
              { label: 'Version', value: '1.0.0-mvp' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm font-medium text-amber-800 mb-1">API Key Required</p>
          <p className="text-sm text-amber-700">
            Set <code className="font-mono bg-amber-100 px-1 rounded">ANTHROPIC_API_KEY</code> in the <code className="font-mono bg-amber-100 px-1 rounded">.env</code> file to enable agent execution.
          </p>
        </div>
      </div>
    </div>
  )
}
