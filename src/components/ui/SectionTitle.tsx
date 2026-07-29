import type { ReactNode } from 'react'
import { cn } from '@/utils'

interface SectionTitleProps {
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionTitle({ icon, children, className }: SectionTitleProps) {
  return (
    <h2 className={cn('font-semibold text-lg mb-4 flex items-center gap-2', className)}>
      {icon}
      {children}
    </h2>
  )
}
