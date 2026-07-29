import { cn } from '@/utils'

interface BadgeProps {
  status: boolean | string
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ status, label, size = 'sm', className }: BadgeProps) {
  const statusKey = typeof status === 'boolean' ? (status ? 'success' : 'failed') : status
  const displayLabel = label || (typeof status === 'string' ? statusLabel(status) : (status ? '✓' : '✗'))

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  const colorClasses = badgeColor(statusKey)

  return (
    <span className={cn(
      'inline-flex items-center rounded font-medium whitespace-nowrap',
      sizeClasses[size],
      colorClasses,
      className
    )}>
      {displayLabel}
    </span>
  )
}

interface StatusBadgeProps {
  result: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusBadge({ result, size = 'md', className }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded font-medium whitespace-nowrap',
      sizeClasses[size],
      badgeColor(result, true),
      className
    )}>
      {statusLabel(result)}
    </span>
  )
}

function statusLabel(status: string): string {
  switch (status) {
    case 'success': return '成功'
    case 'failed': return '失败'
    case 'partial_success': return '部分成功'
    case 'skipped': return '跳过'
    case 'not_run': return '未运行'
    case 'timeout': return '超时'
    default: return '未知'
  }
}

function badgeColor(status: string, solid = false): string {
  const opacity = solid ? '25' : '15'
  const borderOpacity = solid ? '30' : '20'
  switch (status) {
    case 'success': return `bg-sky-500/${opacity} text-sky-300 border border-sky-400/${borderOpacity}`
    case 'failed': return `bg-rose-500/${opacity} text-rose-300 border border-rose-400/${borderOpacity}`
    case 'partial_success': return `bg-purple-500/${opacity} text-purple-300 border border-purple-400/${borderOpacity}`
    case 'timeout': return `bg-orange-500/${opacity} text-orange-300 border border-orange-400/${borderOpacity}`
    case 'skipped':
    case 'not_run':
    case 'unknown':
    default: return `bg-slate-500/${opacity} text-slate-400 border border-slate-400/${borderOpacity}`
  }
}
