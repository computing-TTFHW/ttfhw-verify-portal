import { Terminal, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { cn } from '@/utils'
import { JsonObjectGrid, omitKeys } from '@/components/detail/RawJsonViewer'
import type { ExecutionLogEntry } from '@/types'

interface ExecutionLogCardProps {
  entries: ExecutionLogEntry[]
}

export function ExecutionLogCard({ entries }: ExecutionLogCardProps) {
  const parsed = entries
    .map((e: any) => ({ ...e, _ts: Date.parse(e.timestamp || '') }))
  const getDelta = (i: number): number => {
    if (i + 1 >= parsed.length) return 0
    const cur = parsed[i]._ts
    const nxt = parsed[i + 1]._ts
    if (!Number.isFinite(cur) || !Number.isFinite(nxt) || nxt <= cur) return 0
    return Math.round((nxt - cur) / 1000)
  }

  return (
    <Card>
      <SectionTitle icon={<Terminal className="w-5 h-5 text-purple-500" />}>
        执行日志 ({entries.length} 步)
      </SectionTitle>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {entries.map((log, i) => {
          const delta = getDelta(i)
          return (
            <div key={i} className={cn('p-3 rounded-lg border', log.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')}>
              <div className="flex items-center gap-2 text-sm">
                {log.success ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                <span className="font-medium">{log.step}</span>
                {delta > 0 && (
                  <span className="font-mono text-xs text-slate-400">{formatSeconds(delta)}</span>
                )}
                <span className="text-xs text-slate-400">{log.timestamp}</span>
              </div>
              {log.command && (
                <code className="text-xs bg-slate-900 text-slate-50 px-2 py-1.5 rounded mt-2 block overflow-x-auto whitespace-pre-wrap break-all">
                  {log.command}
                </code>
              )}
              {log.output && (
                <div className="text-sm text-slate-600 mt-1">{log.output}</div>
              )}
              {log.error && (
                <div className="text-sm text-red-600 mt-1 font-medium">错误: {log.error}</div>
              )}
              {log.note && (
                <div className="text-xs text-slate-500 mt-1 italic">{log.note}</div>
              )}
              <JsonObjectGrid
                data={omitKeys(log, ['timestamp', 'step', 'command', 'success', 'output', 'error', 'note'])}
                compact
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds)) return 'N/A'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}
