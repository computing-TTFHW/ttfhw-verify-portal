import { FileSearch, Clock, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import type { DocumentationGapItem } from '@/types'

interface DocGapListProps {
  gaps: DocumentationGapItem[]
}

export function DocGapList({ gaps }: DocGapListProps) {
  return (
    <Card>
      <SectionTitle icon={<FileSearch className="w-5 h-5" />} className="text-orange-600">
        文档缺失 ({gaps.length})
      </SectionTitle>
      <div className="space-y-4">
        {gaps.map((gap, i) => <DocumentationGapCard key={i} gap={gap} index={i} />)}
      </div>
    </Card>
  )
}

function DocumentationGapCard({ gap, index }: { gap: DocumentationGapItem; index: number }) {
  if (typeof gap === 'string') {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 grid place-items-center w-6 h-6 rounded-full bg-orange-200 text-xs font-bold text-orange-700">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="font-medium text-slate-200">文档缺失 #{index + 1}</h3>
            <p className="mt-2 text-sm text-slate-400 whitespace-pre-wrap break-words leading-relaxed">{gap}</p>
          </div>
        </div>
      </div>
    )
  }

  const gapObj = gap as any
  const title = gapObj.title ||
    (gapObj.body ? gapObj.body.slice(0, 100) + (gapObj.body.length > 100 ? '…' : '') : undefined) ||
    gapObj.gap || gapObj.item || gapObj.issue || gapObj.problem || gapObj.description || `文档缺失 #${index + 1}`

  const timeStr = gapObj.time && gapObj.time !== 'unknown' && gapObj.time !== '' ? gapObj.time : undefined

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 grid place-items-center w-6 h-6 rounded-full bg-orange-200 text-xs font-bold text-orange-700">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <h3 className="font-semibold text-slate-100 leading-6 break-words">{title}</h3>

          {(timeStr || gapObj.source) && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              {timeStr && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-slate-400">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(timeStr)}
                </span>
              )}
              {gapObj.source && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-slate-400 max-w-full">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="truncate">{gapObj.source.length > 80 ? gapObj.source.slice(0, 80) + '…' : gapObj.source}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {gapObj.body && (
        <div className="mt-3 ml-9">
          <div className="rounded-lg border border-orange-200/30 bg-orange-300/[0.06] p-3 text-sm text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
            {gapObj.body}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ts
    return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  } catch {
    return ts
  }
}
