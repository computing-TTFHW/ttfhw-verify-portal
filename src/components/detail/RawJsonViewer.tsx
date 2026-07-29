import { FileSearch } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'

interface RawJsonViewerProps {
  value: any
  defaultOpen?: boolean
}

export function RawJsonViewer({ value, defaultOpen = false }: RawJsonViewerProps) {
  return (
    <Card>
      <SectionTitle icon={<FileSearch className="w-5 h-5 text-slate-500" />}>
        完整 JSON 数据
      </SectionTitle>
      <JsonRenderer value={value} defaultOpen={defaultOpen} />
    </Card>
  )
}

export function JsonRenderer({ value, defaultOpen = false }: RawJsonViewerProps) {
  if (value === null) return <span className="text-slate-400">null</span>
  if (value === undefined) return <span className="text-slate-400">undefined</span>

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-400">[]</span>

    return (
      <ol className="space-y-2">
        {value.map((item, index) => (
          <li key={index} className="rounded border border-slate-200 bg-white p-2">
            <div className="mb-1 text-xs font-medium text-slate-400">#{index + 1}</div>
            <JsonRenderer value={item} defaultOpen={defaultOpen} />
          </li>
        ))}
      </ol>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)
    if (entries.length === 0) return <span className="text-slate-400">{'{}'}</span>

    return (
      <details open={defaultOpen} className="rounded border border-slate-200 bg-slate-50 p-2">
        <summary className="cursor-pointer text-xs font-medium text-slate-500">
          {entries.length} 个字段
        </summary>
        <div className="mt-2 space-y-2">
          {entries.map(([key, nestedValue]) => (
            <div key={key}>
              <div className="mb-1 font-medium text-slate-600">{key}</div>
              <JsonRenderer value={nestedValue} defaultOpen={defaultOpen} />
            </div>
          ))}
        </div>
      </details>
    )
  }

  if (typeof value === 'boolean') {
    return <span className={value ? 'text-green-700' : 'text-red-700'}>{String(value)}</span>
  }

  if (typeof value === 'number') {
    return <span className="font-mono text-slate-800">{value}</span>
  }

  return (
    <span className="whitespace-pre-wrap break-words text-slate-800">
      {String(value)}
    </span>
  )
}

export function JsonObjectGrid({ data, compact = false }: { data?: any; compact?: boolean }) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) return null

  return (
    <div className={compact ? 'mt-2 space-y-2 text-xs' : 'space-y-3 text-sm'}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="min-w-0">
          <div className="mb-1 font-medium text-slate-600">{key}</div>
          <JsonRenderer value={value} />
        </div>
      ))}
    </div>
  )
}

export function omitKeys(value: any, keys: string[]): Record<string, any> {
  if (!value || typeof value !== 'object') return {}
  const omitted = new Set(keys)
  return Object.fromEntries(Object.entries(value).filter(([key, nestedValue]) => {
    if (omitted.has(key)) return false
    return nestedValue !== undefined && nestedValue !== null && nestedValue !== ''
  }))
}
