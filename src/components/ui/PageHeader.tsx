import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <header className={`mb-8 border-b border-slate-200 pb-5 ${className || ''}`}>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <div className="text-slate-500 mt-2">{subtitle}</div>}
    </header>
  )
}
