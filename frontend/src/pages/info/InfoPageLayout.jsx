export function InfoSection({ title, body }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 leading-relaxed">{body}</p>
    </div>
  )
}

export function InfoPage({ icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6 divide-y divide-gray-100">
        {children}
      </div>
    </div>
  )
}
