import { cn } from '@/utils'
import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  color?: 'default' | 'green' | 'red' | 'yellow' | 'blue' | 'orange'
  className?: string
}

export function StatCard({ label, value, icon, color = 'default', className }: StatCardProps) {
  const iconColorClasses = {
    default: 'text-slate-400',
    green: 'text-emerald-500',
    red: 'text-red-500',
    yellow: 'text-amber-500',
    blue: 'text-blue-500',
    orange: 'text-orange-500',
  }

  return (
    <div className={cn(
      'rounded-lg border border-slate-200 bg-white p-3 sm:p-4 flex items-center justify-between gap-3 min-w-0 shadow-sm',
      className
    )}>
      <div className="min-w-0">
        <div className="text-xs sm:text-sm text-slate-500 truncate">{label}</div>
        {typeof value === 'string' || typeof value === 'number' ? (
          <div className="text-xl sm:text-2xl font-semibold text-slate-900 truncate">{value}</div>
        ) : (
          <div className="text-xl sm:text-2xl font-semibold text-slate-900">{value}</div>
        )}
      </div>
      {icon && (
        <div className={cn('shrink-0 scale-75 sm:scale-100 origin-right', iconColorClasses[color])}>{icon}</div>
      )}
    </div>
  )
}
