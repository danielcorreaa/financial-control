interface Props {
  label: string
  value: string
  gradient: string   // ex: 'from-violet-500 to-indigo-600'
  icon?: React.ReactNode
  sub?: string
}

export default function StatCard({ label, value, gradient, icon, sub }: Props) {
  return (
    <div className={`rounded-2xl p-5 text-white bg-gradient-to-br ${gradient} shadow-lg`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">{label}</p>
          <p className="text-2xl font-bold truncate">{value}</p>
          {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
