import { BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { JsonRenderer, JsonObjectGrid } from '@/components/detail/RawJsonViewer'
import type { DocumentReadingSummary } from '@/types'

interface DocSummaryViewProps {
  data: DocumentReadingSummary
}

const DOC_FIELD_LABELS: Record<string, string> = {
  architecture: '架构',
  recommended_image: '推荐镜像',
  os_selection: '系统选择',
  os_support: '系统支持',
  dockerfile_dependencies: 'Dockerfile依赖',
  dependencies: '依赖',
  explicit_dependencies: '显式依赖',
  special_dependencies: '特殊依赖',
  build_commands: '构建命令',
  build_entry: '构建入口',
  ut_commands: 'UT 命令',
  ut_entry: 'UT 入口',
  st_commands: 'ST 命令',
  sample_commands: '示例命令',
  cann_prerequisite: 'CANN 前置条件',
}

const DOC_FIELD_ORDER = [
  'architecture',
  'recommended_image',
  'os_selection',
  'os_support',
  'cann_prerequisite',
  'dockerfile_dependencies',
  'dependencies',
  'explicit_dependencies',
  'special_dependencies',
  'build_commands',
  'build_entry',
  'ut_commands',
  'ut_entry',
  'st_commands',
  'sample_commands',
]

const DOC_COMMAND_FIELDS = new Set([
  'build_commands',
  'build_entry',
  'ut_commands',
  'ut_entry',
  'st_commands',
  'sample_commands',
])

export function DocSummaryView({ data }: DocSummaryViewProps) {
  const records = data as unknown as Record<string, any>

  const orderedKeys = [
    ...DOC_FIELD_ORDER.filter(key => records[key] !== undefined && records[key] !== null),
    ...Object.keys(records).filter(key => !DOC_FIELD_ORDER.includes(key)),
  ]

  const environmentKeys = orderedKeys.filter(key => ['architecture', 'recommended_image', 'os_selection', 'os_support', 'cann_prerequisite'].includes(key))
  const dependencyKeys = orderedKeys.filter(key => ['dockerfile_dependencies', 'dependencies', 'explicit_dependencies', 'special_dependencies'].includes(key))
  const commandKeys = orderedKeys.filter(key => DOC_COMMAND_FIELDS.has(key))
  const otherKeys = orderedKeys.filter(key => !environmentKeys.includes(key) && !dependencyKeys.includes(key) && !commandKeys.includes(key))

  return (
    <Card>
      <SectionTitle icon={<BookOpen className="w-5 h-5 text-green-500" />}>
        文档阅读摘要
      </SectionTitle>
      <div className="space-y-5">
        {environmentKeys.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {environmentKeys.map(key => (
              <DocSummaryTile key={key} label={DOC_FIELD_LABELS[key] || key} item={records[key]} />
            ))}
          </div>
        )}

        {dependencyKeys.map(key => (
          <DocSummarySection key={key} title={DOC_FIELD_LABELS[key] || key} item={records[key]} />
        ))}

        {commandKeys.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">命令与入口</h3>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {commandKeys.map(key => (
                <DocCommandItem key={key} label={DOC_FIELD_LABELS[key] || key} item={records[key]} />
              ))}
            </div>
          </div>
        )}

        {otherKeys.length > 0 && (
          <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer text-sm font-medium text-slate-600">
              其他文档字段 ({otherKeys.length})
            </summary>
            <div className="mt-3">
              <JsonObjectGrid data={Object.fromEntries(otherKeys.map(key => [key, records[key]]))} compact />
            </div>
          </details>
        )}
      </div>
    </Card>
  )
}

function DocSummaryTile({ label, item }: { label: string; item: any }) {
  const source = getDocSource(item)
  const value = getDocValue(item)

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">
        <DocValue value={value} />
      </div>
      {source && <SourceBadge source={source} />}
    </div>
  )
}

function DocSummarySection({ title, item }: { title: string; item: any }) {
  const source = getDocSource(item)
  const value = getDocValue(item)

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {source && <SourceBadge source={source} inline />}
      </div>
      <DocValue value={value} />
    </div>
  )
}

function DocCommandItem({ label, item }: { label: string; item: any }) {
  const source = getDocSource(item)
  const value = getDocValue(item)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {source && <SourceBadge source={source} inline />}
      </div>
      <DocValue value={value} code />
    </div>
  )
}

function DocValue({ value, code = false }: { value: any; code?: boolean }) {
  if (value === undefined || value === null || value === '') {
    return <span className="text-sm text-slate-400">未提供</span>
  }

  if (Array.isArray(value)) {
    return (
      <ul className="grid grid-cols-1 gap-1.5 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-3">
        {value.map((item, index) => (
          <li key={index} className="rounded border border-slate-200 bg-white px-2 py-1.5">
            {String(item)}
          </li>
        ))}
      </ul>
    )
  }

  if (typeof value === 'object') {
    return <JsonRenderer value={value} />
  }

  if (code) {
    return (
      <code className="block overflow-x-auto whitespace-pre-wrap break-words rounded bg-slate-900 px-3 py-2 text-xs leading-5 text-slate-50">
        {String(value)}
      </code>
    )
  }

  return <span className="whitespace-pre-wrap break-words text-sm text-slate-800">{String(value)}</span>
}

function SourceBadge({ source, inline = false }: { source: string; inline?: boolean }) {
  return (
    <div className={`${inline ? '' : 'mt-2'} text-xs text-slate-500`}>
      来源: <span className="rounded bg-white px-1.5 py-0.5 font-medium text-slate-600 ring-1 ring-slate-200">{source}</span>
    </div>
  )
}

function getDocSource(item: any): string | undefined {
  return item && typeof item === 'object' && !Array.isArray(item) ? item.source : undefined
}

function getDocValue(item: any): any {
  return item && typeof item === 'object' && !Array.isArray(item) && 'value' in item ? item.value : item
}
