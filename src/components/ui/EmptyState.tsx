import { cn } from '@/utils'

interface EmptyStateProps {
  text?: string
  className?: string
}

export function EmptyState({ text = '—', className }: EmptyStateProps) {
  return <span className={cn('text-slate-400', className)}>{text}</span>
}
