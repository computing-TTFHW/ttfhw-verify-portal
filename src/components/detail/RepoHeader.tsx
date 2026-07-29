import { Clock } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import type { ReportMetadata, ResultStatus } from '@/types'

interface RepoHeaderProps {
  displayName: string
  url?: string
  result: ResultStatus
  metadata?: ReportMetadata
  totalDuration: number
}

export function RepoHeader({ displayName, url, result, metadata, totalDuration }: RepoHeaderProps) {
  const durationMinutes = Math.round(totalDuration / 60)

  return (
    <header className="border-b border-slate-200 pb-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {displayName}
          </h1>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block">
              {url}
            </a>
          )}
        </div>
        <StatusBadge result={result} size="lg" />
      </div>
      {metadata && (
        <div className="mt-3 text-sm text-slate-500 flex gap-4">
          <span><Clock className="w-4 h-4 inline mr-1" />{metadata.start_time} → {metadata.end_time}</span>
          <span>耗时: {durationMinutes} 分钟</span>
          {metadata.total_steps && <span>步骤: {metadata.total_steps}</span>}
        </div>
      )}
    </header>
  )
}
