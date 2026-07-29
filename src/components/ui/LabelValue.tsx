import type { ReactNode } from 'react'

interface LabelValueProps {
  label: string
  value?: ReactNode
  className?: string
}

export function LabelValue({ label, value, className }: LabelValueProps) {
  return (
    <div className={className}>
      <div className="mb-1 text-xs font-medium text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-800">
        {value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
          ? <span className="text-slate-400">—</span>
          : value}
      </div>
    </div>
  )
}
